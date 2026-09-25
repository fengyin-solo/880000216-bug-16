<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import PanelSection from '../components/common/PanelSection.vue'
import BatchGrid from '../components/restoration/BatchGrid.vue'
import BatchRegisterForm from '../components/restoration/BatchRegisterForm.vue'
import DuplicateEntryList from '../components/restoration/DuplicateEntryList.vue'
import EntryLogList from '../components/restoration/EntryLogList.vue'
import { batchStages, normalizeBatchCode, useBatchStore } from '../stores/batchStore'

const route = useRoute()
const { allEntries, canonicalBatches, duplicateEntries, updateBatchStatus } =
  useBatchStore()

const filters = [
  { value: 'canonical', label: '在册批次' },
  { value: 'duplicates', label: '重复记录' },
  { value: 'all', label: '全部登记' },
]

const activeFilter = ref('canonical')
const highlightKey = ref('')

// 定位原批次：切回在册视图、高亮并滚动到对应卡片
function locateBatch(code) {
  const key = normalizeBatchCode(code)
  const target = canonicalBatches.value.find((batch) => batch.key === key)
  if (!target) return
  activeFilter.value = 'canonical'
  highlightKey.value = key
  nextTick(() => {
    document
      .getElementById(`batch-card-${key}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// 从任务清单等入口带批次编码进入时，直接定位到对应档案
watch(
  () => route.query.code,
  (code) => {
    if (code) locateBatch(code)
  },
  { immediate: true },
)

function onChangeStatus({ code, status }) {
  updateBatchStatus(code, status)
}

function onRegistered(result) {
  if (result.duplicate) {
    activeFilter.value = 'duplicates'
    return
  }
  locateBatch(result.originalCode)
}
</script>

<template>
  <div class="view-stack">
    <PanelSection title="批次档案" badge="修复对象">
      <div class="filter-bar">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="[
            'filter-button',
            { 'filter-button--active': activeFilter === filter.value },
          ]"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <span
            v-if="filter.value === 'duplicates' && duplicateEntries.length"
            class="filter-count"
          >
            {{ duplicateEntries.length }}
          </span>
        </button>
      </div>

      <BatchGrid
        v-if="activeFilter === 'canonical'"
        :items="canonicalBatches"
        :stages="batchStages"
        :highlight-key="highlightKey"
        editable
        @change-status="onChangeStatus"
      />
      <DuplicateEntryList
        v-else-if="activeFilter === 'duplicates'"
        :items="duplicateEntries"
        @locate="locateBatch"
      />
      <EntryLogList v-else :items="allEntries" />
    </PanelSection>

    <PanelSection title="批次登记" badge="新批次入库">
      <BatchRegisterForm @registered="onRegistered" />
    </PanelSection>
  </div>
</template>

<style scoped>
.view-stack {
  display: grid;
  gap: 24px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(109, 80, 40, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #6a5439;
  cursor: pointer;
}

.filter-button--active {
  background: #5d4322;
  border-color: #5d4322;
  color: #fff8eb;
}

.filter-count {
  min-width: 22px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #efd0c9;
  color: #913d2f;
  font-size: 0.76rem;
  text-align: center;
}
</style>
