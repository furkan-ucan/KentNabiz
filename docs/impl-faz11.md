# Faz 11: Pre-launch ve Final Kontroller

## 📌 Adım 11.1: Security Audit ve Penetrasyon Testi

### Açıklama
OWASP Top 10 ve güvenlik en iyi pratikleri doğrultusunda güvenlik testleri.

### 🛠 Teknolojiler
- OWASP ZAP ^2.14.0
- Burp Suite Pro
- sqlmap v1.7.10
- Metasploit Framework 6.3.4
- Nmap 7.94

### 📂 Security Test Senaryoları
```typescript
// tests/security/api.security.test.ts
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthGuard } from '@/core/guards';

describe('API Security Tests', () => {
  describe('Authentication', () => {
    it('should prevent unauthorized access', async () => {
      const response = await request(app)
        .get('/api/reports')
        .expect(401);
    });

    it('should detect JWT tampering', async () => {
      const token = 'tampered.jwt.token';
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should prevent XSS attacks', async () => {
      const payload = {
        title: '<script>alert("xss")</script>',
        description: 'Test description'
      };
      
      const response = await request(app)
        .post('/api/reports')
        .send(payload)
        .expect(400);
    });

    it('should prevent SQL injection', async () => {
      const payload = {
        query: "'; DROP TABLE users; --"
      };
      
      const response = await request(app)
        .get('/api/reports/search')
        .query(payload)
        .expect(400);
    });
  });
});

// security/pentest-scripts/scan.sh
#!/bin/bash

# ZAP API Scan
zap-cli quick-scan --self-contained \
  --spider https://api.kentnabiz.com \
  --ajax-spider \
  --recursive \
  --report report.html

# Nmap Service Discovery
nmap -sS -sV -p- --script=vuln api.kentnabiz.com

# SQLMap Test
sqlmap -u "https://api.kentnabiz.com/reports?id=1" \
  --batch \
  --random-agent \
  --level 5 \
  --risk 3
```

### ✅ Kontrol Noktaları
- [ ] OWASP Top 10 kontrolü
- [ ] Authentication bypass test
- [ ] Injection test (SQL, NoSQL, Command)
- [ ] XSS ve CSRF test
- [ ] SSL/TLS analizi

### 📌 Onay Gereksinimleri
- Kritik güvenlik açığı yok
- Auth bypass engellendi
- Input validation başarılı
- SSL Labs grade A+

## 📌 Adım 11.2: Load Testing ve Stress Testi

### Açıklama
JMeter ve k6 ile yük testi ve stres testi senaryoları.

### 🛠 Teknolojiler
- Apache JMeter ^5.6.0
- k6 ^0.45.0
- Artillery ^2.0.0
- Grafana k6 Cloud

### 📂 Load Test Senaryoları
```typescript
// tests/load/k6-scripts/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up
    { duration: '5m', target: 100 }, // Stay
    { duration: '2m', target: 200 }, // Scale up
    { duration: '5m', target: 200 }, // Stay
    { duration: '2m', target: 0 }    // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01']    // Error rate should be below 1%
  }
};

const BASE_URL = 'https://api.kentnabiz.com';

export default function() {
  // Create report scenario
  const payload = {
    title: 'Load Test Report',
    description: 'Test Description',
    location: {
      latitude: 41.0082,
      longitude: 28.9784
    }
  };

  const responses = http.batch([
    ['GET', `${BASE_URL}/reports`],
    ['POST', `${BASE_URL}/reports`, JSON.stringify(payload)],
    ['GET', `${BASE_URL}/reports/nearby?lat=41.0082&lng=28.9784`]
  ]);

  check(responses[0], {
    'reports list status 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500
  });

  sleep(1);
}

// tests/load/artillery-config.yml
config:
  target: "https://api.kentnabiz.com"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  
scenarios:
  - name: "API flow"
    flow:
      - get:
          url: "/reports"
          expect:
            - statusCode: 200
            - maxResponseTime: 500
      
      - post:
          url: "/reports"
          json:
            title: "Artillery Test"
            description: "Test Description"
            location:
              latitude: 41.0082
              longitude: 28.9784
          expect:
            - statusCode: 201
            - maxResponseTime: 1000
```

### ✅ Kontrol Noktaları
- [ ] Endpoint bazlı yük testi
- [ ] Ramp-up ve scale testi
- [ ] Memory leak kontrolü
- [ ] Database performance
- [ ] Cache hit rate

### 📌 Onay Gereksinimleri
- 1000 CCU destekleniyor
- Response time <500ms
- Error rate <%1
- Memory usage stabil

## 📌 Adım 11.3: Cross-browser Testing

### Açıklama
Tarayıcı uyumluluğu ve responsive tasarım kontrolleri.

### 🛠 Teknolojiler
- Cypress ^13.0.0
- Playwright ^1.39.0
- BrowserStack Automate
- LambdaTest

### 📂 Browser Test Senaryoları
```typescript
// tests/e2e/specs/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];

  for (const browserType of browsers) {
    test(`should render correctly in ${browserType}`, async ({ page }) => {
      await page.goto('/');
      
      // Visual regression
      expect(await page.screenshot())
        .toMatchSnapshot(`homepage-${browserType}.png`);
      
      // Layout check
      const layout = await page.evaluate(() => {
        const html = document.documentElement;
        return {
          width: html.clientWidth,
          height: html.clientHeight,
          fontSize: getComputedStyle(html).fontSize
        };
      });
      
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
    });

    test(`should handle responsive design in ${browserType}`, async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },  // iPhone SE
        { width: 768, height: 1024 }, // Tablet
        { width: 1440, height: 900 }  // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        expect(await page.screenshot())
          .toMatchSnapshot(`responsive-${browserType}-${viewport.width}.png`);
      }
    });
  }
});

// playwright.config.ts
import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'https://kentnabiz.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: devices['Desktop Chrome']
    },
    {
      name: 'Desktop Firefox',
      use: devices['Desktop Firefox']
    },
    {
      name: 'Desktop Safari',
      use: devices['Desktop Safari']
    },
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5']
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12']
    }
  ]
};

export default config;
```

### ✅ Kontrol Noktaları
- [ ] Chrome/Firefox/Safari/Edge testi
- [ ] Mobile tarayıcı testi
- [ ] Responsive breakpoint testi
- [ ] CSS uyumluluğu
- [ ] JavaScript/ES6 desteği

### 📌 Onay Gereksinimleri
- Tüm tarayıcılarda UI tutarlı
- Responsive tasarım sorunsuz
- JavaScript hatasız çalışıyor

## 📌 Adım 11.4: Accessibility Testing

### Açıklama
WCAG 2.1 standartları ve ekran okuyucu uyumluluğu testleri.

### 🛠 Teknolojiler
- axe-core ^4.8.0
- pa11y ^6.0.0
- NVDA Screen Reader
- Lighthouse

### 📂 Accessibility Test Senaryoları
```typescript
// tests/a11y/accessibility.test.ts
import { AxeBuilder } from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should pass WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
        .map(h => ({
          level: parseInt(h.tagName.substring(1)),
          text: h.textContent?.trim()
        }));
    });
    
    // Check heading hierarchy
    let prevLevel = 0;
    for (const heading of headings) {
      expect(heading.level).toBeLessThanOrEqual(prevLevel + 1);
      prevLevel = heading.level;
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through all interactive elements
    const focusableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        text: el.textContent?.trim(),
        tabIndex: el.getAttribute('tabindex')
      }));
    });
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Check focus visibility
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const style = window.getComputedStyle(el);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor
      };
    });
    
    expect(focusedElement.outlineStyle).not.toBe('none');
  });
});

// pa11y.config.js
module.exports = {
  standard: 'WCAG2AA',
  hideElements: '.ad, .promotional',
  runners: [
    'axe',
    'htmlcs'
  ],
  actions: [
    'click element #nav-menu',
    'wait for element #menu-items to be visible',
    'screen capture accessibility-nav.png'
  ],
  screenCapture: './reports/pa11y/',
  urls: [
    'https://kentnabiz.com/',
    'https://kentnabiz.com/reports',
    'https://kentnabiz.com/map'
  ]
};
```

### ✅ Kontrol Noktaları
- [ ] WCAG 2.1 AA kontrolü
- [ ] Klavye navigasyonu
- [ ] Screen reader uyumluluğu
- [ ] Color contrast
- [ ] ARIA labels

### 📌 Onay Gereksinimleri
- WCAG 2.1 AA uyumlu
- Klavye navigasyonu tam
- Screen reader sorunsuz
- Contrast ratio >4.5:1

## 📌 Adım 11.5: Final Code Review

### Açıklama
Son kod kontrolü, kalite metrikleri ve teknik borç değerlendirmesi.

### 🛠 Teknolojiler
- SonarQube ^9.9.0
- ESLint ^8.0.0
- TypeScript ^5.0.0
- Prettier ^3.0.0

### 📂 Code Quality Konfigürasyonu
```typescript
// sonar-project.properties
sonar.projectKey=kentnabiz
sonar.sourceEncoding=UTF-8
sonar.sources=apps/web/src,apps/api/src
sonar.tests=apps/web/tests,apps/api/test
sonar.exclusions=**/node_modules/**,**/*.test.ts
sonar.typescript.lcov.reportPaths=coverage/lcov.info

sonar.qualitygate.wait=true
sonar.qualitygate.conditions=\
  coverage < 80,\
  duplications > 3,\
  code_smells > 100

// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'complexity': ['error', 10],
    'max-lines': ['error', { max: 300 }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error'
  }
};

// scripts/analyze-deps.js
const madge = require('madge');
const { join } = require('path');

async function analyzeDependencies() {
  const result = await madge(join(__dirname, '../apps/web/src'));
  
  // Check for circular dependencies
  const circular = result.circular();
  if (circular.length > 0) {
    console.error('Circular dependencies found:', circular);
    process.exit(1);
  }
  
  // Generate dependency graph
  await result.image('dependency-graph.svg');
}

analyzeDependencies();
```

### ✅ Kontrol Noktaları
- [ ] Kod kalite metrikleri
- [ ] Test coverage
- [ ] Technical debt
- [ ] Dependency audit
- [ ] Performance bottlenecks

### 📌 Onay Gereksinimleri
- Test coverage >80%
- Sonar quality gate pass
- No critical warnings
- Dependencies güncel

## 🔍 Faz 11 Sonuç ve Değerlendirme

### Pre-launch Metrics
- Security Score: A+
- Performance Score: >90
- Accessibility Score: >95
- Code Quality Score: >85

### Test Coverage
- Unit Tests: >90%
- Integration Tests: >85%
- E2E Tests: >80%
- A11y Tests: WCAG AA

### ⚠️ Önemli Notlar
- Security patch'leri güncel tutulmalı
- Load balancer konfigürasyonu kontrol edilmeli
- Browser uyumluluk matrisi güncellenmeli
- A11y dökümantasyonu hazırlanmalı