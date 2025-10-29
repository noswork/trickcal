import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MaterialData {
  [materialName: string]: string[]
}

export interface StageData {
  [stageName: string]: string[]
}

const SELECTION_KEY = 'trickcal_sweep_selected_materials'

export const useSweepStore = defineStore('sweep', () => {
  const materials = ref<string[]>([])
  const materialData = ref<MaterialData>({})
  const stageData = ref<StageData>({})
  const selectedMaterials = ref<Set<string>>(new Set())

  // 載入數據
  async function loadData() {
    try {
      const baseUrl = import.meta.env.BASE_URL
      const response = await fetch(`${baseUrl}sweep/data.json`)
      if (!response.ok) throw new Error('Failed to load sweep data')
      const data: MaterialData = await response.json()
      
      parseData(data)
      loadSelection()
    } catch (error) {
      console.error('載入掃蕩數據失敗:', error)
      throw error
    }
  }

  // 解析數據
  function parseData(data: MaterialData) {
    const materialList: string[] = []
    const stages: StageData = {}

    for (const [materialName, stageList] of Object.entries(data)) {
      if (!materialName || !Array.isArray(stageList) || stageList.length === 0) {
        continue
      }

      materialList.push(materialName)

      for (const stage of stageList) {
        if (!stages[stage]) {
          stages[stage] = []
        }
        stages[stage].push(materialName)
      }
    }

    materials.value = materialList
    materialData.value = data
    stageData.value = stages
  }

  // 載入已選擇的素材
  function loadSelection() {
    const saved = localStorage.getItem(SELECTION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        selectedMaterials.value = new Set(
          parsed.filter((name: string) => materialData.value[name])
        )
      } catch {
        selectedMaterials.value = new Set()
      }
    }
  }

  // 保存選擇
  function saveSelection() {
    localStorage.setItem(
      SELECTION_KEY,
      JSON.stringify([...selectedMaterials.value])
    )
  }

  // 切換素材選擇
  function toggleMaterial(materialName: string) {
    if (selectedMaterials.value.has(materialName)) {
      selectedMaterials.value.delete(materialName)
    } else {
      selectedMaterials.value.add(materialName)
    }
    saveSelection()
  }

  // 清除所有選擇
  function clearSelection() {
    selectedMaterials.value.clear()
    saveSelection()
  }

  // 計算最省體力方案
  function computeMinimumStages(selected: string[]): string[] {
    const remaining = new Set(selected)
    const chosenStages: string[] = []

    const stagesEntries = Object.entries(stageData.value).sort(([a], [b]) => 
      stageComparator(a, b)
    )

    while (remaining.size > 0) {
      let bestStage: string | null = null
      let bestCover = 0

      for (const [stage, stageMaterials] of stagesEntries) {
        const cover = stageMaterials.filter((m) => remaining.has(m)).length
        if (cover > bestCover) {
          bestCover = cover
          bestStage = stage
        }
      }

      if (!bestStage) break

      chosenStages.push(bestStage)

      for (const material of stageData.value[bestStage]) {
        remaining.delete(material)
      }
    }

    return chosenStages
  }

  // 關卡排序
  function stageComparator(a: string, b: string): number {
    const [aChapter, aStage] = a.split('-').map(Number)
    const [bChapter, bStage] = b.split('-').map(Number)
    if (aChapter !== bChapter) return aChapter - bChapter
    return aStage - bStage
  }

  // 計算方案
  const plan = computed(() => {
    if (selectedMaterials.value.size === 0) return []
    const selected = [...selectedMaterials.value]
    return computeMinimumStages(selected).sort((a, b) => stageComparator(a, b))
  })

  // 計算缺失的素材
  const missingMaterials = computed(() => {
    const selected = [...selectedMaterials.value]
    return selected.filter(
      (material) => !plan.value.some((stage) => 
        (stageData.value[stage] || []).includes(material)
      )
    )
  })

  return {
    materials,
    materialData,
    stageData,
    selectedMaterials,
    plan,
    missingMaterials,
    loadData,
    toggleMaterial,
    clearSelection,
    stageComparator
  }
})

