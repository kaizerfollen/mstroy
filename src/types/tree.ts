export type TreeItemId = string | number

export interface TreeItem {
  id: TreeItemId
  parent: TreeItemId | null
  [key: string]: unknown
}

export interface LabeledTreeItem extends TreeItem {
  label: string
}
