/**
 * Validation Schema for Create Report Form
 * Uses Yup for step-by-step validation in stepper component
 * Updated for CIMER-like flow
 */

import * as yup from 'yup';
import { ReportType, MunicipalityDepartment } from '@kentnabiz/shared';
import type { CreateReportFormData } from '../types/createReportForm.types';

// API ile birebir uyumlu, tek ana şema
export const createReportFormSchema = yup.object({
  // Step 1: Department selection (required)
  departmentCode: yup
    .string()
    .oneOf(
      Object.values(MunicipalityDepartment),
      'Geçerli bir departman seçiniz'
    )
    .required('Departman seçimi zorunludur'),

  // Step 2: Category selection (required)
  categoryId: yup
    .number()
    .typeError('Geçerli bir kategori seçiniz')
    .required('Kategori seçimi zorunludur')
    .positive('Geçerli bir kategori seçiniz'),

  // Step 3: Title and description
  title: yup
    .string()
    .required('Başlık zorunludur')
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .trim(),
  description: yup
    .string()
    .required('Açıklama zorunludur')
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .trim(),

  // Step 4: Location and address
  address: yup
    .string()
    .required('Adres zorunludur')
    .min(10, 'Adres en az 10 karakter olmalıdır')
    .max(200, 'Adres en fazla 200 karakter olabilir')
    .trim(),
  location: yup
    .object({
      lat: yup
        .number()
        .typeError('Geçerli bir enlem girin')
        .required('Haritadan bir konum seçmeniz zorunludur.'),
      lng: yup
        .number()
        .typeError('Geçerli bir boylam girin')
        .required('Haritadan bir konum seçmeniz zorunludur.'),
    })
    .required('Konum bilgisi zorunludur'),

  // Step 5: Media upload
  reportMedias: yup
    .array()
    .of(yup.mixed<File | { mediaId: number }>().required())
    .max(5, 'En fazla 5 medya dosyası yükleyebilirsiniz')
    .nullable()
    .default(null),

  // Legacy/Optional fields (backend will assign reportType automatically)
  mainCategoryId: yup.number().optional(),
  reportType: yup
    .string()
    .oneOf(Object.values(ReportType), 'Geçerli bir rapor türü seçiniz')
    .optional(), // Backend will auto-assign from category
});

// Adım adım validasyon için alan isimleri - Updated for new flow
export const getStepFields = (step: number): (keyof CreateReportFormData)[] => {
  switch (step) {
    case 1:
      return ['departmentCode']; // Department selection
    case 2:
      return ['categoryId']; // Category selection
    case 3:
      return ['title', 'description']; // Title and description
    case 4:
      return ['location', 'address']; // Location and address
    case 5:
      return ['reportMedias']; // Media upload
    default:
      return [];
  }
};
