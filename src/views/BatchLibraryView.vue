<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PanelSection from '../components/common/PanelSection.vue'
import BatchGrid from '../components/restoration/BatchGrid.vue'
import DuplicateList from '../components/restoration/DuplicateList.vue'
import { useBatchRegistry } from '../composables/useBatchRegistry'

const route = useRoute()
const router = useRouter()
const { batches, duplicateEntries, findBatch } = useBatchRegistry()

const filters = [
  { value: 'all', label: '全部' },
  { value: 'originals', label: '原批次' },
  { value: 'duplicates', label: '重复记录' },
]

const activeFilter = ref('all')
const activeBatchKey = ref('')
const activeDuplicateId = ref('')
const activeDuplicateGroup = ref('')

const duplicateCount = computed(() => duplicateEntries.value.length)
const batchesWithDuplicates = computed(() =>
  batches.value.filter((batch) => batch.duplicates.length > 0),
)

function scrollToElement(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// 同一原批次可能有多条重复记录：优先按流水号定位单条，否则滚到该组第一条。
function scrollToActiveDuplicate(token) {
  if (!token) {
    return
  }
  const selector = /^IN-/i.test(token)
    ? `#dup-${token}`
    : `.duplicate-row[data-key="${token}"]`
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// 从任务清单或重复记录跳转过来时，按 query 解析视图与定位目标；
// 没有 query（如手动切换筛选）时保持当前视图，不强制跳转。
function applyRouteQuery() {
  const { view, code, key } = route.query

  if (Object.keys(route.query).length === 0) {
    activeBatchKey.value = ''
    activeDuplicateId.value = ''
    activeDuplicateGroup.value = ''
    return
  }

  if (view === 'duplicates') {
    activeFilter.value = 'duplicates'
    activeBatchKey.value = ''
    const queryKey = typeof key === 'string' ? key : ''
    // 流水号（IN-xxxx）精确高亮单条；批次键（A03）高亮整组。
    const isEntryId = /^IN-/i.test(queryKey)
    activeDuplicateId.value = isEntryId ? queryKey : ''
    if (!isEntryId) {
      activeDuplicateGroup.value = queryKey
    } else {
      activeDuplicateGroup.value = ''
    }
    nextTick(() =>
      scrollToActiveDuplicate(activeDuplicateId.value || activeDuplicateGroup.value),
    )
    return
  }

  activeFilter.value = 'originals'
  activeDuplicateId.value = ''
  activeDuplicateGroup.value = ''
  const target = findBatch(code)
  if (target) {
    activeBatchKey.value = target.key
    nextTick(() => scrollToElement(`batch-${target.key}`))
  } else {
    activeBatchKey.value = ''
  }
}

// 从重复记录跳回原批次：URL 使用原批次既有编码，保证链接稳定、编码不变。
function locateOriginal(key) {
  activeFilter.value = 'originals'
  activeBatchKey.value = key
  activeDuplicateId.value = ''
  activeDuplicateGroup.value = ''
  router.replace({ name: 'batches', query: { code: keyToCode(key) } })
  nextTick(() => scrollToElement(`batch-${key}`))
}

function keyToCode(key) {
  const batch = batches.value.find((item) => item.key === key)
  return batch?.code ?? key
}

function switchFilter(value) {
  activeFilter.value = value
  activeBatchKey.value = ''
  activeDuplicateId.value = ''
  activeDuplicateGroup.value = ''
  router.replace({ name: 'batches' })
}

watch(
  () => route.query,
  () => applyRouteQuery(),
)

applyRouteQuery()
</script>

<template>
  <div class="view-stack">
    <PanelSection title="批次档案" badge="修复对象">
      <div class="library-toolbar">
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="['filter-tab', { 'filter-tab--active': activeFilter === filter.value }]"
            @click="switchFilter(filter.value)"
          >
            {{ filter.label }}
            <span v-if="filter.value === 'duplicates'" class="filter-count">
              {{ duplicateCount }}
            </span>
          </button>
        </div>
        <p class="toolbar-hint">
          共 {{ batches.length }} 个原批次、{{ duplicateCount }} 条重复登记；按批次编码统一判重。
        </p>
      </div>

      <BatchGrid
        v-if="activeFilter !== 'duplicates'"
        :items="activeFilter === 'all' ? batchesWithDuplicates : batches"
        :active-key="activeBatchKey"
      />

      <div
        v-if="activeFilter === 'all' && duplicateCount"
        class="duplicate-block"
      >
        <h4 class="block-title">重复登记记录</h4>
        <DuplicateList
          :entries="duplicateEntries"
          :active-id="activeDuplicateId"
          :active-key="activeDuplicateGroup"
          @locate="locateOriginal"
        />
      </div>

      <div v-if="activeFilter === 'duplicates'" class="duplicate-block">
        <h4 class="block-title">重复登记记录（已归并到原批次，原批次编码不变）</h4>
        <DuplicateList
          :entries="duplicateEntries"
          :active-id="activeDuplicateId"
          :active-key="activeDuplicateGroup"
          @locate="locateOriginal"
        />
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
.view-stack {
  display: grid;
}

.library-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(109, 80, 40, 0.25);
  background: transparent;
  color: #6a5439;
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
}

.filter-tab--active {
  background: #5d4322;
  border-color: #5d4322;
  color: #fff8eb;
}

.filter-count {
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 0.76rem;
}

.toolbar-hint {
  margin: 0;
  color: #82684b;
  font-size: 0.84rem;
}

.duplicate-block {
  margin-top: 22px;
}

.block-title {
  margin: 0 0 12px;
  font-size: 0.98rem;
  color: #5c4528;
}
</style>
