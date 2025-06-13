import { create } from 'zustand';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface DashboardFilters {
  status?: ReportStatus[] | ReportStatus;
  teamId?: number;
  search?: string;
  supported?: boolean;
  subStatus?: string;
  assignment?: 'unassigned' | 'assigned';
  overdue?: boolean;
  reopened?: boolean;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface DashboardState {
  filters: DashboardFilters;
  hoveredReportId: number | null;
  selectedReport: SharedReport | null;
  mapBounds: MapBounds | null;
  setFilters: (newFilters: Partial<DashboardFilters>) => void;
  clearFilters: () => void;
  setHoveredReportId: (id: number | null) => void;
  setSelectedReport: (report: SharedReport | null) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
}

export const useDashboardStore = create<DashboardState>(set => ({
  filters: {
    // Varsayılan olarak sadece "OPEN" raporları getir
    status: [ReportStatus.OPEN],
  },
  hoveredReportId: null,
  selectedReport: null,
  mapBounds: null,
  setFilters: newFilters =>
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () =>
    set({
      filters: {
        status: [ReportStatus.OPEN],
      },
    }),
  setHoveredReportId: id => set({ hoveredReportId: id }),
  setSelectedReport: report => set({ selectedReport: report }),
  setMapBounds: bounds => set({ mapBounds: bounds }),
}));
