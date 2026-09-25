import { computed } from 'vue'

import { restorationEnvironment } from '../data/restorationData'
import { useBatchStore } from '../stores/batchStore'

export function useRestorationOverview() {
  const { canonicalBatches, tasks } = useBatchStore()

  const batchCount = computed(() => canonicalBatches.value.length)
  const highRiskCount = computed(
    () => tasks.value.filter((item) => item.risk === 'high').length,
  )
  const environmentCount = computed(() => restorationEnvironment.length)
  const ownerCount = computed(() => new Set(tasks.value.map((item) => item.owner)).size)

  return {
    batchCount,
    highRiskCount,
    environmentCount,
    ownerCount,
  }
}
