import type { ColDef, ValueGetterParams } from 'ag-grid-community'

import CategoryCell from './CategoryCell.vue'
import { CATEGORY_GROUP, type TreeRow } from '../composables/useTreeRows'

export const ROW_NUMBER_COLUMN_ID = 'rowNumber'
export const CATEGORY_COLUMN_ID = 'category'
export const LABEL_COLUMN_ID = 'label'

function rowNumberValueGetter(params: ValueGetterParams<TreeRow>): number {
  return (params.node?.rowIndex ?? 0) + 1
}

function isGroupRow(data: TreeRow | undefined): boolean {
  return data?.category === CATEGORY_GROUP
}

export const defaultColDef: ColDef<TreeRow> = {
  sortable: false,
  filter: false,
  resizable: true,
  suppressMovable: true,
}

export function createColumnDefs(): ColDef<TreeRow>[] {
  return [
    {
      colId: ROW_NUMBER_COLUMN_ID,
      headerName: '№ п\\п',
      width: 96,
      minWidth: 80,
      valueGetter: rowNumberValueGetter,
      cellClass: 'cell-row-number',
    },
    {
      colId: CATEGORY_COLUMN_ID,
      headerName: 'Категория',
      field: 'category',
      flex: 1,
      minWidth: 240,
      showRowGroup: true,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: CategoryCell,
      },
      cellClass: (params) => (isGroupRow(params.data) ? 'cell-category is-group' : 'cell-category'),
    },
    {
      colId: LABEL_COLUMN_ID,
      headerName: 'Наименование',
      field: 'label',
      flex: 1,
      minWidth: 220,
      cellClass: (params) => (isGroupRow(params.data) ? 'cell-label is-group' : 'cell-label'),
    },
  ]
}
