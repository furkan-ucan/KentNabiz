# KentNabız (UrbanPulse) API Dokümantasyonu

## 1. Genel Bilgiler

### 1.1. API Temel URL
```
http://localhost:3000/api
```

### 1.2. Kimlik Doğrulama
API çağrıları JWT (JSON Web Token) tabanlı kimlik doğrulama kullanmaktadır. Token, login endpoint'inden alınır ve diğer tüm isteklerde Authorization header'ında gönderilmelidir.

```http
Authorization: Bearer <your_jwt_token>
```

### 1.3. İstek Formatı
Tüm POST ve PUT istekleri JSON formatında olmalıdır:
```http
Content-Type: application/json
```

## 2. Endpoint'ler

### 2.1. Kimlik Doğrulama

#### Login
```http
POST /auth/login
```

**İstek**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Başarılı Yanıt (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "CITIZEN"
  }
}
```

### 2.2. Rapor Yönetimi

#### Yeni Rapor Oluşturma
```http
POST /reports
```

**İstek**
```json
{
  "title": "Yol Çukuru",
  "description": "Ana caddede tehlikeli bir çukur var",
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "category": "INFRASTRUCTURE",
  "media": [
    {
      "type": "IMAGE",
      "base64": "data:image/jpeg;base64,..."
    }
  ]
}
```

**Başarılı Yanıt (201 Created)**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Yol Çukuru",
  "status": "NEW",
  "createdAt": "2024-01-20T10:00:00Z"
}
```

#### Raporları Listeleme
```http
GET /reports
```

**Query Parametreleri**
- `category` (string, optional): Kategori filtreleme
- `status` (string, optional): Durum filtreleme
- `bounds` (object, optional): Harita sınırları
  - `north` (number): Kuzey sınırı
  - `south` (number): Güney sınırı
  - `east` (number): Doğu sınırı
  - `west` (number): Batı sınırı
- `page` (number, default: 1): Sayfa numarası
- `limit` (number, default: 10): Sayfa başına kayıt

**Başarılı Yanıt (200 OK)**
```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Yol Çukuru",
      "description": "Ana caddede tehlikeli bir çukur var",
      "location": {
        "latitude": 41.0082,
        "longitude": 28.9784
      },
      "category": "INFRASTRUCTURE",
      "status": "NEW",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Rapor Detayı
```http
GET /reports/{id}
```

**Başarılı Yanıt (200 OK)**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Yol Çukuru",
  "description": "Ana caddede tehlikeli bir çukur var",
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "category": "INFRASTRUCTURE",
  "status": "NEW",
  "media": [
    {
      "id": "abc123",
      "type": "IMAGE",
      "url": "http://localhost:3000/media/abc123.jpg"
    }
  ],
  "reporter": {
    "id": "user123",
    "name": "John Doe"
  },
  "createdAt": "2024-01-20T10:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

#### Rapor Güncelleme (Yetkili Personel)
```http
PUT /reports/{id}
```

**İstek**
```json
{
  "status": "IN_PROGRESS",
  "assignedTo": "user456",
  "comment": "Ekip yönlendirildi"
}
```

**Başarılı Yanıt (200 OK)**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "IN_PROGRESS",
  "updatedAt": "2024-01-20T11:00:00Z"
}
```

### 2.3. Yorum Yönetimi

#### Yorum Ekleme
```http
POST /reports/{id}/comments
```

**İstek**
```json
{
  "content": "Bu sorun acil çözülmeli"
}
```

**Başarılı Yanıt (201 Created)**
```json
{
  "id": "comment123",
  "content": "Bu sorun acil çözülmeli",
  "author": {
    "id": "user123",
    "name": "John Doe"
  },
  "createdAt": "2024-01-20T12:00:00Z"
}
```

## 3. Hata Kodları

### 3.1. HTTP Durum Kodları
- `200 OK`: İstek başarılı
- `201 Created`: Yeni kayıt oluşturuldu
- `400 Bad Request`: Geçersiz istek
- `401 Unauthorized`: Kimlik doğrulama başarısız
- `403 Forbidden`: Yetkisiz erişim
- `404 Not Found`: Kaynak bulunamadı
- `422 Unprocessable Entity`: Doğrulama hatası
- `500 Internal Server Error`: Sunucu hatası

### 3.2. Hata Yanıt Formatı
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## 4. Veri Tipleri

### 4.1. Rapor Durumları
- `NEW`: Yeni
- `IN_PROGRESS`: İşleme Alındı
- `RESOLVED`: Çözüldü
- `REJECTED`: Reddedildi

### 4.2. Rapor Kategorileri
- `INFRASTRUCTURE`: Altyapı
- `TRAFFIC`: Trafik
- `ENVIRONMENT`: Çevre
- `SECURITY`: Güvenlik
- `OTHER`: Diğer

## 5. Rate Limiting

API çağrıları aşağıdaki limitler dahilinde yapılmalıdır:
- Kimlik doğrulanmamış istekler: 30 istek/dakika
- Kimlik doğrulanmış istekler: 100 istek/dakika

Limit aşıldığında `429 Too Many Requests` hatası döner:
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "retryAfter": 30
}
```

## 6. Örnek Entegrasyon

### 6.1. JavaScript/TypeScript (Axios)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token } = response.data;
  
  // Token'ı sakla ve sonraki isteklerde kullan
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return response.data;
};

// Rapor oluştur
const createReport = async (report: any) => {
  const response = await api.post('/reports', report);
  return response.data;
};

// Raporları listele
const getReports = async (params: any) => {
  const response = await api.get('/reports', { params });
  return response.data;
};
```

### 6.2. Python (Requests)
```python
import requests

BASE_URL = 'http://localhost:3000/api'
token = None

def login(email: str, password: str):
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'email': email,
        'password': password
    })
    data = response.json()
    global token
    token = data['token']
    return data

def create_report(title: str, description: str, latitude: float, longitude: float):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(f'{BASE_URL}/reports', 
        headers=headers,
        json={
            'title': title,
            'description': description,
            'location': {
                'latitude': latitude,
                'longitude': longitude
            }
        }
    )
    return response.json()
```

## 7. Güvenlik Önerileri

1. Token Güvenliği
   - JWT token'ı güvenli bir şekilde saklanmalıdır
   - Token süresi dolduğunda yenileme yapılmalıdır
   - Token'ı asla URL parametresi olarak göndermemelisiniz

2. İstek Doğrulama
   - Tüm girdiler sunucu tarafında doğrulanmalıdır
   - Büyük dosya yüklemelerinde boyut limitleri kontrol edilmelidir
   - API anahtarları ve tokenlar güvenli bir şekilde saklanmalıdır

3. HTTPS Kullanımı
   - Production ortamında tüm istekler HTTPS üzerinden yapılmalıdır
   - Geçersiz SSL sertifikalarına izin verilmemelidir

Bu API dokümantasyonu, KentNabız platformunun API yapısını, kullanım örneklerini ve güvenlik önerilerini detaylı bir şekilde açıklamaktadır. Entegrasyon sürecinde bu dokümana referans olarak başvurulmalı ve güvenlik önerilerine dikkat edilmelidir.