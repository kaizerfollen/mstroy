import { describe, expect, it } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'

import { useTreeStore } from '../../src/composables/useTreeStore'
import type { LabeledTreeItem } from '../../src/types/tree'
import { createItems } from '../fixtures/items'

describe('useTreeStore', () => {
  it('создаёт пустое хранилище по умолчанию', () => {
    const { items, store } = useTreeStore<LabeledTreeItem>()

    expect(items.value).toEqual([])
    expect(store.getAll()).toEqual([])
  })

  it('обновляет реактивный список после setItems', async () => {
    const { items, setItems } = useTreeStore<LabeledTreeItem>()
    const count = computed(() => items.value.length)

    setItems(createItems())
    await nextTick()

    expect(count.value).toBe(8)
  })

  it('оповещает подписчиков при каждой мутации', async () => {
    const { items, setItems, addItem, updateItem, removeItem } = useTreeStore<LabeledTreeItem>()
    const calls = ref(0)

    watch(items, () => {
      calls.value += 1
    })

    setItems(createItems())
    await nextTick()

    addItem({ id: 9, parent: 1, label: 'Айтем 9' })
    await nextTick()

    updateItem({ id: 9, parent: 3, label: 'Айтем 9 (обновлён)' })
    await nextTick()

    removeItem(9)
    await nextTick()

    expect(calls.value).toBe(4)
  })

  it('держит содержимое ref в соответствии с хранилищем', async () => {
    const { items, store, setItems, removeItem } = useTreeStore<LabeledTreeItem>()

    setItems(createItems())
    removeItem(4)
    await nextTick()

    expect(items.value).toEqual(store.getAll())
    expect(items.value.map((item) => item.id)).toEqual([1, '91064cef', 3, 5, 6])
  })
})
