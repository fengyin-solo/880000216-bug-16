import { computed, reactive } from 'vue'

// 阶段选项：批次状态的唯一取值来源
export const batchStages = ['控湿中', '补纸前', '归档前', '已归档']

// 批次识别统一走这里：去空格并转大写。
// 既有编码（如 A-03）规范化后保持不变，不同入口写出的 a-03、A-03 之类会归并到同一批。
export function normalizeBatchCode(code) {
  return String(code ?? '').trim().toUpperCase()
}

// 登记记录：同一批次可能从不同入口重复登记，原始记录全部保留，便于追溯与筛选
const seedEntries = [
  {
    id: 'REG-001',
    entry: '修复室前台',
    code: 'A-03',
    title: '明抄本县志残卷',
    pages: '17-29',
    risk: 'high',
    status: '补纸前',
    note: '虫道集中在装订线外沿。',
  },
  {
    id: 'REG-002',
    entry: '修复室前台',
    code: 'B-11',
    title: '碑帖拓片册页',
    pages: '5-14',
    risk: 'medium',
    status: '控湿中',
    note: '需先降湿 48 小时，再进入纤维加固。',
  },
  {
    id: 'REG-003',
    entry: '库房巡检',
    code: 'C-02',
    title: '戏曲抄本散页',
    pages: '1-9',
    risk: 'low',
    status: '归档前',
    note: '边角缺损明显，建议先做透明托裱。',
  },
  {
    // 同一批次从另一入口重复登记：编码写法不一致，规范化后仍指向 A-03
    id: 'REG-004',
    entry: '库房巡检',
    code: 'a-03 ',
    title: '明抄本县志残卷',
    pages: '17-29',
    risk: 'high',
    status: '控湿中',
    note: '巡检补录，与前台登记为同一批。',
  },
]

// 任务只记录负责人与任务说明，批次信息一律通过 batchCode 关联在册批次
const seedAssignments = [
  { batchCode: 'A-03', owner: '韩澈', note: '虫道贯穿标题栏，需先固色。' },
  { batchCode: 'B-11', owner: '陆宁', note: '边缘卷曲，可延后压平。' },
  { batchCode: 'C-02', owner: '周恬', note: '等待封套尺寸确认。' },
]

const state = reactive({
  entries: [...seedEntries],
  assignments: [...seedAssignments],
  // 状态唯一来源：按规范化编码记录当前阶段，档案卡片与任务清单都从这里读取
  statusByCode: {
    'A-03': '补纸前',
    'B-11': '控湿中',
    'C-02': '归档前',
  },
})

let entrySequence = seedEntries.length

// 全部登记记录 + 判定结果：是否重复、原批次编码、以在册批次为准的当前阶段
const allEntries = computed(() => {
  const originalCodeByKey = new Map()
  return state.entries.map((entry) => {
    const key = normalizeBatchCode(entry.code)
    const isDuplicate = originalCodeByKey.has(key)
    if (!isDuplicate) {
      originalCodeByKey.set(key, entry.code)
    }
    return {
      ...entry,
      key,
      isDuplicate,
      originalCode: isDuplicate ? originalCodeByKey.get(key) : entry.code,
      status: state.statusByCode[key] ?? entry.status,
    }
  })
})

// 去重后的在册批次：同一规范化编码只保留首次登记，既有批次编码保持原样
const canonicalBatches = computed(() =>
  allEntries.value.filter((entry) => !entry.isDuplicate),
)

// 重复登记记录：每条都带原批次编码，便于准确定位
const duplicateEntries = computed(() =>
  allEntries.value.filter((entry) => entry.isDuplicate),
)

// 任务清单：阶段、风险、名称全部取自同一批在册批次，保证与档案两处一致
const tasks = computed(() => {
  const batchByKey = new Map(canonicalBatches.value.map((batch) => [batch.key, batch]))
  return state.assignments
    .map((assignment) => {
      const batch = batchByKey.get(normalizeBatchCode(assignment.batchCode))
      if (!batch) return null
      return {
        batchCode: batch.code,
        title: batch.title,
        stage: batch.status,
        risk: batch.risk,
        owner: assignment.owner,
        note: assignment.note,
      }
    })
    .filter(Boolean)
})

// 修改状态：只写唯一状态来源，所有视图同步生效
export function updateBatchStatus(code, status) {
  const key = normalizeBatchCode(code)
  if (!(key in state.statusByCode)) return false
  if (!batchStages.includes(status)) return false
  state.statusByCode[key] = status
  return true
}

// 登记批次：校验失败时不写入任何记录，表单可原样重试；
// 编码与既有批次重复时只追加登记记录，在册批次与其状态不受影响（重试安全）
export function registerBatch(input) {
  const code = String(input?.code ?? '').trim()
  const title = String(input?.title ?? '').trim()
  if (!code || !title) {
    return { ok: false, error: '批次编码与名称不能为空，请修正后重新登记。' }
  }

  const key = normalizeBatchCode(code)
  const existing = canonicalBatches.value.find((batch) => batch.key === key)

  entrySequence += 1
  const entry = {
    id: `REG-${String(entrySequence).padStart(3, '0')}`,
    entry: String(input.entry ?? '').trim() || '修复室前台',
    code,
    title,
    pages: String(input.pages ?? '').trim(),
    risk: input.risk ?? 'low',
    status: batchStages.includes(input.status) ? input.status : batchStages[0],
    note: String(input.note ?? '').trim(),
  }
  state.entries.push(entry)

  if (existing) {
    return { ok: true, entry, duplicate: true, originalCode: existing.code }
  }

  state.statusByCode[key] = entry.status
  return { ok: true, entry, duplicate: false, originalCode: entry.code }
}

export function useBatchStore() {
  return {
    allEntries,
    canonicalBatches,
    duplicateEntries,
    tasks,
    registerBatch,
    updateBatchStatus,
  }
}
