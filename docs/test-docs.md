# KentNabız (UrbanPulse) – Test Dokümantasyonu

## 1. Test Stratejisi ve Planı

### 1.1. Genel Test Yaklaşımı

#### Test Seviyeleri
1. **Birim Testler**
   - Tekil bileşenlerin ve fonksiyonların testi
   - Her modül için minimum %80 test coverage hedefi
   - Jest ve React Testing Library kullanımı

2. **Entegrasyon Testleri**
   - Modüller arası etkileşimlerin testi
   - API endpoint'leri ve veritabanı işlemleri
   - Supertest ve PostgreSQL test container kullanımı

3. **E2E Testler**
   - Uçtan uca kullanıcı senaryoları
   - Cypress ile web uygulaması testleri
   - Detox ile mobil uygulama testleri

4. **Performans Testleri**
   - Yük testleri (Apache JMeter)
   - Stres testleri
   - Scalability testleri

### 1.2. Test Ortamları

#### Development Environment
```yaml
URL: dev.urbanpulse.local
Database: test_urbanpulse_dev
Features: Tüm debug özellikleri aktif
Monitoring: Full logging ve metrics
```

#### Staging Environment
```yaml
URL: staging.urbanpulse.local
Database: test_urbanpulse_staging
Features: Production benzeri konfigürasyon
Monitoring: Production seviyesi
```

#### Production Environment
```yaml
URL: api.urbanpulse.com
Database: urbanpulse_prod
Features: Optimized settings
Monitoring: Critical metrics only
```

## 2. Test Senaryoları

### 2.1. Backend Unit Tests

#### Auth Service Tests
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'valid_password'
      });
      
      expect(result).toHaveProperty('token');
      expect(result.token).toMatch(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong_password'
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

#### Report Service Tests
```typescript
describe('ReportService', () => {
  describe('createReport', () => {
    it('should create new report with valid data', async () => {
      const reportData = {
        title: 'Test Report',
        description: 'Test Description',
        location: {
          latitude: 41.0082,
          longitude: 28.9784
        },
        category: 'INFRASTRUCTURE'
      };

      const result = await reportService.createReport(reportData);
      
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(reportData.title);
      expect(result.status).toBe('NEW');
    });
  });
});
```

### 2.2. Frontend Unit Tests

#### Report Form Component Tests
```typescript
describe('ReportForm', () => {
  it('should validate required fields', async () => {
    render(<ReportForm />);
    
    fireEvent.click(screen.getByText('Submit'));
    
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(await screen.findByText('Location is required')).toBeInTheDocument();
  });

  it('should call onSubmit with valid data', async () => {
    const onSubmit = jest.fn();
    render(<ReportForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Report' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' }
    });
    
    // Simulate map location selection
    fireEvent.click(screen.getByText('Submit'));
    
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Report',
      description: 'Test Description',
      location: expect.any(Object)
    });
  });
});
```

### 2.3. Integration Tests

#### API Endpoint Tests
```typescript
describe('Reports API', () => {
  describe('POST /api/reports', () => {
    it('should create new report', async () => {
      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'Integration Test Report',
          description: 'Test Description',
          location: {
            latitude: 41.0082,
            longitude: 28.9784
          },
          category: 'INFRASTRUCTURE'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
```

### 2.4. E2E Tests

#### Web Application Tests (Cypress)
```typescript
describe('Report Creation Flow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should create new report', () => {
    cy.visit('/reports/new');
    
    cy.get('[data-testid="title-input"]')
      .type('E2E Test Report');
    
    cy.get('[data-testid="description-input"]')
      .type('E2E Test Description');
    
    // Simulate map interaction
    cy.get('[data-testid="map"]')
      .click(100, 100);
    
    cy.get('[data-testid="submit-button"]')
      .click();
    
    cy.url()
      .should('include', '/reports/');
    
    cy.contains('Report created successfully');
  });
});
```

#### Mobile Application Tests (Detox)
```typescript
describe('Mobile Report Creation', () => {
  beforeAll(async () => {
    await device.launchApp();
    await element(by.id('login-email')).typeText('test@example.com');
    await element(by.id('login-password')).typeText('password');
    await element(by.id('login-button')).tap();
  });

  it('should create new report with photo', async () => {
    await element(by.id('new-report-button')).tap();
    await element(by.id('report-title')).typeText('Mobile Test Report');
    await element(by.id('report-description')).typeText('Mobile Test Description');
    await element(by.id('take-photo-button')).tap();
    await element(by.id('submit-report')).tap();
    
    await expect(element(by.text('Report created successfully'))).toBeVisible();
  });
});
```

## 3. Performans Testleri

### 3.1. Yük Testi Senaryoları

#### API Endpoint Yük Testi
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="UrbanPulse Load Test">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Report Creation">
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <intProp name="LoopController.loops">100</intProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">50</stringProp>
        <stringProp name="ThreadGroup.ramp_time">10</stringProp>
        <longProp name="ThreadGroup.start_time">1642665600000</longProp>
        <longProp name="ThreadGroup.end_time">1642665600000</longProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### 3.2. Performans Metrikleri

#### Hedef Metrikler
- Sayfa yüklenme süresi: < 3 saniye
- API yanıt süresi: < 200ms
- Database query süresi: < 100ms
- Memory kullanımı: < 512MB
- CPU kullanımı: < %60

#### Monitoring Dashboard (Grafana)
```yaml
Panels:
  - Response Time:
      type: graph
      metrics:
        - avg_response_time
        - p95_response_time
        - p99_response_time
  
  - Error Rate:
      type: gauge
      metrics:
        - error_rate_percentage
        - success_rate_percentage
  
  - System Resources:
      type: stat
      metrics:
        - cpu_usage
        - memory_usage
        - disk_io
```

## 4. Güvenlik Testleri

### 4.1. OWASP Top 10 Testleri
1. Injection Testing
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

### 4.2. Penetrasyon Testi Senaryoları
```yaml
Scenarios:
  - SQL Injection:
      endpoints:
        - /api/reports
        - /api/users
      payloads:
        - "' OR '1'='1"
        - "; DROP TABLE users--"
  
  - XSS Attacks:
      inputs:
        - "<script>alert('xss')</script>"
        - "<img src='x' onerror='alert(1)'>"
      locations:
        - Report title
        - Comments
        - User profile
  
  - CSRF Tests:
      endpoints:
        - POST /api/reports
        - PUT /api/reports/{id}
        - DELETE /api/reports/{id}
```

## 5. Test Raporlama

### 5.1. Test Rapor Formatı
```json
{
  "testSuite": "UrbanPulse API Tests",
  "timestamp": "2024-01-20T10:00:00Z",
  "duration": "125.4s",
  "totalTests": 150,
  "passed": 147,
  "failed": 2,
  "skipped": 1,
  "coverage": {
    "statements": 87,
    "branches": 82,
    "functions": 90,
    "lines": 88
  },
  "failedTests": [
    {
      "name": "should handle concurrent report submissions",
      "error": "Timeout exceeded",
      "location": "reports.spec.ts:156"
    }
  ]
}
```

### 5.2. Hata Takip Süreci
1. Hata Tespiti
   - Test sürecinde hata bulunması
   - Hata detaylarının kaydedilmesi
   - Severity belirlenmesi

2. Hata Analizi
   - Root cause analysis
   - Etki analizi
   - Çözüm önerisi

3. Çözüm Süreci
   - Fix implementasyonu
   - Code review
   - Regression testing

4. Doğrulama
   - Fix verification
   - Related test cases update
   - Documentation update

## 6. CI/CD Test Pipeline

### 6.1. GitHub Actions Workflow
```yaml
name: Test Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install Dependencies
      run: npm ci
    
    - name: Run Linter
      run: npm run lint
    
    - name: Run Unit Tests
      run: npm test
    
    - name: Run E2E Tests
      run: npm run test:e2e
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v2
```

### 6.2. Test Automation Stratejisi

#### Otomatik Test Seviyeleri
1. **Her Commit**
   - Linting
   - Unit tests
   - Critical path tests

2. **Pull Request**
   - Integration tests
   - E2E test subset
   - Security scans

3. **Nightly Build**
   - Full E2E suite
   - Performance tests
   - Security tests
   - Coverage reports

Bu test dokümantasyonu, KentNabız projesinin test süreçlerini, senaryolarını ve sonuçlarını kapsamlı bir şekilde açıklamaktadır. Test süreçlerinde bu dokümana referans olarak başvurulmalı ve süreçler ilerledikçe güncellenmelidir.