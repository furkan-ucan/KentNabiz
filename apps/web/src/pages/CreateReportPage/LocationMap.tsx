import React, { useRef, useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MyLocation as MyLocationIcon } from '@mui/icons-material';
import L from 'leaflet';

// Leaflet default marker icon fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with better visibility
const customIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

// Custom hook for map click events
function LocationSelector({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: e => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

// Component to update map view when position changes
function MapViewController({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [map, position]);

  return null;
}

// Enhanced draggable marker component
function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        onDragEnd(latLng.lat, latLng.lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Handle current location loading
  const handleLoadCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Konum servisi bu tarayıcıda desteklenmiyor');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        setIsLoadingLocation(false);

        // Show success message briefly
        setTimeout(() => {
          setLocationError(null);
        }, 3000);
      },
      error => {
        let message = 'Konum alınamadı';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Konum bilgisi mevcut değil.';
            break;
          case error.TIMEOUT:
            message = 'Konum alma işlemi zaman aşımına uğradı.';
            break;
        }
        setLocationError(message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Handle marker drag
  const handleMarkerDrag = (lat: number, lng: number) => {
    onLocationChange(lat, lng);
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    onLocationChange(lat, lng);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Current Location Button */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={
            isLoadingLocation ? (
              <CircularProgress size={16} />
            ) : (
              <MyLocationIcon />
            )
          }
          onClick={handleLoadCurrentLocation}
          disabled={disabled || isLoadingLocation}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          {isLoadingLocation ? 'Konum Alınıyor...' : 'Mevcut Konumu Yükle'}
        </Button>
      </Box>
      {/* Error Alert */}
      {locationError && (
        <Alert
          severity="error"
          sx={{ mb: 2, backgroundColor: 'rgba(211, 47, 47, 0.1)' }}
          onClose={() => setLocationError(null)}
        >
          {locationError}
        </Alert>
      )}{' '}
      {/* Instructions */}
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        💡{' '}
        <span>
          Haritaya tıklayarak konum seçin veya mavi işaretçiyi sürükleyin
        </span>
      </Typography>
      {/* Map Container */}
      <Box
        sx={{
          height: 350,
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '& .leaflet-container': {
            height: '100%',
            width: '100%',
            backgroundColor: '#1a1a1a',
          },
          '& .leaflet-control-container': {
            '& .leaflet-control': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& a': {
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
          },
        }}
      >
        {' '}
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Map view controller to animate to new position */}
          <MapViewController position={[latitude, longitude]} />

          {/* Location selector for click events */}
          <LocationSelector onLocationChange={handleMapClick} />

          {/* Draggable marker */}
          <DraggableMarker
            position={[latitude, longitude]}
            onDragEnd={handleMarkerDrag}
          />
        </MapContainer>
      </Box>{' '}
      {/* Coordinates Display */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}
        >
          📍 Seçilen Konum:
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <strong>Enlem:</strong> {latitude.toFixed(6)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <strong>Boylam:</strong> {longitude.toFixed(6)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
