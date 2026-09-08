import type { LabeledTreeItem } from '../types/tree'

export const ITEMS_URL = `${import.meta.env.BASE_URL}data/items.json`

export const FETCH_DELAY_MS = 2000

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function fetchItems(): Promise<LabeledTreeItem[]> {
  const [response] = await Promise.all([fetch(ITEMS_URL), delay(FETCH_DELAY_MS)])

  return (await response.json()) as LabeledTreeItem[]
}
