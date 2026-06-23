
export interface CategoryData {
  id: string;
  name: string;
  satisfaction: number;
  importance: number;
}

// Added GapInsight interface to fix the import error in components/AnalysisReport.tsx
export interface GapInsight {
  categoryName: string;
  gap: number;
}

export interface ReflectionData {
  friction: string;
  anchors: string;
  neglect: string;
  shift: string;
  tradeoff: string;
}

export type UpdateField = 'name' | 'satisfaction' | 'importance';
