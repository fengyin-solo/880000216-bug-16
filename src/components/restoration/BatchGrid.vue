<script setup>
import { riskMeta } from '../../utils/restorationFormatters'

defineProps({
  items: {
    type: Array,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  stages: {
    type: Array,
    default: () => [],
  },
  highlightKey: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change-status'])

function onStatusChange(code, event) {
  emit('change-status', { code, status: event.target.value })
}
</script>

<template>
  <div class="batch-grid">
    <article
      v-for="item in items"
      :id="`batch-card-${item.key ?? item.code}`"
      :key="item.key ?? item.code"
      :class="[
        'batch-card',
        { 'batch-card--highlight': (item.key ?? item.code) === highlightKey },
      ]"
    >
      <div class="batch-head">
        <small>批次 {{ item.code }}</small>
        <span :class="['risk-pill', `risk-pill--${riskMeta(item.risk).tone}`]">
          {{ riskMeta(item.risk).label }}
        </span>
      </div>
      <h4>{{ item.title }}</h4>
      <p>页码：{{ item.pages }}</p>
      <p v-if="!editable">阶段：{{ item.status }}</p>
      <label v-else class="status-field">
        阶段：
        <select :value="item.status" @change="onStatusChange(item.code, $event)">
          <option v-for="stage in stages" :key="stage" :value="stage">
            {{ stage }}
          </option>
        </select>
      </label>
      <small>{{ item.note }}</small>
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
  padding: 18px;
  border-radius: 20px;
  background: #f4ebda;
  border: 1px solid rgba(109, 80, 40, 0.08);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.batch-card--highlight {
  border-color: #5d4322;
  box-shadow: 0 0 0 3px rgba(93, 67, 34, 0.18);
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
  margin-top: 10px;
}

p,
small {
  color: #6a5439;
}

p + p,
p + small,
p + .status-field,
.status-field + small {
  margin-top: 6px;
}

.status-field {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6a5439;
}

.status-field select {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(109, 80, 40, 0.24);
  background: rgba(255, 255, 255, 0.85);
  color: #4d3a22;
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

@media (max-width: 960px) {
  .batch-grid {
    grid-template-columns: 1fr;
  }
}
</style>
