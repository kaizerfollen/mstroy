import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FETCH_DELAY_MS, fetchItems, ITEMS_URL } from '../../src/api/itemsApi'
import { createItems } from '../fixtures/items'

describe('fetchItems', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('запрашивает json-файл с данными', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => createItems() })
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchItems()
    await vi.advanceTimersByTimeAsync(FETCH_DELAY_MS)
    await promise

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(ITEMS_URL)
    expect(ITEMS_URL).toContain('data/items.json')
  })

  it('возвращает данные не раньше, чем через 2 секунды', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => createItems() }))

    let resolved = false
    const promise = fetchItems().then((items) => {
      resolved = true

      return items
    })

    await vi.advanceTimersByTimeAsync(FETCH_DELAY_MS - 1)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await expect(promise).resolves.toHaveLength(8)
    expect(resolved).toBe(true)
  })
})
