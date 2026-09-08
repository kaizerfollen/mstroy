import type { TreeItem, TreeItemId } from '../types/tree'

export class TreeStore<T extends TreeItem = TreeItem> {
  private readonly itemsById = new Map<TreeItemId, T>()

  private readonly childrenByParentId = new Map<TreeItemId | null, T[]>()

  private allItemsCache: T[] | null = null

  constructor(items: readonly T[] = []) {
    this.setItems(items)
  }

  getAll(): T[] {
    if (!this.allItemsCache) {
      this.allItemsCache = Array.from(this.itemsById.values())
    }

    return this.allItemsCache
  }

  getItem(id: TreeItemId): T | undefined {
    return this.itemsById.get(id)
  }

  getChildren(id: TreeItemId | null): T[] {
    return this.childrenByParentId.get(id) ?? []
  }

  getAllChildren(id: TreeItemId): T[] {
    const result: T[] = []
    const directChildren = this.childrenByParentId.get(id)

    if (!directChildren) {
      return result
    }

    for (let i = 0; i < directChildren.length; i += 1) {
      result.push(directChildren[i])
    }

    for (let cursor = 0; cursor < result.length; cursor += 1) {
      const nextLevel = this.childrenByParentId.get(result[cursor].id)

      if (!nextLevel) {
        continue
      }

      for (let i = 0; i < nextLevel.length; i += 1) {
        result.push(nextLevel[i])
      }
    }

    return result
  }

  getAllParents(id: TreeItemId): T[] {
    const path: T[] = []
    let current = this.itemsById.get(id)

    while (current) {
      path.push(current)

      const parentId = current.parent

      if (parentId === null || parentId === undefined) {
        break
      }

      if (path.length > this.itemsById.size) {
        break
      }

      current = this.itemsById.get(parentId)
    }

    return path
  }

  setItems(items: readonly T[]): void {
    this.itemsById.clear()
    this.childrenByParentId.clear()
    this.allItemsCache = null

    for (let i = 0; i < items.length; i += 1) {
      this.link(items[i])
    }
  }

  addItem(item: T): void {
    if (this.itemsById.has(item.id)) {
      this.updateItem(item)

      return
    }

    this.link(item)

    this.allItemsCache?.push(item)
  }

  removeItem(id: TreeItemId): void {
    const target = this.itemsById.get(id)

    if (!target) {
      return
    }

    this.unlinkFromParent(target)

    const queue: T[] = [target]

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const node = queue[cursor]

      this.itemsById.delete(node.id)

      const children = this.childrenByParentId.get(node.id)

      if (!children) {
        continue
      }

      this.childrenByParentId.delete(node.id)

      for (let i = 0; i < children.length; i += 1) {
        queue.push(children[i])
      }
    }

    this.allItemsCache = null
  }

  updateItem(item: T): void {
    const current = this.itemsById.get(item.id)

    if (!current) {
      this.addItem(item)

      return
    }

    this.itemsById.set(item.id, item)

    if (current.parent === item.parent) {
      const siblings = this.childrenByParentId.get(current.parent)
      const index = siblings ? siblings.indexOf(current) : -1

      if (siblings && index !== -1) {
        siblings[index] = item
      } else {
        this.pushChild(item)
      }
    } else {
      this.unlinkFromParent(current)
      this.pushChild(item)
    }

    this.allItemsCache = null
  }

  private link(item: T): void {
    this.itemsById.set(item.id, item)
    this.pushChild(item)
  }

  private pushChild(item: T): void {
    const siblings = this.childrenByParentId.get(item.parent)

    if (!siblings) {
      this.childrenByParentId.set(item.parent, [item])
    } else {
      siblings.push(item)
    }
  }

  private unlinkFromParent(item: T): void {
    const siblings = this.childrenByParentId.get(item.parent)

    if (!siblings) {
      return
    }

    const index = siblings.indexOf(item)

    if (index !== -1) {
      siblings.splice(index, 1)
    }

    if (siblings.length === 0) {
      this.childrenByParentId.delete(item.parent)
    }
  }
}

export default TreeStore
