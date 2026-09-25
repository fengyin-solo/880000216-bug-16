<script setup>
import { computed, ref, watch } from 'vue'

import { restorationStages } from '../../data/restorationData'
import { useBatchRegistry } from '../../composables/useBatchRegistry'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
})

const { registerStage, retryRegistration, cancelRegistration, registrationStatus } =
  useBatchRegistry()

const draftStage = ref(props.status)

// 当前阶段可能由其他入口（任务清单、其他卡片）更新，同步本卡片的选项。
watch(
  () => props.status,
  (value) => {
    draftStage.value = value
  },
)

const reg = computed(() => registrationStatus(props.code))
const isPending = computed(() => reg.value.phase === 'pending')
const isFailed = computed(() => reg.value.phase === 'failed')
const canSubmit = computed(
  () => !isPending.value && draftStage.value !== props.status,
)

async function submit() {
  await registerStage(props.code, draftStage.value)
}

async function retry() {
  await retryRegistration(props.code)
}

function discard() {
  cancelRegistration(props.code)
  draftStage.value = props.status
}
</script>

<template>
  <div class="stage-control">
    <div class="stage-line">
      <span class="stage-label">阶段：</span>
      <strong>{{ status }}</strong>
    </div>
    <div class="stage-edit">
      <select v-model="draftStage" :disabled="isPending">
        <option
          v-for="stage in restorationStages"
          :key="stage"
          :value="stage"
        >
          {{ stage }}
        </option>
      </select>
      <button
        type="button"
        class="stage-btn"
        :disabled="!canSubmit"
        @click="submit"
      >
        {{ isPending ? '登记中…' : '登记' }}
      </button>
    </div>
    <p v-if="isFailed" class="stage-feedback stage-feedback--error">
      <span>{{ reg.error }}，阶段仍为「{{ status }}」。</span>
      <button type="button" class="stage-link" @click="retry">重试</button>
      <button type="button" class="stage-link stage-link--muted" @click="discard">
        放弃
      </button>
    </p>
  </div>
</template>

<style scoped>
.stage-control {
  display: grid;
  gap: 8px;
}

.stage-line {
  color: #6a5439;
}

.stage-label {
  font-weight: 400;
}

.stage-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}

select {
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(109, 80, 40, 0.25);
  background: #fffaf0;
  color: #5c4528;
  font: inherit;
  font-size: 0.88rem;
}

select:disabled {
  opacity: 0.6;
}

.stage-btn {
  padding: 7px 14px;
  border-radius: 10px;
  border: none;
  background: #5d4322;
  color: #fff8eb;
  font: inherit;
  font-size: 0.86rem;
  cursor: pointer;
}

.stage-btn:disabled {
  background: #b6a588;
  cursor: not-allowed;
}

.stage-feedback {
  margin: 0;
  font-size: 0.82rem;
}

.stage-feedback--error {
  color: #913d2f;
}

.stage-link {
  margin-left: 8px;
  padding: 2px 8px;
  border: none;
  border-radius: 8px;
  background: #efd0c9;
  color: #913d2f;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.stage-link--muted {
  background: #e7ddcb;
  color: #7e6038;
}
</style>
