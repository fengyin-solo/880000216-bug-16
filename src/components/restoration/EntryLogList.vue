<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="entry-log">
    <div class="entry-row entry-head">
      <span>登记编号</span>
      <span>入口</span>
      <span>批次编码</span>
      <span>名称</span>
      <span>当前阶段</span>
      <span>判定</span>
    </div>
    <div v-for="entry in items" :key="entry.id" class="entry-row">
      <span>{{ entry.id }}</span>
      <span>{{ entry.entry }}</span>
      <span>{{ entry.code }}</span>
      <span>{{ entry.title }}</span>
      <span>{{ entry.status }}</span>
      <span>
        <span v-if="entry.isDuplicate" class="duplicate-tag">
          重复 · 原批次 {{ entry.originalCode }}
        </span>
        <span v-else class="original-tag">原批次</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.entry-log {
  overflow: hidden;
  border: 1px solid rgba(79, 57, 32, 0.1);
  border-radius: 18px;
}

.entry-row {
  display: grid;
  grid-template-columns: 0.9fr 0.9fr 0.8fr 1.2fr 0.8fr 1.2fr;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.72);
}

.entry-row + .entry-row {
  border-top: 1px solid rgba(79, 57, 32, 0.08);
}

.entry-head {
  background: #efe1c6;
  color: #775936;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
}

.duplicate-tag,
.original-tag {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
}

.duplicate-tag {
  background: #efd0c9;
  color: #913d2f;
}

.original-tag {
  background: #d9ead9;
  color: #366338;
}

@media (max-width: 900px) {
  .entry-log {
    overflow-x: auto;
  }

  .entry-row {
    min-width: 820px;
  }
}
</style>
