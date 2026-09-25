import { computed } from 'vue'

import { restorationEnvironment } from '../data/restorationData'
import { useBatchRegistry } from './useBatchRegistry'

export function useRestorationOverview() {
  const { batches, taskRows } = useBatchRegistry()

  const batchCount = computed(() => batches.value.length)
  const highRiskCount = computed(
    () => taskRows.value.filter((item) => item.risk === 'high').length,
  )
  const environmentCount = computed(() => restorationEnvironment.length)
  const ownerCount = computed(
    () => new Set(taskRows.value.map((item) => item.owner)).size,
  )

  return {
    batchCount,
    highRiskCount,
    environmentCount,
    ownerCount,
  }
}
