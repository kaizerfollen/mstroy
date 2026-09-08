import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { buildTreeRows, useTreeRows } from '../../src/composables/useTreeRows'
import { TreeStore } from '../../src/store/TreeStore'
import type { LabeledTreeItem } from '../../src/types/tree'
import { createItems } from '../fixtures/items'

describe('buildTreeRows', () => {
  const store = new TreeStore<LabeledTreeItem>(createItems())
  const rows = buildTreeRows(store, store.getAll())

  it('строит по строке на каждый элемент хранилища', () => {
    expect(rows).toHaveLength(8)
  })

  it('помечает элементы с потомками категорией «Группа»', () => {
    expect(rows.find((row) => row.id === 1)?.category).toBe('Группа')
    expect(rows.find((row) => row.id === 4)?.category).toBe('Группа')
  })

  it('помечает элементы без потомков категорией «Элемент»', () => {
    expect(rows.find((row) => row.id === 7)?.category).toBe('Элемент')
    expect(rows.find((row) => row.id === 3)?.category).toBe('Элемент')
  })

  it('строит путь от корня к элементу', () => {
    expect(rows.find((row) => row.id === 7)?.path).toEqual(['1', '91064cef', '4', '7'])
    expect(rows.find((row) => row.id === 1)?.path).toEqual(['1'])
  })

  it('переносит наименование в строку', () => {
    expect(rows.find((row) => row.id === 5)?.label).toBe('Айтем 5')
  })

  it('возвращает пустой список для пустого хранилища', () => {
    const empty = new TreeStore<LabeledTreeItem>()

    expect(buildTreeRows(empty, empty.getAll())).toEqual([])
  })
})

describe('useTreeRows', () => {
  it('пересчитывает строки при изменении данных', () => {
    const store = new TreeStore<LabeledTreeItem>()
    const items = ref<LabeledTreeItem[]>([])
    const rows = useTreeRows(store, items)

    expect(rows.value).toEqual([])

    store.setItems(createItems())
    items.value = store.getAll()

    expect(rows.value).toHaveLength(8)
    expect(rows.value[0].category).toBe('Группа')
  })
})
