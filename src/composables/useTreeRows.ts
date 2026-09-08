import { computed, type ComputedRef, type Ref } from 'vue'

import type { TreeStore } from '../store/TreeStore'
import type { LabeledTreeItem, TreeItemId } from '../types/tree'

export const CATEGORY_GROUP = 'Группа'
export const CATEGORY_LEAF = 'Элемент'

export type RowCategory = typeof CATEGORY_GROUP | typeof CATEGORY_LEAF

export interface TreeRow {
  id: TreeItemId
  label: string
  category: RowCategory
  path: string[]
}

export function buildTreeRows(
  store: TreeStore<LabeledTreeItem>,
  items: readonly LabeledTreeItem[],
): TreeRow[] {
  const rows: TreeRow[] = new Array(items.length)

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    const chain = store.getAllParents(item.id)
    const path: string[] = new Array(chain.length)

    for (let j = 0; j < chain.length; j += 1) {
      path[chain.length - 1 - j] = String(chain[j].id)
    }

    rows[i] = {
      id: item.id,
      label: item.label,
      category: store.getChildren(item.id).length > 0 ? CATEGORY_GROUP : CATEGORY_LEAF,
      path,
    }
  }

  return rows
}

export function useTreeRows(
  store: TreeStore<LabeledTreeItem>,
  items: Ref<LabeledTreeItem[]>,
): ComputedRef<TreeRow[]> {
  return computed(() => buildTreeRows(store, items.value))
}
