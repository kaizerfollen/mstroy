import { beforeEach, describe, expect, it } from 'vitest'

import { TreeStore } from '../../src/store/TreeStore'
import type { LabeledTreeItem, TreeItemId } from '../../src/types/tree'
import { createItems } from '../fixtures/items'

function ids(items: readonly LabeledTreeItem[]): TreeItemId[] {
  return items.map((item) => item.id)
}

describe('TreeStore', () => {
  let store: TreeStore<LabeledTreeItem>

  beforeEach(() => {
    store = new TreeStore<LabeledTreeItem>(createItems())
  })

  describe('конструктор', () => {
    it('создаёт пустое хранилище без аргументов', () => {
      expect(new TreeStore().getAll()).toEqual([])
    })

    it('принимает массив элементов', () => {
      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('getAll', () => {
    it('возвращает все элементы в исходном порядке', () => {
      expect(ids(store.getAll())).toEqual([1, '91064cef', 3, 4, 5, 6, 7, 8])
    })

    it('возвращает те же объекты, что были переданы (без копирования)', () => {
      const source = createItems()
      const localStore = new TreeStore(source)

      expect(localStore.getAll()[0]).toBe(source[0])
    })
  })

  describe('getItem', () => {
    it('находит элемент по числовому id', () => {
      expect(store.getItem(4)).toEqual({ id: 4, parent: '91064cef', label: 'Айтем 4' })
    })

    it('находит элемент по строковому id', () => {
      expect(store.getItem('91064cef')?.label).toBe('Айтем 2')
    })

    it('различает число и строку с одинаковым написанием', () => {
      expect(store.getItem('4')).toBeUndefined()
    })

    it('возвращает undefined для несуществующего id', () => {
      expect(store.getItem('нет такого')).toBeUndefined()
    })
  })

  describe('getChildren', () => {
    it('возвращает прямых потомков корневого элемента', () => {
      expect(ids(store.getChildren(1))).toEqual(['91064cef', 3])
    })

    it('возвращает прямых потомков по строковому id', () => {
      expect(ids(store.getChildren('91064cef'))).toEqual([4, 5, 6])
    })

    it('возвращает пустой массив, если потомков нет', () => {
      expect(store.getChildren(8)).toEqual([])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getChildren(9999)).toEqual([])
    })

    it('позволяет получить корневые элементы по parent = null', () => {
      expect(ids(store.getChildren(null))).toEqual([1])
    })
  })

  describe('getAllChildren', () => {
    it('возвращает всё поддерево до самого глубокого уровня', () => {
      expect(ids(store.getAllChildren('91064cef')).sort()).toEqual([4, 5, 6, 7, 8].sort())
    })

    it('возвращает всех потомков корня', () => {
      expect(store.getAllChildren(1)).toHaveLength(7)
    })

    it('возвращает пустой массив для листа', () => {
      expect(store.getAllChildren(7)).toEqual([])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getAllChildren('нет такого')).toEqual([])
    })

    it('обходит дерево по уровням: сначала прямые потомки', () => {
      expect(ids(store.getAllChildren(1))).toEqual(['91064cef', 3, 4, 5, 6, 7, 8])
    })
  })

  describe('getAllParents', () => {
    it('возвращает путь от элемента к корню в правильном порядке', () => {
      expect(ids(store.getAllParents(7))).toEqual([7, 4, '91064cef', 1])
    })

    it('для корневого элемента возвращает только его самого', () => {
      expect(ids(store.getAllParents(1))).toEqual([1])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getAllParents(9999)).toEqual([])
    })

    it('не зацикливается на некорректных данных', () => {
      const broken = new TreeStore([
        { id: 'a', parent: 'b' },
        { id: 'b', parent: 'a' },
      ])

      expect(broken.getAllParents('a').length).toBeLessThanOrEqual(3)
    })
  })

  describe('setItems', () => {
    it('полностью заменяет содержимое хранилища', () => {
      store.setItems([{ id: 'new', parent: null, label: 'Новый' }])

      expect(ids(store.getAll())).toEqual(['new'])
      expect(store.getItem(1)).toBeUndefined()
      expect(store.getChildren(1)).toEqual([])
    })

    it('позволяет очистить хранилище пустым массивом', () => {
      store.setItems([])

      expect(store.getAll()).toEqual([])
    })
  })

  describe('addItem', () => {
    it('добавляет элемент в общую структуру', () => {
      store.addItem({ id: 9, parent: 3, label: 'Айтем 9' })

      expect(store.getItem(9)?.label).toBe('Айтем 9')
      expect(ids(store.getChildren(3))).toEqual([9])
      expect(store.getAll()).toHaveLength(9)
    })

    it('добавленный элемент попадает в путь до корня', () => {
      store.addItem({ id: 9, parent: 7, label: 'Айтем 9' })

      expect(ids(store.getAllParents(9))).toEqual([9, 7, 4, '91064cef', 1])
    })

    it('поддерживает элемент, родитель которого добавлен позже', () => {
      const empty = new TreeStore<LabeledTreeItem>()

      empty.addItem({ id: 2, parent: 1, label: 'Потомок' })
      empty.addItem({ id: 1, parent: null, label: 'Родитель' })

      expect(ids(empty.getChildren(1))).toEqual([2])
      expect(ids(empty.getAllParents(2))).toEqual([2, 1])
    })

    it('обновляет элемент, если id уже занят', () => {
      store.addItem({ id: 3, parent: 1, label: 'Айтем 3 (новый)' })

      expect(store.getAll()).toHaveLength(8)
      expect(store.getItem(3)?.label).toBe('Айтем 3 (новый)')
    })
  })

  describe('removeItem', () => {
    it('удаляет элемент вместе со всеми потомками', () => {
      store.removeItem(4)

      expect(ids(store.getAll())).toEqual([1, '91064cef', 3, 5, 6])
      expect(store.getItem(7)).toBeUndefined()
      expect(store.getItem(8)).toBeUndefined()
    })

    it('убирает элемент из списка потомков родителя', () => {
      store.removeItem(4)

      expect(ids(store.getChildren('91064cef'))).toEqual([5, 6])
    })

    it('удаляет всё дерево при удалении корня', () => {
      store.removeItem(1)

      expect(store.getAll()).toEqual([])
      expect(store.getChildren(null)).toEqual([])
    })

    it('удаляет лист, не задевая соседей', () => {
      store.removeItem(7)

      expect(ids(store.getChildren(4))).toEqual([8])
    })

    it('ничего не меняет для несуществующего id', () => {
      store.removeItem('нет такого')

      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('updateItem', () => {
    it('актуализирует элемент в хранилище', () => {
      store.updateItem({ id: 5, parent: '91064cef', label: 'Айтем 5 (обновлён)' })

      expect(store.getItem(5)?.label).toBe('Айтем 5 (обновлён)')
      expect(store.getAll()).toHaveLength(8)
    })

    it('обновлённый объект виден и в списке потомков', () => {
      store.updateItem({ id: 5, parent: '91064cef', label: 'Айтем 5 (обновлён)' })

      expect(store.getChildren('91064cef')[1].label).toBe('Айтем 5 (обновлён)')
    })

    it('переносит элемент в другую ветку при смене parent', () => {
      store.updateItem({ id: 5, parent: 3, label: 'Айтем 5' })

      expect(ids(store.getChildren('91064cef'))).toEqual([4, 6])
      expect(ids(store.getChildren(3))).toEqual([5])
      expect(ids(store.getAllParents(5))).toEqual([5, 3, 1])
    })

    it('переносит элемент вместе с его потомками', () => {
      store.updateItem({ id: 4, parent: 3, label: 'Айтем 4' })

      expect(ids(store.getAllChildren(4))).toEqual([7, 8])
      expect(ids(store.getAllParents(7))).toEqual([7, 4, 3, 1])
    })

    it('добавляет элемент, если его ещё нет в хранилище', () => {
      store.updateItem({ id: 42, parent: 1, label: 'Айтем 42' })

      expect(store.getItem(42)?.label).toBe('Айтем 42')
      expect(store.getAll()).toHaveLength(9)
    })
  })

  describe('согласованность getAll после мутаций', () => {
    it('отражает добавление, удаление и обновление', () => {
      expect(store.getAll()).toHaveLength(8)

      store.addItem({ id: 9, parent: 1, label: 'Айтем 9' })
      expect(ids(store.getAll())).toContain(9)

      store.removeItem('91064cef')
      expect(ids(store.getAll())).toEqual([1, 3, 9])

      store.updateItem({ id: 3, parent: 9, label: 'Айтем 3' })
      expect(ids(store.getAll())).toEqual([1, 3, 9])
      expect(ids(store.getChildren(9))).toEqual([3])
    })
  })
})
