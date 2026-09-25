<script setup>
import { useRouter } from 'vue-router'

import { riskMeta } from '../../utils/restorationFormatters'
import StageControl from './StageControl.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeKey: {
    type: String,
    default: '',
  },
})

const router = useRouter()

function showDuplicates(key) {
  router.push({ name: 'batches', query: { view: 'duplicates', key } })
}
</script>

<template>
  <div class="batch-grid">
    <article
      v-for="item in items"
      :id="`batch-${item.key}`"
      :key="item.key"
      :class="['batch-card', { 'batch-card--active': item.key === activeKey }]"
    >
      <div class="batch-head">
        <small>批次 {{ item.code }}</small>
        <span :class="['risk-pill', `risk-pill--${riskMeta(item.risk).tone}`]">
          {{ riskMeta(item.risk).label }}
        </span>
      </div>
      <h4>{{ item.title }}</h4>
      <p>页码：{{ item.pages || '待补充' }}</p>
      <StageControl :code="item.code" :status="item.status" />
      <small class="batch-note">{{ item.note }}</small>
      <button
        v-if="item.duplicates.length"
        type="button"
        class="dup-chip"
        @click="showDuplicates(item.key)"
      >
        {{ item.duplicates.length }} 条重复登记
      </button>
    </article>
  </div>
</template>

<style scoped>
.batch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.batch-card {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 18px;
  border-radius: 20px;
  background: #f4ebda;
  border: 1px solid rgba(109, 80, 40, 0.08);
  scroll-margin-top: 24px;
}

.batch-card--active {
  border-color: #8b6314;
  box-shadow: 0 0 0 3px rgba(139, 99, 20, 0.22);
}

.batch-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

h4,
p,
small {
  margin: 0;
}

h4 {
  font-size: 1.04rem;
}

p,
small {
  color: #6a5439;
}

.batch-note {
  margin-top: 2px;
}

.risk-pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
}

.risk-pill--high {
  background: #efd0c9;
  color: #913d2f;
}

.risk-pill--medium {
  background: #f6e5b9;
  color: #8b6314;
}

.risk-pill--low {
  background: #d9ead9;
  color: #366338;
}

.dup-chip {
  justify-self: start;
  margin-top: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: 999px;
  background: #efe2ca;
  color: #7e6038;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.dup-chip:hover {
  background: #e4d2b2;
}

@media (max-width: 960px) {
  .batch-grid {
    grid-template-columns: 1fr;
  }
}
</style>
