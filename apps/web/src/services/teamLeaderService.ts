import { api } from '../lib/api';
import type { SharedReport } from '@kentnabiz/shared';

export interface AcceptAssignmentPayload {
  notes?: string;
  estimatedCompletionTime?: string; // ISO string
}

export interface CompleteWorkPayload {
  resolutionNotes: string;
  mediaFiles?: File[];
  proofMediaFiles?: File[]; // Kanıt fotoğrafları/videoları
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    reportId: number;
    mediaUrls?: string[];
  };
}

export const teamLeaderService = {
  // TEAM_MEMBER Aksiyon 1: Atanan işi kabul et (IN_REVIEW → IN_PROGRESS)
  async acceptAssignment(
    reportId: number,
    payload: AcceptAssignmentPayload
  ): Promise<SharedReport> {
    const response = await api.patch(`/reports/${reportId}/status`, {
      newStatus: 'IN_PROGRESS',
      notes: payload.notes,
    });
    return response.data;
  },

  // TEAM_MEMBER Aksiyon 2: İşi tamamla ve supervisor'e gönder (IN_PROGRESS → PENDING_APPROVAL)
  async completeWork(
    reportId: number,
    payload: CompleteWorkPayload
  ): Promise<UploadResponse> {
    try {
      // Önce kanıt medyalarını yükle
      let proofMediaIds: number[] = [];
      if (payload.proofMediaFiles && payload.proofMediaFiles.length > 0) {
        const formData = new FormData();
        payload.proofMediaFiles.forEach(file => {
          formData.append('files', file);
        });

        const uploadResponse = await api.post(
          `/media/upload/multiple`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        proofMediaIds = uploadResponse.data.data.map(
          (media: { id: number }) => media.id
        );
      }

      // Şimdi işi tamamla
      const response = await api.patch(`/reports/${reportId}/complete-work`, {
        resolutionNotes: payload.resolutionNotes,
        proofMediaIds,
      });

      return {
        success: true,
        message: 'İş başarıyla tamamlandı',
        data: response.data,
      };
    } catch (error) {
      console.error('İş tamamlanırken hata:', error);
      throw error;
    }
  },

  // TEAM_MEMBER Yardımcı: İş sırasında medya dosyası yükleme
  async uploadWorkProgressMedia(
    reportId: number,
    files: File[]
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('reportId', reportId.toString());

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post(`/media/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      message: 'Medya dosyaları başarıyla yüklendi',
      data: response.data,
    };
  },

  // TEAM_MEMBER: Atanmış raporları getir (sadece kendi takımına atananlar)
  async getMyTeamReports(filters?: {
    status?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<SharedReport[]> {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters?.priority) {
      params.append('priority', filters.priority);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    const response = await api.get(
      `/teams/my-team/reports?${params.toString()}`
    );
    return response.data.data;
  },
};
