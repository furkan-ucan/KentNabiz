// apps/web/src/pages/LoginPage/FeaturesColumn.tsx
import { Box, Stack, Typography } from '@mui/material';
import {
  SettingsSuggestRounded,
  ConstructionRounded,
  ThumbUpAltRounded,
  AutoFixHighRounded,
} from '@mui/icons-material';
import * as S from './FeaturesColumn.styles';

const featuresData = [
  {
    icon: <SettingsSuggestRounded sx={S.featureIconStyles} />,
    title: 'Akıllı Yönetim',
    description:
      'Kent yönetiminde verimliliği artıran akıllı çözümler sunuyoruz.',
  },
  {
    icon: <ConstructionRounded sx={S.featureIconStyles} />,
    title: 'Güçlü Altyapı',
    description:
      'Dayanıklı ve ölçeklenebilir teknoloji altyapısı ile geleceğe hazır.',
  },
  {
    icon: <ThumbUpAltRounded sx={S.featureIconStyles} />,
    title: 'Kolay Kullanım',
    description:
      'Sezgisel ve kullanıcı dostu arayüz ile herkes için erişilebilir.',
  },
  {
    icon: <AutoFixHighRounded sx={S.featureIconStyles} />,
    title: 'Yenilikçi Özellikler',
    description: 'Sürekli gelişen özellikler ile modern kent yönetimi.',
  },
];

export const FeaturesColumn = () => (
  <Stack sx={S.featuresColumnContainerStyles}>
    {featuresData.map((item, index) => (
      <Stack key={index} direction="row" sx={S.featureCardStyles}>
        <Box sx={S.featureIconWrapperStyles}>{item.icon}</Box>
        <Box sx={S.featureTextWrapperStyles}>
          <Typography gutterBottom sx={S.featureTitleStyles}>
            {item.title}
          </Typography>
          <Typography variant="body2" sx={S.featureDescriptionStyles}>
            {item.description}
          </Typography>
        </Box>
      </Stack>
    ))}
  </Stack>
);
