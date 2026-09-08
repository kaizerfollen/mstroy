import { shallowRef, triggerRef, type ShallowRef } from 'vue'

import { TreeStore } from '../store/TreeStore'
import type { TreeItem, TreeItemId } from '../types/tree'

export interface UseTreeStore<T extends TreeItem> {
  store: TreeStore<T>
  items: ShallowRef<T[]>
  setItems: (items: readonly T[]) => void
  addItem: (item: T) => void
  updateItem: (item: T) => void
  removeItem: (id: TreeItemId) => void
}

export function useTreeStore<T extends TreeItem>(initialItems: readonly T[] = []): UseTreeStore<T> {
  const store = new TreeStore<T>(initialItems)
  const items = shallowRef<T[]>(store.getAll())

  function sync(): void {
    items.value = store.getAll()
    triggerRef(items)
  }

  return {
    store,
    items,
    setItems(next: readonly T[]): void {
      store.setItems(next)
      sync()
    },
    addItem(item: T): void {
      store.addItem(item)
      sync()
    },
    updateItem(item: T): void {
      store.updateItem(item)
      sync()
    },
    removeItem(id: TreeItemId): void {
      store.removeItem(id)
      sync()
    },
  }
}
