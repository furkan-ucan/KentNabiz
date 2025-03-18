/**
 * Rapor tipleri ve ilgili arayüzler
 */

// Rapor durum enum'u
export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Rapor tipi enum'u
export enum ReportType {
  INCIDENT = 'incident',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  FEEDBACK = 'feedback'
}

// Rapor severity enum'u
export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Temel rapor arayüzü
export interface Report {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  type: ReportType;
  severity: ReportSeverity;
  location: GeoLocation;
  submittedBy: string; // Kullanıcı ID'si
  assignedTo?: string; // Atanan kullanıcının ID'si (opsiyonel)
  mediaUrls?: string[]; // Rapor ile ilişkili medya URL'leri (opsiyonel)
  createdAt: Date;
  updatedAt: Date;
}

// Coğrafi konum arayüzü
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// Rapor isteği için kullanılacak yardımcı tip
export type CreateReportDto = Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: ReportStatus;
};

// Rapor güncelleme için kullanılacak yardımcı tip
export type UpdateReportDto = Partial<Omit<Report, 'id' | 'createdAt' | 'updatedAt'>>;

// Rapor analitik verisi arayüzü
export interface ReportAnalytics {
  totalCount: number;
  byStatus: Record<ReportStatus, number>;
  byType: Record<ReportType, number>;
  bySeverity: Record<ReportSeverity, number>;
}