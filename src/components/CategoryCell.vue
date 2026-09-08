<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community'

import type { TreeRow } from '../composables/useTreeRows'

defineProps<{ params: ICellRendererParams<TreeRow> }>()
</script>

<template>
  <span>{{ params.data?.category ?? '' }}</span>
</template>
