/**
 * 獲取資源的完整 URL
 * 自動添加 base path (例如 GitHub Pages 的 /trickcal/)
 */
export function getAssetUrl(path: string): string {
  // 移除開頭的 / (如果有)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // 使用 Vite 的 BASE_URL 環境變量
  const baseUrl = import.meta.env.BASE_URL
  
  // 組合完整路徑
  return `${baseUrl}${cleanPath}`
}

/**
 * 獲取角色圖片 URL
 * 優先使用 WebP 格式（節省 80% 文件大小）
 */
export function getCharacterImageUrl(characterEn: string): string {
  return getAssetUrl(`assets/characters/${characterEn}.webp`)
}

/**
 * 獲取裝備/素材圖片 URL
 * 優先使用 WebP 格式（節省 80% 文件大小）
 */
export function getGearImageUrl(gearName: string): string {
  return getAssetUrl(`assets/gears/${gearName}.webp`)
}

/**
 * 獲取圖標 URL
 * 優先使用 WebP 格式（節省 70% 文件大小）
 */
export function getIconUrl(iconName: string): string {
  return getAssetUrl(`assets/icons/${iconName}.webp`)
}

