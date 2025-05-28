# Environment Variables Setup

Bu dosya, web uygulaması için gerekli environment değişkenlerini açıklar.

## Gerekli Environment Değişkenleri

Aşağıdaki environment değişkenlerini `.env.local` dosyasında tanımlamanız gerekir:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Development Configuration
VITE_NODE_ENV=development
```

## Kurulum

1. `apps/web/` dizininde `.env.local` dosyası oluşturun
2. Yukarıdaki değişkenleri dosyaya ekleyin
3. API sunucunuzun gerçek URL'ini `VITE_API_BASE_URL` değişkenine yazın

## Notlar

- Vite projelerinde environment değişkenleri `VITE_` ön ekiyle başlamalıdır
- `.env.local` dosyası git'e commit edilmez (güvenlik için)
- Production ortamında farklı URL'ler kullanılabilir
