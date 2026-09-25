export const restorationNavigation = [
  { label: '修复总览', to: '/' },
  { label: '批次档案', to: '/batches' },
  { label: '任务清单', to: '/tasks' },
]

export const restorationHero = {
  title: '古籍虫蛀修复批次板',
  description:
    '聚焦修复批次、控湿参数和文献归档风险，适合作为修复工作室内部业务系统的前端原型。',
  backlogLabel: '待处理批次',
  backlogValue: '12 册',
  note: '高湿季节前优先清理虫道扩散页。',
}

// 在册批次（原批次）：批次编码是档案中的既有编码，始终保持原样，
// 全应用的批次识别、状态展示都以这里为唯一来源。
export const restorationBatches = [
  {
    code: 'A-03',
    title: '明抄本县志残卷',
    pages: '17-29',
    risk: 'high',
    status: '补纸前',
    note: '虫道集中在装订线外沿。',
  },
  {
    code: 'B-11',
    title: '碑帖拓片册页',
    pages: '5-14',
    risk: 'medium',
    status: '控湿中',
    note: '需先降湿 48 小时，再进入纤维加固。',
  },
  {
    code: 'C-02',
    title: '戏曲抄本散页',
    pages: '1-9',
    risk: 'low',
    status: '归档前',
    note: '边角缺损明显，建议先做透明托裱。',
  },
]

// 各入口流入的登记流水（前台登记、修复室回传、移动端补录……）。
// 同一批次可能从不同入口、带着不同写法的编码重复登记，
// 由批次台账统一判重并归并到原批次。
export const restorationIntakeRecords = [
  {
    id: 'IN-2401',
    rawCode: 'A03',
    title: '明抄本县志残卷',
    source: '前台登记',
    receivedAt: '2026-09-21T09:12:00+08:00',
    note: '前台录入时漏写连字符。',
  },
  {
    id: 'IN-2402',
    rawCode: 'b-11',
    title: '碑帖拓片册页',
    source: '移动端补录',
    receivedAt: '2026-09-21T10:05:00+08:00',
    note: '移动端小写录入。',
  },
  {
    id: 'IN-2403',
    rawCode: 'B 11',
    title: '碑帖拓片册页',
    source: '修复室回传',
    receivedAt: '2026-09-21T11:40:00+08:00',
    note: '修复室以空格分隔重复回传。',
  },
  {
    id: 'IN-2404',
    rawCode: 'c-02 ',
    title: '戏曲抄本散页',
    source: '前台登记',
    receivedAt: '2026-09-22T08:50:00+08:00',
    note: '编码尾部带空格。',
  },
  {
    id: 'IN-2405',
    rawCode: 'D-07',
    title: '地方志活字本残页',
    pages: '31-36',
    risk: 'medium',
    status: '除尘中',
    source: '移动端补录',
    receivedAt: '2026-09-22T14:20:00+08:00',
    note: '新批次，档案中尚无记录。',
  },
]

// 修复阶段的统一取值，档案卡片与任务清单共用。
export const restorationStages = [
  '除尘中',
  '补纸前',
  '控湿中',
  '加固中',
  '归档前',
  '已归档',
]

export const restorationEnvironment = [
  {
    label: '相对湿度',
    value: '52%',
    note: '控制线 50% - 55%',
  },
  {
    label: '纸浆补配',
    value: '2 批',
    note: '桑皮纤维待过滤',
  },
  {
    label: '紫外检查',
    value: '4 页',
    note: '夜间统一复核霉斑残留',
  },
]

export const restorationSteps = [
  '拍照建档并标注虫蛀起止页。',
  '低压吸附除尘，保留边角碎纤维。',
  '喷雾回软后局部补纸，不做整页过度清洗。',
  '平整定型 8 小时后转入无酸盒暂存。',
]

// 任务清单不自带阶段/风险，只通过 batchCode 关联到批次台账，
// owner、说明等任务自身字段仍在这里维护。
export const restorationTasks = [
  {
    batchCode: 'A-03',
    owner: '韩澈',
    note: '虫道贯穿标题栏，需先固色。',
  },
  {
    batchCode: 'B-11',
    owner: '陆宁',
    note: '边缘卷曲，可延后压平。',
  },
  {
    batchCode: 'C-02',
    owner: '周恬',
    note: '等待封套尺寸确认。',
  },
]
