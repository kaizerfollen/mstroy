<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { shallowRef } from 'vue'
import type { GetDataPath, GetRowIdParams, GridApi, GridReadyEvent } from 'ag-grid-community'

import { createColumnDefs, defaultColDef, ROW_NUMBER_COLUMN_ID } from './treeTableColumns'
import type { TreeRow } from '../composables/useTreeRows'

const props = defineProps<{
  rows: TreeRow[]
  loading: boolean
}>()

const columnDefs = createColumnDefs()
const gridApi = shallowRef<GridApi<TreeRow> | null>(null)

const overlayLoadingTemplate = `
  <div class="table-loading" role="status" aria-live="polite">
    <span class="table-loading__spinner" aria-hidden="true"></span>
    <span class="table-loading__text">Загружаем данные</span>
  </div>
`

const getDataPath: GetDataPath<TreeRow> = (data) => data.path

const getRowId = (params: GetRowIdParams<TreeRow>): string => String(params.data.id)

function onGridReady(event: GridReadyEvent<TreeRow>): void {
  gridApi.value = event.api
}

function refreshRowNumbers(): void {
  gridApi.value?.refreshCells({ columns: [ROW_NUMBER_COLUMN_ID], force: true })
}
</script>

<template>
  <ag-grid-vue
    class="ag-theme-quartz tree-table"
    :column-defs="columnDefs"
    :default-col-def="defaultColDef"
    :row-data="props.rows"
    :loading="props.loading"
    :tree-data="true"
    group-display-type="custom"
    :get-data-path="getDataPath"
    :get-row-id="getRowId"
    :group-default-expanded="-1"
    :animate-rows="true"
    :suppress-cell-focus="true"
    :header-height="44"
    :row-height="44"
    :overlay-loading-template="overlayLoadingTemplate"
    @grid-ready="onGridReady"
    @model-updated="refreshRowNumbers"
  />
</template>
