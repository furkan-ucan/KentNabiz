/**
 * Form Data Types for Create Report Stepper
 * Defines the data structure used by react-hook-form
 */

import { ReportType, MunicipalityDepartment } from '@kentnabiz/shared';

// Main form data interface for react-hook-form
export interface CreateReportFormData {
  // Step 1: Department Selection (NEW - CIMER-like flow)
  departmentCode: MunicipalityDepartment;

  // Step 2: Category Selection (Updated - now filtered by department)
  categoryId: number;

  // Step 3: Title and Description
  title: string;
  description: string;

  // Step 4: Location and Address
  location: {
    lat: number;
    lng: number;
  };
  address: string;

  // Step 5: Media Upload
  reportMedias: (File | { mediaId: number })[] | null;

  // Legacy fields (kept for backward compatibility, may be removed later)
  mainCategoryId?: number; // Optional - for old flows if needed
  reportType?: ReportType; // Optional - backend will auto-assign from category
}

// Default values for the form
export const defaultFormValues: CreateReportFormData = {
  departmentCode: MunicipalityDepartment.GENERAL_AFFAIRS, // User will select in step 1
  categoryId: 0, // User will select in step 2
  title: '',
  description: '',
  location: { lat: 0, lng: 0 },
  address: '',
  reportMedias: null,
  // Legacy defaults
  mainCategoryId: 0,
  reportType: ReportType.OTHER,
};

// Step titles for UI display - Updated for new flow
export const stepTitles = {
  1: 'Ana Departman Seçimi', // NEW
  2: 'Kategori Seçimi', // Updated
  3: 'Sorunun Temel Bilgileri', // Moved from step 2
  4: 'Konum ve Adres', // Moved from step 4
  5: 'Fotoğraf ve Medya', // Moved from step 5
};

// Total number of steps (still 5, but reordered)
export const TOTAL_STEPS = 5;
