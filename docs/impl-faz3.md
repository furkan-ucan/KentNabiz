# Faz 3: Web Uygulama Geliştirme

## 📌 Adım 3.1: Temel Proje Yapılandırması

### Açıklama
React tabanlı web uygulamasının temel iskeletini ve yapılandırmasını oluşturuyoruz.

### 🛠 Teknolojiler
- React ^18.2.0
- TypeScript ^5.0.0
- Vite ^5.0.0
- ESLint ^8.0.0
- Prettier ^3.0.0

### 📂 Proje Yapısı
```typescript
apps/web/
├── src/
│   ├── assets/          # Statik dosyalar
│   ├── components/      # UI components
│   ├── config/          # Konfigürasyon
│   ├── features/        # Feature modülleri
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Sayfa layoutları
│   ├── lib/            # Utility functions
│   ├── pages/          # Sayfa components
│   ├── routes/         # Routing config
│   ├── services/       # API services
│   ├── store/          # Redux store
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Root component
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### ✅ Kontrol Noktaları
- [ ] Vite projesi kuruldu
- [ ] TypeScript konfigürasyonu yapıldı
- [ ] ESLint ve Prettier aktif
- [ ] Klasör yapısı oluşturuldu

### 📌 Onay Gereksinimleri
- Development server çalışıyor
- TypeScript derleme başarılı
- Lint komutları hatasız çalışıyor

## 📌 Adım 3.2: Routing ve Lazy Loading

### Açıklama
React Router ile sayfa yönlendirme ve kod bölme (code splitting) yapılandırması.

### 🛠 Teknolojiler
- React Router ^6.20.0
- React Suspense
- React Error Boundary

### 📂 Router Yapılandırması
```typescript
// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/HomePage'));
const ReportPage = lazy(() => import('../pages/ReportPage'));
const ReportMapPage = lazy(() => import('../pages/ReportMapPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { 
        index: true, 
        element: <HomePage /> 
      },
      {
        path: 'reports',
        children: [
          { 
            index: true, 
            element: <ReportPage /> 
          },
          { 
            path: 'map', 
            element: <ReportMapPage /> 
          },
          {
            path: ':id',
            element: <ReportDetailPage />
          }
        ]
      },
      {
        path: 'profile',
        element: <ProfilePage />
      }
    ]
  }
]);
```

### ✅ Kontrol Noktaları
- [ ] Route tanımlamaları
- [ ] Lazy loading
- [ ] Error boundary
- [ ] Protected routes

### 📌 Onay Gereksinimleri
- Tüm rotalar çalışıyor
- Code splitting aktif
- Route guard'lar aktif

## 📌 Adım 3.3: State Management

### Açıklama
Redux Toolkit ile state yönetimi ve async thunk yapılandırması.

### 🛠 Teknolojiler
- @reduxjs/toolkit ^2.0.0
- React Redux ^9.0.0

### 📂 Store Yapılandırması
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import reportReducer from './slices/reportSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// src/store/slices/reportSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params: ReportQueryParams) => {
    const response = await reportService.getReports(params);
    return response.data;
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // sync reducers
  },
  extraReducers: (builder) => {
    // async reducers
  }
});
```

### ✅ Kontrol Noktaları
- [ ] Store konfigürasyonu
- [ ] Slice tanımlamaları
- [ ] Async thunks
- [ ] Selector hooks

### 📌 Onay Gereksinimleri
- Redux DevTools çalışıyor
- State updates performanslı
- Side effects yönetiliyor

## 📌 Adım 3.4: UI Components ve Tema Sistemi

### Açıklama
Chakra UI ile komponent sistemi, tema yapılandırması ve responsive tasarım.

### 🛠 Teknolojiler
- @chakra-ui/react ^2.8.0
- @emotion/react ^11.0.0
- @emotion/styled ^11.0.0
- framer-motion ^10.0.0

### 📂 Tema Yapılandırması
```typescript
// src/styles/theme/index.ts
import { extendTheme } from '@chakra-ui/react';
import { buttonStyles } from './components/button';
import { cardStyles } from './components/card';
import { foundations } from './foundations';

export const theme = extendTheme({
  ...foundations,
  components: {
    Button: buttonStyles,
    Card: cardStyles
  }
});

// src/styles/theme/foundations/colors.ts
export const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    500: '#2B6CB0',
    600: '#2C5282',
    900: '#1A365D'
  },
  status: {
    new: '#38A169',
    inProgress: '#D69E2E',
    resolved: '#3182CE',
    rejected: '#E53E3E'
  }
};

// src/styles/theme/foundations/index.ts
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const foundations = {
  colors,
  ...typography,
  space: spacing
};
```

### 📂 Base Components
```typescript
// src/components/ui/Button/Button.tsx
import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

export interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = ({ variant = 'primary', ...props }: CustomButtonProps) => {
  return <ChakraButton variant={variant} {...props} />;
};

// src/components/ui/Card/ReportCard.tsx
import { Box, Text, Badge } from '@chakra-ui/react';
import { Report } from '@/types';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export const ReportCard = ({ report, onClick }: ReportCardProps) => {
  return (
    <Box 
      borderRadius="lg" 
      p={4} 
      boxShadow="md"
      onClick={onClick}
      cursor="pointer"
      _hover={{ boxShadow: 'lg' }}
    >
      <Text fontSize="lg" fontWeight="bold">{report.title}</Text>
      <Badge colorScheme={getStatusColor(report.status)}>
        {report.status}
      </Badge>
    </Box>
  );
};
```

### ✅ Kontrol Noktaları
- [ ] Tema foundations (colors, typography, spacing)
- [ ] Component variants
- [ ] Responsive patterns
- [ ] Accessibility features
- [ ] Dark mode support

### 📌 Onay Gereksinimleri
- Tema tutarlılığı
- Component isolation
- A11y standartları
- Responsive design

## 📌 Adım 3.5: Performans Optimizasyonu

### Açıklama
Bundle size optimizasyonu, code splitting ve performans monitoring.

### 🛠 Teknolojiler
- webpack-bundle-analyzer
- @compression/brotli
- web-vitals

### 📂 Bundle Optimizasyonu
```typescript
// vite.config.ts
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chakra': ['@chakra-ui/react'],
          'leaflet': ['leaflet', 'react-leaflet'],
          'redux': ['@reduxjs/toolkit', 'react-redux']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  plugins: [
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ]
});

// src/lib/performance/vitals.ts
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator['connection'] &&
    'effectiveType' in navigator['connection']
    ? navigator['connection']['effectiveType']
    : '';
}

export function sendToAnalytics(metric) {
  const body = {
    dsn: 'your-analytics-key', 
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed()
  };

  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  navigator.sendBeacon(vitalsUrl, blob);
}

export function webVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 📂 Lazy Loading ve Code Splitting
```typescript
// src/routes/LazyComponents.ts
import { lazy } from 'react';

export const ReportMap = lazy(() => 
  import('@/features/reports/components/ReportMap')
    .then(module => ({
      default: module.ReportMap
    }))
);

export const ReportForm = lazy(() => 
  import('@/features/reports/components/ReportForm')
    .then(module => ({
      default: module.ReportForm
    }))
);

// src/components/SuspenseBoundary.tsx
import { Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';

export const SuspenseBoundary = ({ children }) => (
  <Suspense
    fallback={
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    }
  >
    {children}
  </Suspense>
);
```

### ✅ Kontrol Noktaları
- [ ] Bundle size analizi
- [ ] Code splitting stratejisi
- [ ] Web vitals ölçümü
- [ ] Image optimization
- [ ] Cache stratejisi

### 📌 Onay Gereksinimleri
- Bundle size < 300KB (gzipped)
- First paint < 2s
- TTI < 3.5s
- CLS < 0.1

## 📌 Adım 3.6: API ve Veri Katmanı

### Açıklama
API client, interceptors ve veri yönetimi sistemi.

### 🛠 Teknolojiler
- axios ^1.6.0
- @tanstack/react-query ^5.0.0
- axios-retry ^4.0.0

### 📂 API Client Yapılandırması
```typescript
// src/lib/api/client.ts
import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { refreshToken } from '@/features/auth/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosRetry(apiClient, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429;
  }
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        localStorage.setItem('token', newToken);
        
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// src/lib/api/hooks/useReports.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';

export const useReports = (params: ReportQueryParams) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => apiClient.get('/reports', { params }),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (report: CreateReportDto) => 
      apiClient.post('/reports', report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
};
```

## 📌 Adım 3.11: Form Validation ve API Integration

### Açıklama
Formik, Yup ve Axios ile form doğrulama ve API entegrasyonu yapılandırması.

### 🛠 Teknolojiler
- formik ^2.4.0
- yup ^1.3.0
- axios ^1.6.0
- @tanstack/react-query ^5.0.0

### 📂 Form Validation Schema
```typescript
// src/lib/validation/schemas.ts
import * as Yup from 'yup';
import { t } from '@/lib/i18n';

export const reportSchema = Yup.object({
  title: Yup.string()
    .required(t('validation.required'))
    .min(5, t('validation.minLength', { min: 5 }))
    .max(100, t('validation.maxLength', { max: 100 })),
  description: Yup.string()
    .required(t('validation.required'))
    .min(20, t('validation.minLength', { min: 20 })),
  category: Yup.string()
    .required(t('validation.required'))
    .oneOf(['INFRASTRUCTURE', 'TRAFFIC', 'ENVIRONMENT'], t('validation.invalidCategory')),
  location: Yup.object({
    latitude: Yup.number()
      .required(t('validation.required'))
      .min(-90, t('validation.invalidLatitude'))
      .max(90, t('validation.invalidLatitude')),
    longitude: Yup.number()
      .required(t('validation.required'))
      .min(-180, t('validation.invalidLongitude'))
      .max(180, t('validation.invalidLongitude'))
  }),
  media: Yup.array().of(
    Yup.object({
      type: Yup.string().oneOf(['IMAGE', 'VIDEO']),
      file: Yup.mixed()
        .test('fileSize', t('validation.fileSize'), (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024; // 5MB
        })
        .test('fileType', t('validation.fileType'), (value) => {
          if (!value) return true;
          return ['image/jpeg', 'image/png', 'video/mp4'].includes(value.type);
        })
    })
  )
});

// src/lib/validation/messages.ts
export const validationMessages = {
  tr: {
    required: '{{field}} alanı zorunludur',
    minLength: 'En az {{min}} karakter girilmelidir',
    maxLength: 'En fazla {{max}} karakter girilmelidir',
    invalidCategory: 'Geçersiz kategori',
    invalidLatitude: 'Geçersiz enlem değeri',
    invalidLongitude: 'Geçersiz boylam değeri',
    fileSize: 'Dosya boyutu 5MB\'dan küçük olmalıdır',
    fileType: 'Desteklenmeyen dosya formatı'
  },
  en: {
    // ... English translations
  }
};
```

### 📂 API Client Configuration
```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { toast } from '@chakra-ui/toast';
import { refreshToken } from '@/lib/auth';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız - kullanıcıyı logout yap
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Global error handling
    if (error.response?.status === 500) {
      toast({
        title: 'Sunucu Hatası',
        description: 'Lütfen daha sonra tekrar deneyin',
        status: 'error',
        duration: 5000
      });
    }

    return Promise.reject(error);
  }
);

// src/lib/api/hooks/useReportSubmit.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Report } from '@/types';

export const useReportSubmit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Report) => 
      apiClient.post('/reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Başarılı',
        description: 'Raporunuz başarıyla gönderildi',
        status: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: error.response?.data?.message || 'Bir hata oluştu',
        status: 'error'
      });
    }
  });
};
```

### 📂 Form Components
```typescript
// src/components/forms/ReportForm/index.tsx
import { Formik, Form } from 'formik';
import { 
  VStack,
  Button,
  useToast
} from '@chakra-ui/react';
import { reportSchema } from '@/lib/validation/schemas';
import { FormField } from '@/components/ui/FormField';
import { LocationPicker } from '@/components/map/LocationPicker';
import { MediaUpload } from '@/components/ui/MediaUpload';
import { useReportSubmit } from '@/lib/api/hooks/useReportSubmit';

export const ReportForm = () => {
  const { mutate, isPending } = useReportSubmit();
  
  return (
    <Formik
      initialValues={{
        title: '',
        description: '',
        category: '',
        location: null,
        media: []
      }}
      validationSchema={reportSchema}
      onSubmit={(values) => mutate(values)}
    >
      {({ isValid, dirty }) => (
        <Form>
          <VStack spacing={4}>
            <FormField
              name="title"
              label="Başlık"
              placeholder="Raporunuz için kısa bir başlık girin"
            />
            
            <FormField
              name="description"
              label="Açıklama"
              placeholder="Detaylı açıklama yazın"
              textarea
            />
            
            <FormField
              name="category"
              label="Kategori"
              type="select"
              options={[
                { value: 'INFRASTRUCTURE', label: 'Altyapı' },
                { value: 'TRAFFIC', label: 'Trafik' },
                { value: 'ENVIRONMENT', label: 'Çevre' }
              ]}
            />
            
            <LocationPicker name="location" />
            
            <MediaUpload name="media" />
            
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isPending}
              isDisabled={!isValid || !dirty}
              w="full"
            >
              Rapor Gönder
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
```

### ✅ Kontrol Noktaları
- [ ] Form validation çalışıyor
- [ ] API entegrasyonu tamamlandı
- [ ] Error handling yapıldı
- [ ] Token yenileme mekanizması çalışıyor
- [ ] i18n desteği sağlandı

### 📌 Onay Gereksinimleri
- Tüm form alanları doğru validate ediliyor
- API hataları kullanıcıya gösteriliyor
- Token yenileme sorunsuz çalışıyor
- Form submit işlemi başarılı

## 📌 Adım 3.7: Map Integration

### Açıklama
Leaflet.js ile harita entegrasyonu ve marker yönetimi.

### 🛠 Teknolojiler
- leaflet ^1.9.0
- react-leaflet ^4.2.0

### 📂 Map Yapılandırması
```typescript
// src/components/map/MapView.tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export const MapView = () => {
  // map implementation
};

// src/hooks/useMap.ts
export const useMap = () => {
  // custom map hook
};
```

### ✅ Kontrol Noktaları
- [ ] Map initialization
- [ ] Marker management
- [ ] Cluster support
- [ ] Location picker

### 📌 Onay Gereksinimleri
- Harita sorunsuz yükleniyor
- Marker'lar çalışıyor
- Performans optimizasyonları yapıldı

## 📌 Adım 3.8: Form ve Validation Sistemi

### Açıklama
Formik, Yup ve i18n entegrasyonu ile gelişmiş form yönetimi.

### 🛠 Teknolojiler
- formik ^2.4.0
- yup ^1.3.0
- i18next ^23.0.0
- i18next-react ^13.0.0

### 📂 Validation Yapılandırması
```typescript
// src/lib/validation/schemas/index.ts
import * as yup from 'yup';
import i18n from '@/config/i18n';

// Custom validation rules
yup.addMethod(yup.string, 'customPhone', function () {
  return this.matches(/^[0-9]{10}$/, i18n.t('validation.phone'));
});

yup.addMethod(yup.object, 'location', function () {
  return this.test('location', i18n.t('validation.location'), function (value) {
    if (!value) return false;
    return value.latitude && value.longitude;
  });
});

// src/lib/validation/schemas/report.schema.ts
export const reportSchema = yup.object({
  title: yup.string()
    .required(i18n.t('validation.required'))
    .min(3, i18n.t('validation.minLength', { count: 3 })),
  description: yup.string()
    .required(i18n.t('validation.required'))
    .max(500, i18n.t('validation.maxLength', { count: 500 })),
  location: yup.object()
    .location()
    .required(i18n.t('validation.required')),
  category: yup.string()
    .oneOf(['INFRASTRUCTURE', 'ENVIRONMENT', 'SECURITY'])
    .required(i18n.t('validation.required')),
  photos: yup.array()
    .of(yup.string())
    .max(5, i18n.t('validation.maxPhotos'))
});
```

### 📂 Form Components
```typescript
// src/components/forms/BaseForm/FormField.tsx
import { useField } from 'formik';
import { 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  Input
} from '@chakra-ui/react';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
}

export const FormField = ({ name, label, type = 'text' }: FormFieldProps) => {
  const [field, meta] = useField(name);
  
  return (
    <FormControl isInvalid={meta.touched && meta.error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        {...field}
        id={name}
        type={type}
        variant="filled"
        _focus={{
          borderColor: 'brand.500',
          bg: 'white'
        }}
      />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

// src/components/forms/ReportForm/ReportForm.tsx
import { Formik, Form } from 'formik';
import { reportSchema } from '@/lib/validation/schemas';
import { FormField } from '../BaseForm/FormField';
import { LocationPicker } from './LocationPicker';
import { PhotoUpload } from './PhotoUpload';

interface ReportFormProps {
  onSubmit: (values: ReportFormValues) => Promise<void>;
}

export const ReportForm = ({ onSubmit }: ReportFormProps) => {
  const initialValues: ReportFormValues = {
    title: '',
    description: '',
    location: null,
    category: '',
    photos: []
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={reportSchema}
      onSubmit={async (values, actions) => {
        try {
          await onSubmit(values);
          actions.resetForm();
        } catch (error) {
          actions.setStatus({ error: error.message });
        }
      }}
    >
      {({ isSubmitting, status }) => (
        <Form>
          <VStack spacing={4} align="stretch">
            <FormField name="title" label={t('form.title')} />
            <FormField 
              name="description" 
              label={t('form.description')} 
              type="textarea" 
            />
            <LocationPicker name="location" />
            <PhotoUpload name="photos" />
            
            {status?.error && (
              <Alert status="error">
                <AlertIcon />
                {status.error}
              </Alert>
            )}
            
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="brand"
              size="lg"
            >
              {t('form.submit')}
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
```

### 📂 Error Boundary Yapılandırması
```typescript
// src/components/ErrorBoundary/index.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  Button,
  VStack
} from '@chakra-ui/react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {t('error.title')}
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {error.message}
      </AlertDescription>
      <Button
        onClick={resetErrorBoundary}
        mt={4}
        colorScheme="red"
      >
        {t('error.retry')}
      </Button>
    </Alert>
  );
};

export const AppErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset uygulama state'i
      }}
      onError={(error) => {
        // Hata loglama servisi
        console.error('Error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// src/App.tsx
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@/styles/theme';

export const App = () => {
  return (
    <AppErrorBoundary>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ChakraProvider>
    </AppErrorBoundary>
  );
};
```

### ✅ Kontrol Noktaları
- [ ] i18n entegrasyonu
- [ ] Custom validation rules
- [ ] Reusable form components
- [ ] Error boundary setup
- [ ] Form state management

### 📌 Onay Gereksinimleri
- Form validasyonları çalışıyor
- i18n çevirileri tam
- Error handling tutarlı
- UX akışı sorunsuz

## 📌 Adım 3.9: i18n ve Localization

### Açıklama
Çoklu dil desteği ve yerelleştirme yapılandırması.

### 🛠 Teknolojiler
- i18next ^23.0.0
- react-i18next ^13.0.0
- i18next-http-backend ^2.0.0
- i18next-browser-languagedetector ^7.0.0

### 📂 i18n Yapılandırması
```typescript
// src/config/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr',
    supportedLngs: ['tr', 'en'],
    ns: ['common', 'validation', 'reports'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// src/components/LanguageSwitcher/index.tsx
import { useTranslation } from 'react-i18next';
import { Select } from '@chakra-ui/react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      size="sm"
      w="auto"
    >
      <option value="tr">Türkçe</option>
      <option value="en">English</option>
    </Select>
  );
};
```

### 📂 Dil Dosyaları
```json
// public/locales/tr/common.json
{
  "nav": {
    "home": "Ana Sayfa",
    "reports": "Raporlar",
    "map": "Harita",
    "profile": "Profil"
  },
  "actions": {
    "submit": "Gönder",
    "cancel": "İptal",
    "save": "Kaydet",
    "delete": "Sil"
  }
}

// public/locales/tr/validation.json
{
  "required": "Bu alan zorunludur",
  "minLength": "En az {{count}} karakter olmalıdır",
  "maxLength": "En fazla {{count}} karakter olmalıdır",
  "email": "Geçerli bir e-posta adresi giriniz",
  "phone": "Geçerli bir telefon numarası giriniz",
  "location": "Konum seçimi yapmalısınız"
}

// public/locales/tr/reports.json
{
  "create": {
    "title": "Yeni Rapor",
    "success": "Rapor başarıyla oluşturuldu",
    "error": "Rapor oluşturulurken bir hata oluştu"
  },
  "status": {
    "new": "Yeni",
    "inProgress": "İşleme Alındı",
    "resolved": "Çözüldü",
    "rejected": "Reddedildi"
  }
}
```

### 📂 Hook ve Helper'lar
```typescript
// src/hooks/useLocalization.ts
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  
  const locales = {
    tr,
    en: enUS
  };

  const formatDate = (date: Date, formatStr = 'PP') => {
    return format(date, formatStr, {
      locale: locales[i18n.language]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: i18n.language === 'tr' ? 'TRY' : 'USD'
    }).format(amount);
  };

  return {
    t,
    formatDate,
    formatCurrency,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage
  };
};
```

### ✅ Kontrol Noktaları
- [ ] i18n yapılandırması
- [ ] Dil dosyaları
- [ ] Dil değiştirme mekanizması
- [ ] Tarih ve para birimi formatlama
- [ ] RTL desteği (gerekirse)

### 📌 Onay Gereksinimleri
- Tüm metinler çevrilmiş
- Dil değişimi sorunsuz
- Formatlama tutarlı
- Kullanıcı tercihi kalıcı

## 📌 Adım 3.10: Map Integration ve Clustering

### Açıklama
Leaflet.js ile harita entegrasyonu, marker clustering ve harita performans optimizasyonları.

### 🛠 Teknolojiler
- leaflet ^1.9.0
- react-leaflet ^4.2.0
- @react-leaflet/core ^2.1.0
- leaflet.markercluster ^1.5.3

### 📂 Harita Components
```typescript
// src/features/map/components/MapView/index.tsx
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ReportMarker } from '../ReportMarker';
import { useReportMarkers } from '../../hooks/useReportMarkers';

export const MapView = () => {
  const { markers, isLoading } = useReportMarkers();
  
  return (
    <MapContainer
      center={[41.0082, 28.9784]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
      >
        {markers.map(marker => (
          <ReportMarker
            key={marker.id}
            position={marker.position}
            report={marker.report}
          />
        ))}
      </MarkerClusterGroup>
      
      <MapControls />
    </MapContainer>
  );
};

// src/features/map/components/ReportMarker/index.tsx
import { Marker, Popup } from 'react-leaflet';
import { ReportCard } from '@/components/ui/Card/ReportCard';
import { useCustomIcon } from '../../hooks/useCustomIcon';

interface ReportMarkerProps {
  position: [number, number];
  report: Report;
}

export const ReportMarker = ({ position, report }: ReportMarkerProps) => {
  const icon = useCustomIcon(report.status);
  
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <ReportCard report={report} minimal />
      </Popup>
    </Marker>
  );
};
```

### 📂 Custom Hooks
```typescript
// src/features/map/hooks/useMapBounds.ts
import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDebounce } from '@/hooks/useDebounce';

export const useMapBounds = () => {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());
  const debouncedBounds = useDebounce(bounds, 300);

  useEffect(() => {
    const handleMove = () => {
      setBounds(map.getBounds());
    };

    map.on('moveend', handleMove);
    return () => {
      map.off('moveend', handleMove);
    };
  }, [map]);

  return debouncedBounds;
};

// src/features/map/hooks/useReportMarkers.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useMapBounds } from './useMapBounds';

export const useReportMarkers = () => {
  const bounds = useMapBounds();
  
  return useQuery({
    queryKey: ['reports', bounds],
    queryFn: () => apiClient.get('/reports', {
      params: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
    }),
    select: (data) => data.data.map(report => ({
      id: report.id,
      position: [report.location.latitude, report.location.longitude],
      report
    })),
    staleTime: 30000 // 30 seconds
  });
};
```

### 📂 Map Controls ve Utils
```typescript
// src/features/map/components/MapControls/index.tsx
import { useMap } from 'react-leaflet';
import { 
  Box, 
  IconButton, 
  VStack,
  useToast 
} from '@chakra-ui/react';

export const MapControls = () => {
  const map = useMap();
  const toast = useToast();

  const handleLocate = () => {
    map.locate({
      setView: true,
      maxZoom: 16
    });
  };

  useEffect(() => {
    const onLocationError = () => {
      toast({
        title: t('map.locationError'),
        status: 'error',
        duration: 3000
      });
    };

    map.on('locationerror', onLocationError);
    return () => {
      map.off('locationerror', onLocationError);
    };
  }, [map, toast]);

  return (
    <Box position="absolute" right={4} top={4} zIndex={1000}>
      <VStack>
        <IconButton
          aria-label="Konumumu bul"
          icon={<LocationIcon />}
          onClick={handleLocate}
          colorScheme="brand"
        />
        <IconButton
          aria-label="Haritayı sıfırla"
          icon={<ResetIcon />}
          onClick={() => map.setView([41.0082, 28.9784], 13)}
          colorScheme="brand"
        />
      </VStack>
    </Box>
  );
};

// src/features/map/utils/performance.ts
export const optimizeMarkerLayer = (layer: L.Layer) => {
  if (layer instanceof L.MarkerClusterGroup) {
    layer.options.removeOutsideVisibleBounds = true;
    layer.options.animate = window.innerWidth > 768;
    layer.options.disableClusteringAtZoom = 19;
    layer.options.maxClusterRadius = (zoom: number) => {
      return zoom > 16 ? 40 : 60;
    };
  }
};
```

### ✅ Kontrol Noktaları
- [ ] Marker clustering çalışıyor
- [ ] Harita sınırlarına göre veri çekme
- [ ] Konum bulma özelliği
- [ ] Performans optimizasyonları
- [ ] Error handling

### 📌 Onay Gereksinimleri
- Marker'lar doğru gruplandı
- Harita etkileşimi akıcı
- Veri yükleme optimizasyonu yapıldı
- Mobil uyumluluk sağlandı

## 📌 Adım 3.12: Leaflet.js Map Integration ve Optimizasyonlar

### Açıklama
Harita entegrasyonu, cluster yönetimi ve performans optimizasyonları.

### 🛠 Teknolojiler
- react-leaflet ^4.2.0
- leaflet.markercluster ^1.5.3
- @turf/turf ^6.5.0

### 📂 Map Components
```typescript
// src/components/map/MapContainer/index.tsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { useReports } from '@/lib/api/hooks/useReports';
import { MapCluster } from '../MapCluster';
import { MapControls } from '../MapControls';

const MapView = () => {
  const mapRef = useRef(null);
  const { data: reports, isLoading } = useReports();

  return (
    <MapContainer
      ref={mapRef}
      center={[41.0082, 28.9784]} // İstanbul merkezi
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {!isLoading && (
        <MapCluster reports={reports} />
      )}
      
      <MapControls />
    </MapContainer>
  );
};

// Dynamic import with loading state
export const Map = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <Skeleton
      height="100%"
      width="100%"
      startColor="gray.100"
      endColor="gray.300"
    />
  )
});

// src/components/map/MapCluster/index.tsx
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import type { Report } from '@/types';

interface Props {
  reports: Report[];
}

export const MapCluster = ({ reports }: Props) => {
  const map = useMap();
  
  useEffect(() => {
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    reports.forEach((report) => {
      const marker = L.marker([report.location.latitude, report.location.longitude])
        .bindPopup(`
          <div class="marker-popup">
            <h3>${report.title}</h3>
            <p>${report.description}</p>
            <a href="/reports/${report.id}">Detaylar</a>
          </div>
        `);
      
      markers.addLayer(marker);
    });

    map.addLayer(markers);
    
    return () => {
      map.removeLayer(markers);
    };
  }, [map, reports]);

  return null;
};

// src/components/map/MapControls/index.tsx
import { useMap } from 'react-leaflet';
import { Button, VStack, useToast } from '@chakra-ui/react';
import { FiCrosshair } from 'react-icons/fi';

export const MapControls = () => {
  const map = useMap();
  const toast = useToast();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Hata',
        description: 'Konum servisi desteklenmiyor',
        status: 'error'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setView(
          [position.coords.latitude, position.coords.longitude],
          15
        );
      },
      (error) => {
        toast({
          title: 'Konum Hatası',
          description: error.message,
          status: 'error'
        });
      }
    );
  };

  return (
    <VStack
      position="absolute"
      right={4}
      top={4}
      zIndex={1000}
      spacing={2}
    >
      <Button
        leftIcon={<FiCrosshair />}
        onClick={handleLocate}
        colorScheme="brand"
        size="sm"
      >
        Konumumu Bul
      </Button>
    </VStack>
  );
};
```

### 📂 Map Performance Optimizations
```typescript
// src/lib/hooks/useMapOptimizations.ts
import { useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import type { Report } from '@/types';

export const useMapOptimizations = (reports: Report[]) => {
  const map = useMap();
  
  // Viewport içindeki raporları filtreleme
  const getVisibleReports = useCallback(() => {
    const bounds = map.getBounds();
    return reports.filter((report) => {
      const point = turf.point([
        report.location.longitude,
        report.location.latitude
      ]);
      const boundingBox = turf.bboxPolygon([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ]);
      return turf.booleanPointInPolygon(point, boundingBox);
    });
  }, [map, reports]);

  // Marker clustering optimizasyonu
  useEffect(() => {
    const handleZoom = () => {
      const zoom = map.getZoom();
      const clusterRadius = Math.max(50, 100 - zoom * 5); // Zoom seviyesine göre cluster yarıçapı
      
      // MarkerClusterGroup'un options'larını güncelle
      map.eachLayer((layer) => {
        if (layer instanceof L.MarkerClusterGroup) {
          layer.options.maxClusterRadius = clusterRadius;
          layer.refreshClusters();
        }
      });
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]);

  return {
    visibleReports: getVisibleReports()
  };
};
```

### ✅ Kontrol Noktaları
- [ ] Harita lazy loading çalışıyor
- [ ] Marker clustering aktif
- [ ] Viewport optimizasyonu yapıldı
- [ ] Konum servisi çalışıyor
- [ ] Performans metrikleri kabul edilebilir seviyede

### 📌 Performance Metrics
- Initial bundle size: < 200KB
- Map initial load time: < 2s
- Marker rendering (1000 markers): < 500ms
- Memory usage: < 100MB
- Smooth scrolling ve pan: 60fps

### 📌 Optimization Checklist
- [x] Code splitting (dynamic import)
- [x] Lazy loading of map components
- [x] Viewport-based filtering
- [x] Efficient marker clustering
- [x] Memory leak prevention
- [x] Event listener cleanup
- [x] Bundle size optimization
```