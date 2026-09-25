<script setup>
import { formatReceivedAt } from '../../utils/restorationFormatters'

defineProps({
  entries: {
    type: Array,
    required: true,
  },
  // 单条流水高亮（从重复列表内部跳转时使用）
  activeId: {
    type: String,
    default: '',
  },
  // 整组高亮（从某张原批次卡片跳入时使用）
  activeKey: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['locate'])
</script>

<template>
  <div class="duplicate-list">
    <p v-if="entries.length === 0" class="dup-empty">
      当前没有重复登记记录。
    </p>
    <article
      v-for="entry in entries"
      :key="entry.id"
      :id="`dup-${entry.id}`"
      :data-key="entry.key"
      :class="[
        'duplicate-row',
        { 'duplicate-row--active': entry.id === activeId || entry.key === activeKey },
      ]"
    >
      <div class="dup-main">
        <div class="dup-head">
          <strong>流水 {{ entry.id }}</strong>
          <span class="dup-source">{{ entry.source }}</span>
        </div>
        <p>登记编码：<code>{{ entry.rawCode }}</code></p>
        <p>登记时间：{{ formatReceivedAt(entry.receivedAt) }}</p>
        <p v-if="entry.note" class="dup-note">{{ entry.note }}</p>
      </div>
      <div class="dup-aside">
        <span>归并到原批次 <code>{{ entry.originalCode }}</code></span>
        <button type="button" class="locate-btn" @click="emit('locate', entry.key)">
          定位原批次
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.duplicate-list {
  display: grid;
  gap: 12px;
}

.duplicate-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7efdf;
  border: 1px solid rgba(109, 80, 40, 0.12);
  scroll-margin-top: 24px;
}

.duplicate-row--active {
  border-color: #8b6314;
  box-shadow: 0 0 0 3px rgba(139, 99, 20, 0.22);
}

.dup-head {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dup-source {
  padding: 3px 9px;
  border-radius: 999px;
  background: #efe2ca;
  color: #7e6038;
  font-size: 0.76rem;
}

p {
  margin: 4px 0 0;
  color: #6a5439;
  font-size: 0.88rem;
}

.dup-note {
  font-size: 0.84rem;
}

code {
  padding: 1px 6px;
  border-radius: 6px;
  background: #ece0c8;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: #5c4528;
}

.dup-aside {
  display: grid;
  justify-items: end;
  gap: 8px;
  color: #6a5439;
  font-size: 0.86rem;
  white-space: nowrap;
}

.locate-btn {
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid #5d4322;
  background: transparent;
  color: #5d4322;
  font: inherit;
  font-size: 0.86rem;
  cursor: pointer;
}

.locate-btn:hover {
  background: #5d4322;
  color: #fff8eb;
}

.dup-empty {
  margin: 0;
  color: #6a5439;
}

@media (max-width: 680px) {
  .duplicate-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .dup-aside {
    justify-items: start;
  }
}
</style>
