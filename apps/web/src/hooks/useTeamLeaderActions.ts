import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  teamLeaderService,
  AcceptAssignmentPayload,
  CompleteWorkPayload,
} from '@/services/teamLeaderService';

/**
 * TEAM_MEMBER: Atanan işi kabul etme hook'u (IN_REVIEW → IN_PROGRESS)
 */
export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      payload,
    }: {
      reportId: number;
      payload: AcceptAssignmentPayload;
    }) => {
      return teamLeaderService.acceptAssignment(reportId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeamReports'] });
    },
    onError: (error: Error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'İş kabul edilirken bir hata oluştu';
      console.error(message);
    },
  });
};

/**
 * TEAM_MEMBER: İşi tamamlama hook'u (IN_PROGRESS → PENDING_APPROVAL)
 */
export const useCompleteWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      payload,
    }: {
      reportId: number;
      payload: CompleteWorkPayload;
    }) => {
      return teamLeaderService.completeWork(reportId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeamReports'] });
    },
    onError: (error: Error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'İş tamamlanırken bir hata oluştu';
      console.error(message);
    },
  });
};

/**
 * TEAM_MEMBER: Çalışma sırasında medya yükleme hook'u
 */
export const useUploadWorkProgressMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      files,
    }: {
      reportId: number;
      files: File[];
    }) => {
      return teamLeaderService.uploadWorkProgressMedia(reportId, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeamReports'] });
    },
    onError: (error: Error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Dosya yüklenirken bir hata oluştu';
      console.error(message);
    },
  });
};
