import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SweepSelectionStorage } from '@/utils/storage'
import { Logger } from '@/utils/logger'

export interface MaterialInfo {
  rank: number
  stages: string[]
}

export interface MaterialData {
  [materialName: string]: MaterialInfo
}

export interface StageData {
  [stageName: string]: string[]
}

export interface AlternativeStageInfo {
  stage: string
  materials: string[]
  blueprints: string[]
}

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
      Logger.error('載入掃蕩數據失敗:', error)
      throw error
    }
  }

  // 解析數據
  function parseData(data: MaterialData) {
    const materialList: string[] = []
    const stages: StageData = {}

    for (const [materialName, materialInfo] of Object.entries(data)) {
      if (!materialName || !materialInfo || !Array.isArray(materialInfo.stages) || materialInfo.stages.length === 0) {
        continue
      }

      materialList.push(materialName)

      for (const stage of materialInfo.stages) {
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
    const saved = SweepSelectionStorage.get()
    if (saved && saved.length > 0) {
      selectedMaterials.value = new Set(
        saved.filter((name: string) => materialData.value[name])
      )
    }
  }

  // 保存選擇
  function saveSelection() {
    SweepSelectionStorage.set([...selectedMaterials.value])
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
    const stages = computeMinimumStages(selected)
    
    // 過濾掉沒有用戶選中材料的關卡
    const filteredStages = stages.filter(stage => {
      const stageMaterials = stageData.value[stage] || []
      return stageMaterials.some(material => selectedMaterials.value.has(material))
    })
    
    return filteredStages.sort((a, b) => stageComparator(a, b))
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

  // 判斷材料是否為圖紙（rank >= 2）
  function isBlueprintMaterial(materialName: string): boolean {
    const materialInfo = materialData.value[materialName]
    return materialInfo && materialInfo.rank >= 2
  }

  // 計算替代關卡信息
  // 當關卡只有一種用戶需要的材料，且該材料有多個可掉落關卡時，顯示其他關卡的圖紙信息
  const alternativeStages = computed(() => {
    const result: Map<string, AlternativeStageInfo[]> = new Map()
    
    for (const stage of plan.value) {
      const stageMaterials = stageData.value[stage] || []
      const selectedInStage = stageMaterials.filter(m => selectedMaterials.value.has(m))
      
      // 只有當該關卡只有一種用戶需要的材料時才處理
      if (selectedInStage.length === 1) {
        const material = selectedInStage[0]
        const materialInfo = materialData.value[material]
        
        // 檢查該材料是否有多個可掉落關卡
        if (materialInfo && materialInfo.stages.length > 1) {
          const alternatives: AlternativeStageInfo[] = []
          
          // 遍歷該材料的所有關卡（除了當前關卡）
          for (const altStage of materialInfo.stages) {
            if (altStage === stage) continue
            
            const altStageMaterials = stageData.value[altStage] || []
            
            // 過濾掉：1. 被選中的主體材料 2. R1 材料
            const filteredMaterials = altStageMaterials.filter(m => {
              // 不顯示被選中的主體材料
              if (m === material) return false
              // 不顯示 R1 材料
              const mInfo = materialData.value[m]
              if (mInfo && mInfo.rank === 1) return false
              return true
            })
            
            const blueprints = altStageMaterials.filter(m => isBlueprintMaterial(m))
            
            // 只顯示有材料的替代關卡
            if (filteredMaterials.length > 0) {
              alternatives.push({
                stage: altStage,
                materials: filteredMaterials,
                blueprints: blueprints
              })
            }
          }
          
          if (alternatives.length > 0) {
            // 按關卡排序
            alternatives.sort((a, b) => stageComparator(a.stage, b.stage))
            result.set(stage, alternatives)
          }
        }
      }
    }
    
    return result
  })

  return {
    materials,
    materialData,
    stageData,
    selectedMaterials,
    plan,
    missingMaterials,
    alternativeStages,
    loadData,
    toggleMaterial,
    clearSelection,
    saveSelection,
    stageComparator,
    isBlueprintMaterial
  }
})

