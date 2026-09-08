import { describe, expect, it } from 'vitest'

import { TreeStore } from '../../src/store/TreeStore'
import type { TreeItem, TreeItemId } from '../../src/types/tree'

const ITEMS_COUNT = 100_000
const BRANCHING_FACTOR = 5

interface PerfItem extends TreeItem {
  label: string
}

/**
 * Генерирует широкое и глубокое дерево: каждый элемент получает не более
 * BRANCHING_FACTOR потомков, id чередуются между числом и строкой.
 */
function createLargeTree(size: number): PerfItem[] {
  const items: PerfItem[] = new Array(size)

  for (let index = 0; index < size; index += 1) {
    const id: TreeItemId = index % 2 === 0 ? index : `id-${index}`
    const parentIndex = index === 0 ? -1 : Math.floor((index - 1) / BRANCHING_FACTOR)
    const parent: TreeItemId | null =
      parentIndex < 0 ? null : parentIndex % 2 === 0 ? parentIndex : `id-${parentIndex}`

    items[index] = { id, parent, label: `Айтем ${index}` }
  }

  return items
}

function measure(label: string, action: () => void): number {
  const start = performance.now()

  action()

  const duration = performance.now() - start

  // eslint-disable-next-line no-console
  console.log(`${label}: ${duration.toFixed(2)} мс`)

  return duration
}

describe(`TreeStore: производительность на ${ITEMS_COUNT} элементах`, () => {
  const items = createLargeTree(ITEMS_COUNT)
  const store = new TreeStore<PerfItem>(items)
  const deepestId = items[ITEMS_COUNT - 1].id

  it('setItems строится за один проход', () => {
    const duration = measure('setItems', () => {
      store.setItems(items)
    })

    expect(duration).toBeLessThan(500)
  })

  it('getAll отдаёт закэшированный массив', () => {
    store.getAll()

    const duration = measure('getAll (кэш, 1000 вызовов)', () => {
      for (let i = 0; i < 1000; i += 1) {
        store.getAll()
      }
    })

    expect(store.getAll()).toHaveLength(ITEMS_COUNT)
    expect(duration).toBeLessThan(50)
  })

  it('getItem работает за константное время', () => {
    const duration = measure('getItem (100 000 вызовов)', () => {
      for (let i = 0; i < ITEMS_COUNT; i += 1) {
        store.getItem(items[i].id)
      }
    })

    expect(duration).toBeLessThan(200)
  })

  it('getChildren работает за константное время', () => {
    const duration = measure('getChildren (100 000 вызовов)', () => {
      for (let i = 0; i < ITEMS_COUNT; i += 1) {
        store.getChildren(items[i].id)
      }
    })

    expect(duration).toBeLessThan(200)
  })

  it('getAllChildren от корня обходит всё дерево', () => {
    let result: PerfItem[] = []

    const duration = measure('getAllChildren (корень)', () => {
      result = store.getAllChildren(items[0].id)
    })

    expect(result).toHaveLength(ITEMS_COUNT - 1)
    expect(duration).toBeLessThan(200)
  })

  it('getAllParents зависит только от глубины элемента', () => {
    let path: PerfItem[] = []

    const duration = measure('getAllParents (10 000 вызовов от глубокого узла)', () => {
      for (let i = 0; i < 10_000; i += 1) {
        path = store.getAllParents(deepestId)
      }
    })

    expect(path.length).toBeGreaterThan(1)
    expect(duration).toBeLessThan(200)
  })

  it('addItem добавляет элементы за константное время', () => {
    const duration = measure('addItem (10 000 вставок)', () => {
      for (let i = 0; i < 10_000; i += 1) {
        store.addItem({ id: `new-${i}`, parent: items[0].id, label: `Новый ${i}` })
      }
    })

    expect(store.getAll()).toHaveLength(ITEMS_COUNT + 10_000)
    expect(duration).toBeLessThan(200)
  })

  it('updateItem обновляет элементы за константное время', () => {
    const duration = measure('updateItem (10 000 обновлений)', () => {
      for (let i = 0; i < 10_000; i += 1) {
        store.updateItem({ id: `new-${i}`, parent: items[0].id, label: `Обновлён ${i}` })
      }
    })

    expect(store.getItem('new-0')?.label).toBe('Обновлён 0')
    expect(duration).toBeLessThan(300)
  })

  it('removeItem удаляет поддерево за время, пропорциональное его размеру', () => {
    const fresh = new TreeStore<PerfItem>(createLargeTree(ITEMS_COUNT))

    const duration = measure('removeItem (всё дерево от корня)', () => {
      fresh.removeItem(items[0].id)
    })

    expect(fresh.getAll()).toHaveLength(0)
    expect(duration).toBeLessThan(300)
  })
})
