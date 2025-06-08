// apps/web/src/components/dashboard/NearbyReports.tsx
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TrendingUp as TrendingUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NearbyReportsProps {
  loading?: boolean;
}

export const NearbyReports = ({ loading = false }: NearbyReportsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        borderRadius: 3,
        flex: 1,
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            <TrendingUpIcon size={24} color={theme.palette.primary.main} />
            Yakınımdaki Raporlar
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              navigate('/reports/nearby');
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              px: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: 'primary.main',
              },
            }}
          >
            Haritada Gör
          </Button>
        </Box>

        {loading ? (
          Array.from(new Array(2)).map((_, index) => (
            <Grid size={{ xs: 12 }} key={`nearby-skeleton-${index}`}>
              <Skeleton
                variant="rectangular"
                height={100}
                sx={{ borderRadius: 2, mb: 2 }}
              />
            </Grid>
          ))
        ) : (
          <Typography color="text.secondary">
            Yakınınızdaki raporları görmek için konum izniniz gereklidir. (Bu
            bölüm geliştirilecektir)
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
