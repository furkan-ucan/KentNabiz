import { Point } from 'geojson';

export enum ReportStatus {
  REPORTED = 'REPORTED', // Bildirildi
  IN_PROGRESS = 'IN_PROGRESS', // İşlemde
  DEPARTMENT_CHANGED = 'DEPARTMENT_CHANGED', // Birim Değiştirildi
  RESOLVED = 'RESOLVED', // Çözüldü
  REJECTED = 'REJECTED', // Reddedildi
}

export enum ReportType {
  POTHOLE = 'POTHOLE',
  POTHOLE_REPAIR = 'POTHOLE_REPAIR', // Çukur Onarım
  POTHOLE_RECONSTRUCTION = 'POTHOLE_RECONSTRUCTION', // Çukur Yenileme
  POTHOLE_REHABILITATION = 'POTHOLE_REHABILITATION', // Çukur Rehabilitasyon
  POTHOLE_DAMAGE = 'POTHOLE_DAMAGE', // Çukur Hasar
  ROAD_DAMAGE = 'ROAD_DAMAGE',
  ROAD_SIGN = 'ROAD_SIGN', // Yol Tabelası
  ROAD_MARKING = 'ROAD_MARKING', // Yol Çizgisi
  ROAD_CONSTRUCTION = 'ROAD_CONSTRUCTION', // Yol İnşaatı
  ROAD_MAINTENANCE = 'ROAD_MAINTENANCE', // Yol Bakım
  ROAD_CLEANING = 'ROAD_CLEANING', // Yol Temizlik
  ROAD_REPAIR = 'ROAD_REPAIR', // Yol Onarım
  ROAD_RECONSTRUCTION = 'ROAD_RECONSTRUCTION', // Yol Yenileme
  ROAD_REHABILITATION = 'ROAD_REHABILITATION', // Yol Rehabilitasyon
  ROAD_BLOCK = 'ROAD_BLOCK', // Yol Engeli
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT', // Trafik Lambası
  STREET_LIGHT = 'STREET_LIGHT', // Sokak Lambası
  LITTER = 'LITTER', // Çöp
  GRAFFITI = 'GRAFFITI', // Grafiti
  PARK_DAMAGE = 'PARK_DAMAGE', // Park Hasar
  PARKING_VIOLATION = 'PARKING_VIOLATION', // Park Yeri İhlali
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT', // Toplu Taşıma
  PUBLIC_TRANSPORT_VIOLATION = 'PUBLIC_TRANSPORT_VIOLATION', // Toplu Taşıma İhlali
  PUBLIC_TRANSPORT_STOP = 'PUBLIC_TRANSPORT_STOP', // Toplu Taşıma Durağı
  PUBLIC_TRANSPORT_VEHICLE = 'PUBLIC_TRANSPORT_VEHICLE', // Toplu Taşıma Araçları
  OTHER = 'OTHER',
}

export enum MunicipalityDepartment {
  ROADS = 'ROADS', // Yollar ve Altyapı
  INFRASTRUCTURE = 'INFRASTRUCTURE', // Altyapı Hizmetleri
  ENVIRONMENTAL = 'ENVIRONMENTAL', // Çevre Temizlik
  PARKS = 'PARKS', // Park ve Bahçeler
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT', // Toplu Taşıma
  WATER = 'WATER', // Su İşleri
  TRAFFIC = 'TRAFFIC', // Trafik
  BUILDING = 'BUILDING', // Yapı Kontrol
  MUNICIPALITY = 'MUNICIPALITY', // İdari İşler
  HEALTH = 'HEALTH', // Sağlık
  FIRE = 'FIRE', // İtfaiye
  GENERAL = 'GENERAL', // Genel (Belirsiz/Varsayılan)
}

// Kategori yapısı için arayüzler
export interface IReportCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: IReportCategory[]; // Alt kategoriler için
}

// Hiyerarşik kategori yapısı - API cevaplarında kullanılacak ağaç yapısı
export interface ICategoryTree extends IReportCategory {
  children: ICategoryTree[];
}

export interface IReport {
  id: number;
  title: string;
  description: string;
  location: Point;
  address: string;
  status: ReportStatus;
  type: ReportType; // Geriye uyumluluk için tutuldu
  categoryId: number; // Yeni kategori yaklaşımı
  department: MunicipalityDepartment;
  userId: number;
  adminId?: number;
  departmentChangeReason?: string;
  previousDepartment?: string;
  createdAt: Date;
  updatedAt: Date;
  reportMedias?: IReportMedia[];
  departmentHistory?: IDepartmentChange[];
}

export interface IReportMedia {
  id: number;
  reportId: number;
  url: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartmentChange {
  id: number;
  reportId: number;
  oldDepartment: MunicipalityDepartment;
  newDepartment: MunicipalityDepartment;
  reason: string;
  changedByDepartment: MunicipalityDepartment;
  createdAt: Date;
}

export interface IReportFindOptions {
  id?: number;
  userId?: number;
  status?: ReportStatus;
  type?: ReportType;
  department?: MunicipalityDepartment;
  limit?: number;
  offset?: number;
  withinRadius?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface ISpatialQueryResult {
  data: IReport[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  type?: ReportType;
  status?: ReportStatus;
  location?: Point;
  address?: string;
  department?: MunicipalityDepartment;
  departmentChangeReason?: string;
  departmentChangedBy?: number;
  departmentChangedAt?: Date;
  resolvedAt?: Date; // Çözüm tarihi eklendi
  reportMedias?: Array<{
    url: string;
    type: string;
  }>;
}
