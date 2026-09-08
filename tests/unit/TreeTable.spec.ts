import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'

import '../../src/plugins/agGrid'
import TreeTable from '../../src/components/TreeTable.vue'
import { buildTreeRows, type TreeRow } from '../../src/composables/useTreeRows'
import { TreeStore } from '../../src/store/TreeStore'
import type { LabeledTreeItem } from '../../src/types/tree'
import { createItems } from '../fixtures/items'

const store = new TreeStore<LabeledTreeItem>(createItems())
const rows = buildTreeRows(store, store.getAll())

function texts(root: HTMLElement, selector: string): string[] {
  return Array.from(root.querySelectorAll(selector)).map((node) => node.textContent?.trim() ?? '')
}

function cellText(row: HTMLElement, colId: string): string {
  return row.querySelector(`[col-id="${colId}"]`)?.textContent?.trim() ?? ''
}

/** Даёт AG Grid отрисовать строки: сетка обновляет DOM асинхронно. */
async function renderGrid(): Promise<void> {
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
  await flushPromises()
}

async function mountTable(props: { rows: TreeRow[]; loading: boolean }) {
  const host = document.createElement('div')
  host.style.height = '600px'
  host.style.width = '900px'
  document.body.appendChild(host)

  const wrapper = mount(TreeTable, { props, attachTo: host })
  await renderGrid()

  return { wrapper, root: wrapper.element as HTMLElement }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('TreeTable', () => {
  it('выводит колонки в порядке из макета', async () => {
    const { wrapper, root } = await mountTable({ rows, loading: false })

    expect(texts(root, '.ag-header-cell-text')).toEqual(['№ п\\п', 'Категория', 'Наименование'])

    wrapper.unmount()
  })

  it('показывает все строки дерева в развёрнутом виде', async () => {
    const { wrapper, root } = await mountTable({ rows, loading: false })

    expect(root.querySelectorAll('.ag-row')).toHaveLength(8)

    wrapper.unmount()
  })

  it('нумерует строки по порядку и определяет категорию по наличию потомков', async () => {
    const { wrapper, root } = await mountTable({ rows, loading: false })

    const rendered = Array.from(root.querySelectorAll<HTMLElement>('.ag-row')).map((row) => ({
      number: cellText(row, 'rowNumber'),
      category: cellText(row, 'category'),
      label: cellText(row, 'label'),
    }))

    expect(rendered).toEqual([
      { number: '1', category: 'Группа', label: 'Айтем 1' },
      { number: '2', category: 'Группа', label: 'Айтем 2' },
      { number: '3', category: 'Группа', label: 'Айтем 4' },
      { number: '4', category: 'Элемент', label: 'Айтем 7' },
      { number: '5', category: 'Элемент', label: 'Айтем 8' },
      { number: '6', category: 'Элемент', label: 'Айтем 5' },
      { number: '7', category: 'Элемент', label: 'Айтем 6' },
      { number: '8', category: 'Элемент', label: 'Айтем 3' },
    ])

    wrapper.unmount()
  })

  it('пересчитывает номера строк после сворачивания группы', async () => {
    const { wrapper, root } = await mountTable({ rows, loading: false })

    const numberOf = (label: string): string =>
      Array.from(root.querySelectorAll<HTMLElement>('.ag-row'))
        .filter((row) => cellText(row, 'label') === label)
        .map((row) => cellText(row, 'rowNumber'))
        .at(-1) ?? ''

    expect(numberOf('Айтем 5')).toBe('6')

    const groupRow = root.querySelectorAll<HTMLElement>('.ag-row')[2]
    groupRow.querySelector<HTMLElement>('.ag-group-expanded')?.click()
    await renderGrid()

    expect(numberOf('Айтем 5')).toBe('4')
    expect(numberOf('Айтем 3')).toBe('6')

    wrapper.unmount()
  })

  it('делает разворачиваемыми только строки с потомками', async () => {
    const { wrapper, root } = await mountTable({ rows, loading: false })

    expect(root.querySelectorAll('.ag-cell-expandable')).toHaveLength(3)

    wrapper.unmount()
  })

  it('показывает индикатор загрузки, пока данных нет', async () => {
    const { wrapper, root } = await mountTable({ rows: [], loading: true })

    expect(root.querySelector('.table-loading')).not.toBeNull()
    expect(root.textContent).toContain('Загружаем данные')

    wrapper.unmount()
  })

  it('скрывает индикатор и рисует строки после загрузки данных', async () => {
    const { wrapper, root } = await mountTable({ rows: [], loading: true })

    await wrapper.setProps({ rows, loading: false })
    await renderGrid()

    expect(root.querySelector('.table-loading')).toBeNull()
    expect(root.querySelectorAll('.ag-row')).toHaveLength(8)

    wrapper.unmount()
  })
})
