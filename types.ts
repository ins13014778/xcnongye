
export interface PlantMetrics {
  heightCm: number;
  canopyWidthCm: number;
  leafAreaIndex: number;
  healthScore: number;
  growthStage: '发芽期' | '幼苗期' | '营养生长期' | '开花期' | '成熟期';
  detectedAnomalies: string[];
}

export interface GrowthStageInfo {
  stage: string;
  duration: string;
  description: string;
  silhouetteUrl: string; // 剪影/图片路径
  keyMetrics: string;
}

export interface GrowthRecord {
  date: string;
  height: number;
  width: number;
  health: number;
  stage: string;
}

export interface AnalysisResponse {
  plantName: string;
  metrics: PlantMetrics;
  silhouetteDescription: string;
  recommendations: string[];
}
