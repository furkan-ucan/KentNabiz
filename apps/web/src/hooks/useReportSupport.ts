// apps/web/src/hooks/useReportSupport.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/hooks/useSnackbar';

interface SupportReportParams {
  reportId: string | number;
}

interface SupportResponse {
  success: boolean;
  message?: string;
}

/**
 * Rapor destek verme hook'u
 */
export const useReportSupport = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const supportMutation = useMutation<
    SupportResponse,
    Error,
    SupportReportParams
  >({
    mutationFn: async ({ reportId }) => {
      const response = await fetch(`/api/reports/${reportId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Destek verirken bir hata oluştu');
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      showSnackbar('Rapora destek verdiniz! 👍', 'success');

      // İlgili query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ['nearbyReports'] });
      queryClient.invalidateQueries({
        queryKey: ['reports', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
    onError: error => {
      showSnackbar(error.message || 'Destek verirken bir hata oluştu', 'error');
    },
  });

  const unsupportMutation = useMutation<
    SupportResponse,
    Error,
    SupportReportParams
  >({
    mutationFn: async ({ reportId }) => {
      const response = await fetch(`/api/reports/${reportId}/support`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Desteği kaldırırken bir hata oluştu'
        );
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      showSnackbar('Destek kaldırıldı', 'success');

      // İlgili query'leri invalidate et
      queryClient.invalidateQueries({ queryKey: ['nearbyReports'] });
      queryClient.invalidateQueries({
        queryKey: ['reports', variables.reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
    onError: error => {
      showSnackbar(
        error.message || 'Desteği kaldırırken bir hata oluştu',
        'error'
      );
    },
  });

  return {
    supportReport: supportMutation.mutate,
    unsupportReport: unsupportMutation.mutate,
    isSupportLoading: supportMutation.isPending,
    isUnsupportLoading: unsupportMutation.isPending,
    isLoading: supportMutation.isPending || unsupportMutation.isPending,
  };
};
