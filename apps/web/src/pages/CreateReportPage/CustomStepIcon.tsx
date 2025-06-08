// apps/web/src/pages/CreateReportPage/CustomStepIcon.tsx
import type { StepIconProps } from '@mui/material/StepIcon';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { ModernStepIcon } from './styles';

const steps = [
  { label: 'Temel Bilgiler', icon: EditIcon },
  { label: 'Konum Seçimi', icon: LocationIcon },
  { label: 'Kategori Belirleme', icon: CategoryIcon },
  { label: 'Medya Ekleme', icon: PhotoIcon },
  { label: 'Önizleme & Onay', icon: PreviewIcon },
];

export function CustomStepIcon(props: StepIconProps) {
  const { active, completed, className, icon } = props;
  const stepIndex = Number(icon) - 1;
  const IconComponent = steps[stepIndex]?.icon;

  return (
    <ModernStepIcon ownerState={{ completed, active }} className={className}>
      {IconComponent && <IconComponent />}
    </ModernStepIcon>
  );
}
