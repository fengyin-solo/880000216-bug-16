<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['locate'])
</script>

<template>
  <div>
    <ul v-if="items.length" class="duplicate-list">
      <li v-for="item in items" :key="item.id" class="duplicate-card">
        <div class="duplicate-head">
          <small>登记 {{ item.id }} · {{ item.entry }}</small>
          <span class="duplicate-badge">重复登记</span>
        </div>
        <h4>{{ item.title }}</h4>
        <p>登记编码：{{ item.code }}（原批次 {{ item.originalCode }}）</p>
        <p>当前阶段：{{ item.status }}</p>
        <small>{{ item.note }}</small>
        <button
          type="button"
          class="locate-button"
          @click="emit('locate', item.originalCode)"
        >
          定位原批次 {{ item.originalCode }}
        </button>
      </li>
    </ul>
    <p v-else class="empty">暂无重复登记。</p>
  </div>
</template>

<style scoped>
.duplicate-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.duplicate-card {
  padding: 18px;
  border-radius: 20px;
  background: #f4ebda;
  border: 1px dashed rgba(145, 61, 47, 0.45);
}

.duplicate-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.duplicate-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: #efd0c9;
  color: #913d2f;
  font-size: 0.76rem;
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
p + small {
  margin-top: 6px;
}

.locate-button {
  margin-top: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #5d4322;
  color: #fff8eb;
  cursor: pointer;
}

.locate-button:hover {
  background: #4a3319;
}

.empty {
  margin: 0;
  color: #6a5439;
}

@media (max-width: 960px) {
  .duplicate-list {
    grid-template-columns: 1fr;
  }
}
</style>
