// apps/web/src/pages/CreateReportPage/types.ts
export interface StepIconProps {
  active?: boolean;
  completed?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ReportFormData {
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  departmentCode: string;
  categoryId: string;
  reportMedias: Array<{
    url: string;
    type: string;
  }>;
}

export interface StepConfig {
  label: string;
}
