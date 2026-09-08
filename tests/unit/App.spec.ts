import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../src/App.vue'
import TreeTable from '../../src/components/TreeTable.vue'
import { createItems } from '../fixtures/items'

const fetchItems = vi.fn()

vi.mock('../../src/api/itemsApi', () => ({
  FETCH_DELAY_MS: 2000,
  ITEMS_URL: '/data/items.json',
  fetchItems: (): Promise<unknown> => fetchItems(),
}))

const globalStubs = {
  stubs: {
    TreeTable: {
      name: 'TreeTable',
      props: ['rows', 'loading'],
      template: '<div class="tree-table-stub" />',
    },
  },
}

describe('App', () => {
  beforeEach(() => {
    fetchItems.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('стартует с пустым хранилищем и состоянием загрузки', () => {
    fetchItems.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(App, { global: globalStubs })
    const table = wrapper.findComponent(TreeTable)

    expect(table.props('loading')).toBe(true)
    expect(table.props('rows')).toEqual([])
    expect(wrapper.text()).toContain('Загружаем данные')
  })

  it('подставляет загруженные данные в таблицу без перезагрузки страницы', async () => {
    fetchItems.mockResolvedValue(createItems())

    const wrapper = mount(App, { global: globalStubs })
    await flushPromises()

    const table = wrapper.findComponent(TreeTable)

    expect(table.props('loading')).toBe(false)
    expect(table.props('rows')).toHaveLength(8)
    expect(wrapper.text()).toContain('Элементов в хранилище: 8')
  })

  it('передаёт в таблицу строки с категорией и путём', async () => {
    fetchItems.mockResolvedValue(createItems())

    const wrapper = mount(App, { global: globalStubs })
    await flushPromises()

    const rows = wrapper.findComponent(TreeTable).props('rows') as Array<{
      id: string | number
      category: string
      path: string[]
    }>

    expect(rows[0]).toMatchObject({ id: 1, category: 'Группа', path: ['1'] })
    expect(rows.at(-1)).toMatchObject({ category: 'Элемент', path: ['1', '91064cef', '4', '8'] })
  })
})
