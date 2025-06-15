// packages/shared/src/types/report.types.ts
import { Point } from 'geojson';

// Report types'da SharedAssignment'ı import et
import type { SharedAssignment } from './assignment.types';

// UPDATED Report Statuses (in English)
export enum ReportStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Report Sub-Status (for more granular status tracking)
export enum ReportSubStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  FORWARDED = 'FORWARDED',
}

export type SubStatus = ReportSubStatus | null;

/**
 * Defines the possible types/categories of a report for Turkish municipalities.
 * Updated to reflect common issues reported to Turkish municipal authorities.
 * NOTE: Any changes here MUST be synchronized with the API's ReportType enum!
 */
export enum ReportType {
  // Temel Altyapı ve Yol (Basic Infrastructure and Roads)
  POTHOLE = 'POTHOLE', // Yol veya kaldırım çukuru
  SIDEWALK_DAMAGE = 'SIDEWALK_DAMAGE', // Kaldırım hasarı (çatlak, bozulma vb.)
  ROAD_DAMAGE = 'ROAD_DAMAGE', // Genel yol hasarı (çukur dışında)
  ROAD_SIGN = 'ROAD_SIGN', // Trafik işareti sorunu
  ROAD_MARKING = 'ROAD_MARKING', // Yol çizgisi/yaya geçidi sorunu
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT', // Trafik ışığı arızası
  ROAD_BLOCK = 'ROAD_BLOCK', // Yol kapanması / Engel

  // Aydınlatma ve Enerji (Lighting and Energy)
  STREET_LIGHT = 'STREET_LIGHT', // Sokak lambası arızası
  ELECTRICITY_OUTAGE = 'ELECTRICITY_OUTAGE', // Elektrik kesintisi

  // Su ve Kanalizasyon (Water and Sewerage)
  WATER_LEAKAGE = 'WATER_LEAKAGE', // Su borusu kaçağı/patlaması
  DRAINAGE_BLOCKAGE = 'DRAINAGE_BLOCKAGE', // Yağmur suyu ızgarası/Kanal tıkanıklığı
  SEWER_LEAKAGE = 'SEWER_LEAKAGE', // Kanalizasyon kaçağı/taşması

  // Çevre ve Temizlik (Environment and Cleaning)
  GARBAGE_COLLECTION = 'GARBAGE_COLLECTION', // Çöp toplama sorunu/gecikmesi
  LITTER = 'LITTER', // Çevreye atılmış çöp/atık
  DUMPING = 'DUMPING', // Kaçak moloz/hafriyat dökümü
  GRAFFITI = 'GRAFFITI', // İzinsiz duvar yazısı/grafiti
  AIR_POLLUTION = 'AIR_POLLUTION', // Hava kirliliği

  // Parklar ve Yeşil Alanlar (Parks and Green Areas)
  PARK_DAMAGE = 'PARK_DAMAGE', // Park/oyun alanı hasarı
  TREE_ISSUE = 'TREE_ISSUE', // Ağaç sorunu (tehlikeli, devrilme riski vb.)

  // Ulaşım (Transportation)
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT', // Toplu taşıma genel sorunu
  PUBLIC_TRANSPORT_STOP = 'PUBLIC_TRANSPORT_STOP', // Durak sorunu (kirli, hasarlı, eksik)
  PARKING_VIOLATION = 'PARKING_VIOLATION', // Park yasağı ihlali/Yanlış park
  TRAFFIC_CONGESTION = 'TRAFFIC_CONGESTION', // Trafik sıkışıklığı bildirimi

  // Güvenlik ve Diğer Sosyal Konular (Security and Social Issues)
  ANIMAL_CONTROL = 'ANIMAL_CONTROL', // Başıboş/Yaralı hayvan bildirimi
  NOISE_COMPLAINT = 'NOISE_COMPLAINT', // Gürültü şikayeti

  OTHER = 'OTHER', // Diğer (yukarıdakilere uymayan)
}

/**
 * Turkish labels for ReportType enum values
 * Used for displaying user-friendly names in the UI
 */
export const ReportTypeLabel: Record<ReportType, string> = {
  [ReportType.POTHOLE]: 'Yol/Kaldırım Çukuru',
  [ReportType.SIDEWALK_DAMAGE]: 'Kaldırım Hasarı',
  [ReportType.ROAD_DAMAGE]: 'Yol Hasarı (Genel)',
  [ReportType.ROAD_SIGN]: 'Trafik İşareti Sorunu',
  [ReportType.ROAD_MARKING]: 'Yol Çizgisi/Boyama Sorunu',
  [ReportType.TRAFFIC_LIGHT]: 'Trafik Lambası Arızası',
  [ReportType.ROAD_BLOCK]: 'Yol Engeli/Kapanması',
  [ReportType.STREET_LIGHT]: 'Sokak Lambası Arızası',
  [ReportType.ELECTRICITY_OUTAGE]: 'Elektrik Kesintisi',
  [ReportType.WATER_LEAKAGE]: 'Su Kaçağı/Patlağı',
  [ReportType.DRAINAGE_BLOCKAGE]: 'Rögar/Kanal Tıkanıklığı',
  [ReportType.SEWER_LEAKAGE]: 'Kanalizasyon Sorunu (Taşma/Kaçak)',
  [ReportType.GARBAGE_COLLECTION]: 'Çöp Toplama Sorunu',
  [ReportType.LITTER]: 'Çevre Kirliliği (Dökülen Çöp)',
  [ReportType.DUMPING]: 'Kaçak Moloz/Hafriyat',
  [ReportType.GRAFFITI]: 'İzinsiz Yazı/Grafiti',
  [ReportType.AIR_POLLUTION]: 'Hava Kirliliği',
  [ReportType.PARK_DAMAGE]: 'Park/Oyun Alanı Hasarı',
  [ReportType.TREE_ISSUE]: 'Ağaç Sorunu (Tehlikeli/Bakımsız)',
  [ReportType.PUBLIC_TRANSPORT]: 'Toplu Taşıma Sorunu',
  [ReportType.PUBLIC_TRANSPORT_STOP]: 'Durak Sorunu',
  [ReportType.PARKING_VIOLATION]: 'Hatalı Park/Park İhlali',
  [ReportType.TRAFFIC_CONGESTION]: 'Trafik Yoğunluğu',
  [ReportType.ANIMAL_CONTROL]: 'Hayvanlarla İlgili Sorun',
  [ReportType.NOISE_COMPLAINT]: 'Gürültü Şikayeti',
  [ReportType.OTHER]: 'Diğer Konular',
};

/**
 * Defines the possible municipal departments handling reports for Turkish municipalities.
 * Updated to reflect typical Turkish municipal department structure.
 * NOTE: Any changes here MUST be synchronized with the API's departments table and validation!
 */
export enum MunicipalityDepartment {
  // Temel Altyapı ve Fen İşleri
  ROADS_AND_INFRASTRUCTURE = 'ROADS_AND_INFRASTRUCTURE', // Fen İşleri (Yol, kaldırım, temel altyapı)
  PLANNING_URBANIZATION = 'PLANNING_URBANIZATION', // İmar ve Şehircilik

  // Yeşil Alanlar ve Çevre
  PARKS_AND_GARDENS = 'PARKS_AND_GARDENS', // Park ve Bahçeler
  ENVIRONMENTAL_PROTECTION = 'ENVIRONMENTAL_PROTECTION', // Çevre Koruma ve Kontrol

  // Ulaşım ve Trafik
  TRANSPORTATION_SERVICES = 'TRANSPORTATION_SERVICES', // Ulaşım Hizmetleri
  TRAFFIC_SERVICES = 'TRAFFIC_SERVICES', // Trafik Hizmetleri

  // Altyapı Hizmetleri
  WATER_AND_SEWERAGE = 'WATER_AND_SEWERAGE', // Su ve Kanalizasyon İşleri
  STREET_LIGHTING = 'STREET_LIGHTING', // Sokak Aydınlatma

  // Temizlik ve Hijyen
  CLEANING_SERVICES = 'CLEANING_SERVICES', // Temizlik İşleri (Çöp Toplama dahil)

  // Güvenlik ve Denetim
  MUNICIPAL_POLICE = 'MUNICIPAL_POLICE', // Zabıta Müdürlüğü
  FIRE_DEPARTMENT = 'FIRE_DEPARTMENT', // İtfaiye Daire Başkanlığı

  // Sağlık ve Sosyal Hizmetler
  HEALTH_AFFAIRS = 'HEALTH_AFFAIRS', // Sağlık İşleri Müdürlüğü
  VETERINARY_SERVICES = 'VETERINARY_SERVICES', // Veteriner İşleri Müdürlüğü
  SOCIAL_ASSISTANCE = 'SOCIAL_ASSISTANCE', // Sosyal Yardım İşleri

  // Kültür ve Sosyal
  CULTURE_AND_SOCIAL_AFFAIRS = 'CULTURE_AND_SOCIAL_AFFAIRS', // Kültür ve Sosyal İşler

  // Genel
  GENERAL_AFFAIRS = 'GENERAL_AFFAIRS', // Genel Konular / Diğer
}

/**
 * Turkish labels for MunicipalityDepartment enum values
 * Used for displaying user-friendly department names in the UI
 */
export const MunicipalityDepartmentLabel: Record<MunicipalityDepartment, string> = {
  [MunicipalityDepartment.ROADS_AND_INFRASTRUCTURE]: 'Fen İşleri ve Altyapı',
  [MunicipalityDepartment.PLANNING_URBANIZATION]: 'İmar ve Şehircilik',
  [MunicipalityDepartment.PARKS_AND_GARDENS]: 'Park ve Bahçeler',
  [MunicipalityDepartment.ENVIRONMENTAL_PROTECTION]: 'Çevre Koruma ve Kontrol',
  [MunicipalityDepartment.TRANSPORTATION_SERVICES]: 'Ulaşım Hizmetleri',
  [MunicipalityDepartment.TRAFFIC_SERVICES]: 'Trafik Hizmetleri',
  [MunicipalityDepartment.WATER_AND_SEWERAGE]: 'Su ve Kanalizasyon İşleri',
  [MunicipalityDepartment.STREET_LIGHTING]: 'Sokak Aydınlatma',
  [MunicipalityDepartment.CLEANING_SERVICES]: 'Temizlik İşleri Müdürlüğü',
  [MunicipalityDepartment.MUNICIPAL_POLICE]: 'Zabıta Müdürlüğü',
  [MunicipalityDepartment.FIRE_DEPARTMENT]: 'İtfaiye Daire Başkanlığı',
  [MunicipalityDepartment.HEALTH_AFFAIRS]: 'Sağlık İşleri Müdürlüğü',
  [MunicipalityDepartment.VETERINARY_SERVICES]: 'Veteriner İşleri Müdürlüğü',
  [MunicipalityDepartment.SOCIAL_ASSISTANCE]: 'Sosyal Yardım İşleri',
  [MunicipalityDepartment.CULTURE_AND_SOCIAL_AFFAIRS]: 'Kültür ve Sosyal İşler',
  [MunicipalityDepartment.GENERAL_AFFAIRS]: 'Genel Konular / Diğer',
};

/**
 * User information for report
 */
export interface UserInfo {
  id: number;
  fullName: string;
  email?: string;
  avatar?: string;
}

/**
 * Report category information
 */
export interface ReportCategoryInfo {
  id: number;
  name: string;
  description?: string;
  type: ReportType;
}

/**
 * Department information for report handling
 */
export interface DepartmentInfo {
  id: number;
  name: string;
  department: MunicipalityDepartment;
  description?: string;
}

/**
 * Employee information for report assignment
 */
export interface EmployeeInfo {
  id: number;
  fullName: string;
  title?: string;
  departmentId: number;
}

/**
 * Report media (images, videos, etc.)
 */
export interface ReportMedia {
  id: number;
  url: string;
  thumbnailUrl?: string;
  type: string;
  filename?: string;
  size?: number;
}

/**
 * Report status history entry
 */
export interface ReportStatusHistory {
  status: ReportStatus;
  changedAt: Date;
  changedByUserId?: number;
  changedByUser?: UserInfo;
  notes?: string;
}

/**
 * Report department history entry
 */
export interface ReportDepartmentHistory {
  departmentId: number;
  department: DepartmentInfo;
  changedAt: Date;
  changedByUserId?: number;
  changedByUser?: UserInfo;
  reason?: string;
}

/**
 * Main report interface - matches API response structure
 * Eliminates data duplication and uses proper object relationships
 */
export interface SharedReport {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  subStatus?: SubStatus;
  location: Point;
  address: string;

  // Related objects (no duplication)
  user: UserInfo;
  category: ReportCategoryInfo;
  currentDepartment: DepartmentInfo;
  assignedToEmployee?: EmployeeInfo;

  // Media and history
  reportMedias?: ReportMedia[];
  statusHistory?: ReportStatusHistory[];
  departmentHistory?: ReportDepartmentHistory[];

  // Assignments
  assignments?: SharedAssignment[];

  // Support and engagement metrics
  supportCount?: number;
  isSupportedByCurrentUser?: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Removed API DTO Helper Types (CreateReportDto, UpdateReportDto) and ReportAnalytics
// These belong in the API layer (apps/api/src/modules/reports/dto or interfaces)
