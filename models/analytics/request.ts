export interface RequestsByMonth {
  cycleTime: number;
  date: string;
}

export interface RequestStats {
  approved: number;
  pending: number;
  cancelled: number;
  cycleTime: number;
}
interface BasicStats {
  count: number;
}
type priorities = 'none' | 'low' | 'medium' | 'high';
export type RequestStatsByPriority = Record<priorities, BasicStats>;
