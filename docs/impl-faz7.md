# Faz 7: Test ve Kalite Süreçleri Planı

## 📌 Adım 7.1: Jest Kurulumu ve Unit Test Yapısı

### Açıklama
Jest ve testing utilities kullanarak unit test altyapısının kurulması.

### 🛠 Teknolojiler
- jest ^29.0.0
- @types/jest ^29.0.0
- ts-jest ^29.0.0
- @testing-library/jest-dom ^6.0.0

### 📂 Jest Yapılandırması
```typescript
// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

export default config;

// src/lib/validation/__tests__/validateReport.test.ts
import { validateReport } from '../validateReport';
import type { Report } from '@/types';

describe('validateReport', () => {
  it('geçerli rapor için true döner', () => {
    const validReport: Report = {
      title: 'Test Rapor',
      description: 'Test açıklama',
      location: {
        latitude: 41.0082,
        longitude: 28.9784
      },
      category: 'INFRASTRUCTURE'
    };

    expect(validateReport(validReport)).toBe(true);
  });

  it('eksik başlık için hata fırlatır', () => {
    const invalidReport: Partial<Report> = {
      description: 'Test açıklama',
      location: {
        latitude: 41.0082,
        longitude: 28.9784
      }
    };

    expect(() => validateReport(invalidReport as Report))
      .toThrow('Başlık zorunludur');
  });
});

// src/services/__tests__/reportService.test.ts
import { ReportService } from '../ReportService';
import { mockReportRepository } from '@/test/mocks';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    service = new ReportService(mockReportRepository);
  });

  it('rapor oluşturur ve kaydeder', async () => {
    const report = {
      title: 'Test Rapor',
      description: 'Açıklama'
    };

    const saved = await service.createReport(report);
    expect(saved.id).toBeDefined();
    expect(saved.title).toBe(report.title);
  });
});
```

### ✅ Kontrol Noktaları
- [ ] Jest konfigürasyonu tamamlandı
- [ ] Test coverage ayarları yapıldı
- [ ] Test utilities ve mock'lar hazır
- [ ] CI entegrasyonu aktif

### 📌 Onay Gereksinimleri
- Unit test coverage %80+
- Test senaryoları başarılı
- Mock data doğru çalışıyor

## 📌 Adım 7.2: React Testing Library ile Komponent Testleri

### Açıklama
React komponentlerinin test edilmesi ve kullanıcı etkileşimlerinin doğrulanması.

### 🛠 Teknolojiler
- @testing-library/react ^14.0.0
- @testing-library/user-event ^14.0.0
- @testing-library/jest-dom ^6.0.0

### 📂 Komponent Test Yapısı
```typescript
// src/components/ReportForm/__tests__/ReportForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportForm } from '../ReportForm';

describe('ReportForm', () => {
  it('form submit başarılı çalışıyor', async () => {
    const onSubmit = jest.fn();
    render(<ReportForm onSubmit={onSubmit} />);

    // Form alanlarını doldur
    await userEvent.type(
      screen.getByLabelText('Başlık'),
      'Test Rapor'
    );

    await userEvent.type(
      screen.getByLabelText('Açıklama'),
      'Test açıklama metni'
    );

    // Form gönder
    fireEvent.click(screen.getByText('Gönder'));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Rapor',
      description: 'Test açıklama metni'
    });
  });

  it('validasyon hataları gösteriliyor', async () => {
    render(<ReportForm onSubmit={jest.fn()} />);

    // Boş form gönder
    fireEvent.click(screen.getByText('Gönder'));

    expect(screen.getByText('Başlık zorunludur')).toBeInTheDocument();
    expect(screen.getByText('Açıklama zorunludur')).toBeInTheDocument();
  });
});

// src/components/Map/__tests__/MapView.test.tsx
import { render, screen, act } from '@testing-library/react';
import { MapView } from '../MapView';
import { mockMapInstance } from '@/test/mocks';

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: () => mockMapInstance,
  tileLayer: jest.fn().mockReturnValue({
    addTo: jest.fn()
  })
}));

describe('MapView', () => {
  it('harita yükleniyor ve marker\'lar gösteriliyor', () => {
    const markers = [
      { id: 1, position: [41.0082, 28.9784] },
      { id: 2, position: [41.0083, 28.9785] }
    ];

    render(<MapView markers={markers} />);

    expect(mockMapInstance.addLayer).toHaveBeenCalledTimes(2);
  });
});
```

### ✅ Kontrol Noktaları
- [ ] Komponent render testleri
- [ ] User event testleri
- [ ] Mock service/API çağrıları
- [ ] Snapshot testleri

### 📌 Onay Gereksinimleri
- Tüm komponentler test edildi
- User interaction testleri başarılı
- A11y testleri geçildi

## 📌 Adım 7.3: Cypress ile E2E Testler

### Açıklama
Cypress kullanarak uçtan uca test senaryolarının implementasyonu.

### 🛠 Teknolojiler
- cypress ^13.0.0
- @cypress/code-coverage ^3.0.0

### 📂 Cypress Test Yapısı
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    }
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false
});

// cypress/e2e/report-flow.cy.ts
describe('Rapor Oluşturma Flow', () => {
  beforeEach(() => {
    cy.login('test@user.com', 'password');
  });

  it('yeni rapor oluşturulabilmeli', () => {
    // Ana sayfaya git
    cy.visit('/');
    
    // Yeni rapor butonuna tıkla
    cy.findByText('Yeni Rapor').click();
    
    // Form alanlarını doldur
    cy.findByLabelText('Başlık').type('Test Rapor');
    cy.findByLabelText('Açıklama').type('Detaylı açıklama');
    
    // Haritadan konum seç
    cy.get('#map').click(500, 500);
    
    // Fotoğraf yükle
    cy.get('input[type=file]').attachFile('test-image.jpg');
    
    // Formu gönder
    cy.findByText('Gönder').click();
    
    // Başarılı mesajını kontrol et
    cy.findByText('Rapor başarıyla oluşturuldu')
      .should('be.visible');
    
    // Raporun listelendiğini kontrol et
    cy.visit('/reports');
    cy.findByText('Test Rapor').should('exist');
  });

  it('offline modda çalışabilmeli', () => {
    // İnterneti kapat
    cy.toggleNetworkStatus(false);
    
    // Rapor oluştur
    cy.visit('/new-report');
    cy.findByLabelText('Başlık').type('Offline Rapor');
    cy.findByText('Gönder').click();
    
    // Offline queue mesajını kontrol et
    cy.findByText('Rapor kaydedildi, çevrimiçi olunca gönderilecek')
      .should('be.visible');
    
    // İnterneti aç
    cy.toggleNetworkStatus(true);
    
    // Senkronizasyonu kontrol et
    cy.findByText('Rapor başarıyla gönderildi')
      .should('be.visible');
  });
});
```

### ✅ Kontrol Noktaları
- [ ] E2E test senaryoları
- [ ] Custom commands
- [ ] Network intercept
- [ ] Test raporlaması

### 📌 Onay Gereksinimleri
- Kritik akışlar test edildi
- CI pipeline entegrasyonu tamam
- Test raporları oluşuyor

## 📌 Adım 7.4: JMeter ile Performans Testleri

### Açıklama
JMeter kullanarak API ve uygulama performans testlerinin yapılandırması.

### 🛠 Teknolojiler
- Apache JMeter ^5.6
- JMeter Plugins

### 📂 Test Plan Yapısı
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="KentNabiz Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
    </TestPlan>
    <hashTree>
      <!-- Rapor Listeleme Test -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Report List Test">
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">10</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">100</stringProp>
        <stringProp name="ThreadGroup.ramp_time">30</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="GET Reports">
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
          <stringProp name="HTTPSampler.domain">localhost</stringProp>
          <stringProp name="HTTPSampler.port">3000</stringProp>
          <stringProp name="HTTPSampler.protocol">http</stringProp>
          <stringProp name="HTTPSampler.path">/api/reports</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
      
      <!-- Rapor Oluşturma Test -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Report Creation Test">
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">5</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">20</stringProp>
      </ThreadGroup>
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="POST Report">
          <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="" elementType="HTTPArgument">
                <stringProp name="Argument.value">{
                  "title": "Test Report ${__threadNum}",
                  "description": "Load test report",
                  "category": "INFRASTRUCTURE",
                  "location": {
                    "latitude": 41.0082,
                    "longitude": 28.9784
                  }
                }</stringProp>
                <stringProp name="Argument.metadata">=</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
          <stringProp name="HTTPSampler.domain">localhost</stringProp>
          <stringProp name="HTTPSampler.port">3000</stringProp>
          <stringProp name="HTTPSampler.protocol">http</stringProp>
          <stringProp name="HTTPSampler.path">/api/reports</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
          <stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp>
        </HTTPSamplerProxy>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### ✅ Kontrol Noktaları
- [ ] Load test senaryoları
- [ ] Performance metrikleri
- [ ] Stress testleri
- [ ] Monitoring setup

### 📌 Onay Gereksinimleri
- Response time < 200ms (p95)
- Error rate < 1%
- Throughput hedeflerine ulaşıldı

## 📌 Adım 7.5: SonarQube ile Kod Kalite Analizi

### Açıklama
SonarQube ile kod kalitesi, güvenlik açıkları ve teknik borç analizi.

### 🛠 Teknolojiler
- SonarQube ^9.9
- sonar-scanner ^5.0

### 📂 SonarQube Yapılandırması
```yaml
# sonar-project.properties
sonar.projectKey=kentnabiz
sonar.projectName=KentNabiz
sonar.sourceEncoding=UTF-8

# Analiz kaynakları
sonar.sources=src
sonar.tests=src/__tests__

# Test coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-report.xml

# Exclude patterns
sonar.exclusions=**/*.spec.ts,**/*.test.ts,**/node_modules/**

# Quality gates
sonar.qualitygate.wait=true

# TypeScript config
sonar.typescript.tsconfigPath=tsconfig.json

# Rules
sonar.rules.exclusions=\
  typescript:S1234,\  # Özel kural istisnaları
  typescript:S5678
```

### 📂 CI/CD Entegrasyonu
```yaml
# .github/workflows/sonar.yml
name: SonarQube Analysis

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests with coverage
      run: pnpm test --coverage
    
    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### ✅ Kontrol Noktaları
- [ ] Code smells analizi
- [ ] Güvenlik taraması
- [ ] Coverage raporları
- [ ] CI/CD entegrasyonu

### 📌 Onay Gereksinimleri
- Quality gate passed
- Kritik güvenlik açığı yok
- Teknik borç kontrol altında

## 🔍 Faz 7 Sonuç ve Değerlendirme

### Test Metrikleri
- Unit test coverage: %85+
- Integration test coverage: %75+
- E2E test başarı oranı: %98+
- Performance test başarı oranı: %95+

### Kalite Metrikleri
- Code smells: <100
- Duplicated lines: <%3
- Technical debt ratio: <%5
- Security hotspots: 0

### CI/CD Pipeline
- Build başarı oranı: %98+
- Test automation başarı oranı: %95+
- Deployment başarı oranı: %99+

### ⚠️ Önemli Notlar
- Test piramidini dengeli tut
- Performans testlerini production-like ortamda yap
- SonarQube quality gate'leri projeye özgü ayarla
- Test coverage hedeflerini realist tut