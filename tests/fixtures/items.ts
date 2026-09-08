import type { LabeledTreeItem } from '../../src/types/tree'

/** Набор данных из тестового задания. */
export const items: LabeledTreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },

  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },

  { id: 4, parent: '91064cef', label: 'Айтем 4' },
  { id: 5, parent: '91064cef', label: 'Айтем 5' },
  { id: 6, parent: '91064cef', label: 'Айтем 6' },

  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

/** Свежая копия набора: тесты не должны влиять друг на друга через ссылки. */
export function createItems(): LabeledTreeItem[] {
  return items.map((item) => ({ ...item }))
}
