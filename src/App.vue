<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import TreeTable from './components/TreeTable.vue'
import { fetchItems } from './api/itemsApi'
import { useTreeStore } from './composables/useTreeStore'
import { useTreeRows } from './composables/useTreeRows'
import type { LabeledTreeItem } from './types/tree'

const { store, items, setItems } = useTreeStore<LabeledTreeItem>()
const rows = useTreeRows(store, items)
const isLoading = ref(true)

const status = computed(() =>
  isLoading.value ? 'Загружаем данные' : `Элементов в хранилище: ${items.value.length}`,
)

onMounted(async () => {
  setItems(await fetchItems())
  isLoading.value = false
})
</script>

<template>
  <main class="page">
    <header class="page__header">
      <h1 class="page__title">Структура элементов</h1>
      <p class="page__status">{{ status }}</p>
    </header>

    <TreeTable :rows="rows" :loading="isLoading" />
  </main>
</template>
