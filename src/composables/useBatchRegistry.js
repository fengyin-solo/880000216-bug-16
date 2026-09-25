import { computed, reactive } from 'vue'

import {
  restorationBatches,
  restorationIntakeRecords,
  restorationTasks,
} from '../data/restorationData'
import { submitStageRegistration } from '../services/registrationApi'
import { createBatchRegistry, normalizeBatchCode } from '../utils/batchIdentity'

// 模块级单例：全应用（总览 / 批次档案 / 任务清单）共享同一份批次台账，
// 状态只有这一个来源，任何视图进入都读到相同结果。
const initialRegistry = createBatchRegistry(
  restorationBatches,
  restorationIntakeRecords,
)

const state = reactive({
  records: initialRegistry.records,
  order: initialRegistry.order,
  duplicates: initialRegistry.duplicates,
  // 每个批次最近一次阶段登记的交互状态：idle | pending | failed
  registrationState: {},
  registrationError: {},
  // 保留最近一次提交参数，失败后用同一份参数重试，不改变批次编码与身份。
  pendingDraft: {},
})

const riskRank = { high: 0, medium: 1, low: 2 }

function ensureRegistrationSlot(code) {
  if (!state.registrationState[code]) {
    state.registrationState[code] = 'idle'
    state.registrationError[code] = ''
  }
}

export function useBatchRegistry() {
  const batches = computed(() =>
    state.order.map((key) => state.records[key]),
  )

  const duplicateEntries = computed(() => state.duplicates)

  function findBatch(code) {
    const key = normalizeBatchCode(code)
    return state.records[key] ?? null
  }

  // 任务清单行：从台账读取标题、阶段、风险，与档案卡片永远一致。
  const taskRows = computed(() =>
    restorationTasks
      .map((task) => {
        const batch = findBatch(task.batchCode)
        if (!batch) {
          return null
        }
        return {
          key: batch.key,
          code: batch.code,
          title: batch.title,
          stage: batch.status,
          risk: batch.risk,
          owner: task.owner,
          note: task.note,
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const rankCompare =
          (riskRank[a.risk] ?? 99) - (riskRank[b.risk] ?? 99)
        if (rankCompare !== 0) {
          return rankCompare
        }
        return a.code.localeCompare(b.code)
      }),
  )

  // 登记阶段变更：失败只记录错误、绝不改动当前阶段；可重复调用直到成功。
  async function registerStage(code, targetStage, attempt = 1) {
    const batch = findBatch(code)
    if (!batch) {
      return { ok: false, error: '未找到对应批次' }
    }

    ensureRegistrationSlot(code)

    // 已是目标阶段：直接视为成功，保证重复提交结果稳定。
    if (batch.status === targetStage) {
      state.registrationState[code] = 'idle'
      state.registrationError[code] = ''
      delete state.pendingDraft[code]
      return { ok: true, unchanged: true }
    }

    state.registrationState[code] = 'pending'
    state.registrationError[code] = ''
    state.pendingDraft[code] = { targetStage, attempt }

    try {
      await submitStageRegistration({
        code: batch.code,
        targetStage,
        attempt,
      })
      // 只有服务端确认后才提交状态，编码与其他字段均不变。
      batch.status = targetStage
      state.registrationState[code] = 'idle'
      delete state.pendingDraft[code]
      return { ok: true }
    } catch (error) {
      state.registrationState[code] = 'failed'
      state.registrationError[code] =
        error instanceof Error ? error.message : '登记失败'
      return { ok: false, error: state.registrationError[code] }
    }
  }

  // 失败后用原参数重试。
  function retryRegistration(code) {
    const batch = findBatch(code)
    const draft = batch ? state.pendingDraft[batch.code] : null
    if (!batch || !draft) {
      return Promise.resolve({ ok: false, error: '没有待重试的登记' })
    }
    return registerStage(batch.code, draft.targetStage, draft.attempt + 1)
  }

  // 放弃本次登记，回到当前已保存阶段。
  function cancelRegistration(code) {
    const batch = findBatch(code)
    if (!batch) {
      return
    }
    state.registrationState[batch.code] = 'idle'
    state.registrationError[batch.code] = ''
    delete state.pendingDraft[batch.code]
  }

  function registrationStatus(code) {
    const batch = findBatch(code)
    const batchCode = batch?.code ?? code
    ensureRegistrationSlot(batchCode)
    return {
      phase: state.registrationState[batchCode] ?? 'idle',
      error: state.registrationError[batchCode] ?? '',
      draft: state.pendingDraft[batchCode] ?? null,
    }
  }

  return {
    batches,
    duplicateEntries,
    taskRows,
    findBatch,
    registerStage,
    retryRegistration,
    cancelRegistration,
    registrationStatus,
  }
}
