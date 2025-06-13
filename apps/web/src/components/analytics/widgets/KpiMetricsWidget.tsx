// apps/web/src/components/analytics/widgets/KpiMetricsWidget.tsx
import React from 'react';
import { Alert, Grid } from '@mui/material';
import { KpiCard } from '../KpiCard';
import { useKpiData } from '@/hooks/analytics/useKpiData';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import {
  KPI_DEFINITIONS,
  formatKpiValue,
  getKpiValueFromData,
  KpiDefinition,
} from '@/config/analytics.config.tsx';

interface KpiMetricsWidgetProps {
  filters: AnalyticsFilters;
  onFiltersChange?: (filters: AnalyticsFilters) => void;
}

export const KpiMetricsWidget: React.FC<KpiMetricsWidgetProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { data, isLoading, isError, error } = useKpiData(filters);

  if (isError) {
    return (
      <Alert severity="error">
        KPI verileri yüklenirken bir hata oluştu:{' '}
        {error?.message || 'Bilinmeyen hata'}
      </Alert>
    );
  }

  const handleKpiClick = (
    filterKey?: string,
    filterValue?: string,
    kpiDef?: KpiDefinition
  ) => {
    if (onFiltersChange && filterKey && filterValue) {
      // Mevcut filtrelerle birleştir
      let newFilters = {
        ...filters,
        [filterKey]: filterValue,
      };

      // Trending Issue için özel mantık: categoryId'yi dinamik ayarla
      if (kpiDef?.id === 'trendingIssue' && data?.strategicKpis) {
        // Type assertion ile veri yapısını belirle
        const strategicData = data.strategicKpis as {
          data?: { trendingIssue?: { categoryCode?: string } };
        };
        const categoryCode = strategicData?.data?.trendingIssue?.categoryCode;

        if (categoryCode) {
          // Trending kategoriyi filtre olarak ayarla
          newFilters = {
            ...filters,
            categoryId: categoryCode,
          };
        }
      }

      onFiltersChange(newFilters);
    }
  };

  return (
    <Grid container spacing={3}>
      {KPI_DEFINITIONS.map(kpiDef => {
        const rawValue = getKpiValueFromData(data, kpiDef);
        const formattedValue = formatKpiValue(rawValue, kpiDef, data);

        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={kpiDef.id}>
            <KpiCard
              title={kpiDef.title}
              value={formattedValue}
              icon={kpiDef.icon}
              color={kpiDef.color}
              isLoading={isLoading}
              isClickable={kpiDef.isClickable}
              description={kpiDef.description}
              onClick={() =>
                handleKpiClick(kpiDef.filterKey, kpiDef.filterValue, kpiDef)
              }
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
