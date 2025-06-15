import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Slider,
  Box,
  IconButton,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { PlayArrow, Pause, RestartAlt, AccessTime } from '@mui/icons-material';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface TimeSliderWidgetProps {
  filters: AnalyticsFilters;
  onFiltersChange?: (filters: AnalyticsFilters) => void;
  disabled?: boolean;
}

export const TimeSliderWidget: React.FC<TimeSliderWidgetProps> = ({
  filters,
  onFiltersChange,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [localTimeValue, setLocalTimeValue] = useState<number>(0);
  const [playTimer, setPlayTimer] = useState<number | null>(null);

  // Tarih aralığını hesaple
  const timeRange = useMemo(() => {
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 gün önce
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

    return {
      start: startDate.getTime(),
      end: endDate.getTime(),
      current: endDate.getTime(),
    };
  }, [filters.startDate, filters.endDate]);
  // Step değerini hesaple - Her zaman günlük analiz için 1 gün
  const step = useMemo(() => {
    return 24 * 60 * 60 * 1000; // Her zaman 1 gün (24 saat)
  }, []);

  // Local time value'yu initialize et
  useEffect(() => {
    setLocalTimeValue(timeRange.current);
  }, [timeRange]);
  // Debounced filter update
  const debouncedFilterUpdate = useCallback(
    (newTime: number) => {
      const timeoutId = setTimeout(() => {
        const newEndDate = new Date(newTime).toISOString().split('T')[0];
        onFiltersChange?.({
          ...filters,
          endDate: newEndDate,
        });
      }, 500);

      // Return cleanup function (not used in this case but good practice)
      return () => clearTimeout(timeoutId);
    },
    [filters, onFiltersChange]
  );

  // Slider değer değiştiğinde
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const timeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setLocalTimeValue(timeValue);
  };

  // Slider değer commit edildiğinde (sürükleme bittiğinde)
  const handleSliderChangeCommitted = (
    _: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => {
    const timeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    debouncedFilterUpdate(timeValue);
  };

  // Play/Pause functionality
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (playTimer) {
        clearInterval(playTimer);
        setPlayTimer(null);
      }
      setIsPlaying(false);
    } else {
      // Play
      const timer = setInterval(() => {
        setLocalTimeValue(prev => {
          const next = prev + step;
          if (next >= timeRange.end) {
            // Sona ulaştık, durdur
            setIsPlaying(false);
            return timeRange.end;
          }

          // Otomatik güncelleştir
          debouncedFilterUpdate(next);
          return next;
        });
      }, 1000); // Her saniye güncelle

      setPlayTimer(timer as unknown as number);
      setIsPlaying(true);
    }
  };

  // Reset to end
  const handleReset = () => {
    if (playTimer) {
      clearInterval(playTimer);
      setPlayTimer(null);
    }
    setIsPlaying(false);
    setLocalTimeValue(timeRange.end);
    debouncedFilterUpdate(timeRange.end);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playTimer) {
        clearInterval(playTimer);
      }
    };
  }, [playTimer]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  // Format step label - Her zaman günlük
  const getStepLabel = () => {
    return 'Günlük';
  };

  if (disabled || timeRange.start >= timeRange.end) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardHeader
          avatar={<AccessTime color="disabled" />}
          title="Zaman Kaydırıcısı"
          subheader="Tarih aralığı seçmek için filtreleri ayarlayın"
        />
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<AccessTime color="primary" />}
        title="Zaman Kaydırıcısı"
        subheader={`${formatDate(timeRange.start)} - ${formatDate(timeRange.end)} arasında ${getStepLabel().toLowerCase()} analiz`}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              label={getStepLabel()}
              variant="outlined"
              color="primary"
            />
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ px: 2 }}>
          {/* Tarih Göstergesi */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                minWidth: 120,
              }}
            >
              {formatDate(localTimeValue)}
            </Typography>
          </Box>

          {/* Slider */}
          <Slider
            value={localTimeValue}
            min={timeRange.start}
            max={timeRange.end}
            step={step}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            disabled={disabled}
            sx={{
              height: 8,
              '& .MuiSlider-track': {
                backgroundColor: theme.palette.primary.main,
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                height: 20,
                width: 20,
                backgroundColor: theme.palette.primary.main,
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[4],
                '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                  boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
                },
              },
              '& .MuiSlider-rail': {
                color: theme.palette.grey[300],
                opacity: 1,
              },
            }}
          />

          {/* Kontrol Butonları */}
          <Box
            sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}
          >
            <IconButton
              onClick={handlePlayPause}
              disabled={disabled}
              color="primary"
              size="large"
              sx={{
                backgroundColor: theme.palette.primary.main + '10',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '20',
                },
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              onClick={handleReset}
              disabled={disabled}
              color="primary"
              size="large"
              sx={{
                backgroundColor: theme.palette.primary.main + '10',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '20',
                },
              }}
            >
              <RestartAlt />
            </IconButton>
          </Box>

          {/* Durumu Göstergesi */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {isPlaying ? 'Oynatılıyor...' : 'Durduruldu'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimeSliderWidget;
