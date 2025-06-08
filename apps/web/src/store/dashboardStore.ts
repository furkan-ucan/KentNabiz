import { create } from 'zustand';
import { ReportStatus } from '@kentnabiz/shared';
import type { SharedReport } from '@kentnabiz/shared';

interface DashboardFilters {
  status?: ReportStatus[] | ReportStatus;
  teamId?: number;
  search?: string;
}

interface DashboardState {
  filters: DashboardFilters;
  hoveredReportId: number | null;
  selectedReport: SharedReport | null;
  setFilters: (newFilters: Partial<DashboardFilters>) => void;
  clearFilters: () => void;
  setHoveredReportId: (id: number | null) => void;
  setSelectedReport: (report: SharedReport | null) => void;
}

export const useDashboardStore = create<DashboardState>(set => ({
  filters: {
    // Varsayılan olarak sadece "Aktif" raporları getir
    status: [
      ReportStatus.OPEN,
      ReportStatus.IN_REVIEW,
      ReportStatus.IN_PROGRESS,
    ],
  },
  hoveredReportId: null,
  selectedReport: null,
  setFilters: newFilters =>
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () =>
    set({
      filters: {
        status: [
          ReportStatus.OPEN,
          ReportStatus.IN_REVIEW,
          ReportStatus.IN_PROGRESS,
        ],
      },
    }),
  setHoveredReportId: id => set({ hoveredReportId: id }),
  setSelectedReport: report => set({ selectedReport: report }),
}));
