<script setup>
import { reactive, ref } from 'vue'

import { batchStages, useBatchStore } from '../../stores/batchStore'

const emit = defineEmits(['registered'])

const { registerBatch } = useBatchStore()

const riskOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]
const entryOptions = ['修复室前台', '库房巡检', '移交登记']

const form = reactive({
  code: '',
  title: '',
  pages: '',
  risk: 'medium',
  status: batchStages[0],
  entry: entryOptions[0],
  note: '',
})

const feedback = ref(null)

function submit() {
  const result = registerBatch(form)
  if (!result.ok) {
    // 登记失败：表单内容保留，修正后可直接重试
    feedback.value = { type: 'error', text: result.error }
    return
  }

  feedback.value = result.duplicate
    ? {
        type: 'warning',
        text: `编码 ${result.entry.code} 与既有批次 ${result.originalCode} 重复，已记为重复登记。`,
      }
    : { type: 'success', text: `批次 ${result.originalCode} 登记成功。` }

  emit('registered', result)

  if (!result.duplicate) {
    form.code = ''
    form.title = ''
    form.pages = ''
    form.note = ''
  }
}
</script>

<template>
  <form class="register-form" @submit.prevent="submit">
    <label class="field">
      批次编码
      <input v-model="form.code" type="text" placeholder="如 D-05" />
    </label>
    <label class="field">
      名称
      <input v-model="form.title" type="text" placeholder="修复对象名称" />
    </label>
    <label class="field">
      页码
      <input v-model="form.pages" type="text" placeholder="如 3-12" />
    </label>
    <label class="field">
      风险
      <select v-model="form.risk">
        <option v-for="option in riskOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>
    <label class="field">
      阶段
      <select v-model="form.status">
        <option v-for="stage in batchStages" :key="stage" :value="stage">
          {{ stage }}
        </option>
      </select>
    </label>
    <label class="field">
      登记入口
      <select v-model="form.entry">
        <option v-for="option in entryOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </label>
    <label class="field field--wide">
      备注
      <input v-model="form.note" type="text" placeholder="虫蛀情况、处理建议等" />
    </label>

    <div class="form-footer">
      <button type="submit" class="submit-button">登记批次</button>
      <p v-if="feedback" :class="['feedback', `feedback--${feedback.type}`]">
        {{ feedback.text }}
      </p>
    </div>
  </form>
</template>

<style scoped>
.register-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
  color: #6a5439;
  font-size: 0.9rem;
}

.field--wide {
  grid-column: 1 / -1;
}

.field input,
.field select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(109, 80, 40, 0.24);
  background: rgba(255, 255, 255, 0.85);
  color: #4d3a22;
  font: inherit;
}

.form-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.submit-button {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: #5d4322;
  color: #fff8eb;
  cursor: pointer;
}

.submit-button:hover {
  background: #4a3319;
}

.feedback {
  margin: 0;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.88rem;
}

.feedback--success {
  background: #d9ead9;
  color: #366338;
}

.feedback--warning {
  background: #f6e5b9;
  color: #8b6314;
}

.feedback--error {
  background: #efd0c9;
  color: #913d2f;
}

@media (max-width: 900px) {
  .register-form {
    grid-template-columns: 1fr;
  }
}
</style>
