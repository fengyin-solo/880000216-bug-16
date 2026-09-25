// 批次身份识别的唯一入口：
// 不同入口登记时，批次编码可能存在连字符、空格、大小写差异（如 A-03 / A03 / a-03），
// 统一规范化后再比对。规范化结果只用于识别，展示与既有编码一律保持原样、绝不重写。
export function normalizeBatchCode(code) {
  if (code === null || code === undefined) {
    return ''
  }

  return String(code)
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, '')
}

// 判断两条登记记录是否指向同一批次。
export function isSameBatch(codeA, codeB) {
  const keyA = normalizeBatchCode(codeA)
  const keyB = normalizeBatchCode(codeB)
  return keyA !== '' && keyA === keyB
}

// 把在册批次（原批次）与各入口的登记流水合并成一份台账。
// 规则：
// 1. 在册批次最先入册，身份键相同的后续登记一律记为重复记录，不覆盖原批次；
// 2. 原批次的展示编码以在册数据为准，既有编码保持不变；
// 3. 入口流水按登记时间、流水号稳定排序，保证多次合并结果一致。
export function createBatchRegistry(seedBatches = [], intakeRecords = []) {
  const records = {}
  const order = []

  const touch = (key) => {
    if (!records[key]) {
      records[key] = {
        key,
        code: '',
        title: '',
        pages: '',
        risk: 'low',
        status: '待建档',
        note: '',
        source: '',
        receivedAt: '',
        duplicates: [],
      }
      order.push(key)
    }
    return records[key]
  }

  // 在册批次先入册，锁定原批次身份与编码。
  seedBatches.forEach((batch) => {
    const key = normalizeBatchCode(batch.code)
    const record = touch(key)
    record.code = batch.code
    record.title = batch.title
    record.pages = batch.pages ?? ''
    record.risk = batch.risk ?? 'low'
    record.status = batch.status ?? '待建档'
    record.note = batch.note ?? ''
    record.source = batch.source ?? '在册档案'
    record.receivedAt = batch.receivedAt ?? ''
  })

  const sortedIntake = [...intakeRecords].sort((a, b) => {
    const timeCompare = (a.receivedAt ?? '').localeCompare(b.receivedAt ?? '')
    if (timeCompare !== 0) {
      return timeCompare
    }
    return String(a.id).localeCompare(String(b.id))
  })

  const duplicates = []

  sortedIntake.forEach((intake) => {
    const key = normalizeBatchCode(intake.rawCode)
    const record = touch(key)
    const duplicateInfo = {
      id: intake.id,
      source: intake.source,
      rawCode: intake.rawCode,
      receivedAt: intake.receivedAt ?? '',
      note: intake.note ?? '',
    }

    if (record.code) {
      // 命中原批次：记一条重复登记，原批次任何字段都不被覆盖。
      record.duplicates.push(duplicateInfo)
      duplicates.push({ ...duplicateInfo, key, originalCode: record.code })
      return
    }

    // 新批次：保留入口提交时的原始编码（仅去除首尾空白用于展示）。
    record.code = String(intake.rawCode).trim()
    record.title = intake.title
    record.pages = intake.pages ?? ''
    record.risk = intake.risk ?? 'low'
    record.status = intake.status ?? '待建档'
    record.note = intake.note ?? ''
    record.source = intake.source
    record.receivedAt = intake.receivedAt ?? ''
  })

  return { records, order, duplicates }
}
