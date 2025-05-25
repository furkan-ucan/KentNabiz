# Git Commit Kuralları - KentNabız Projesi

Bu dokümanda KentNabız projesi için git commit kuralları, mesaj formatları ve düzenli commit hatırlatıcıları yer almaktadır.

## 📋 Commit Mesaj Formatı

Projemizde **Conventional Commits** standardını kullanıyoruz. Her commit mesajı şu formatta olmalıdır:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 🏷️ İzin Verilen Commit Tipleri

| Tip        | Açıklama                                                | Örnek                                                       |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `feat`     | Yeni özellik ekleme                                     | `feat(api): add user authentication system`                 |
| `fix`      | Bug düzeltme                                            | `fix(reports): resolve status update validation error`      |
| `chore`    | Bakım işleri, dependency güncellemeleri                 | `chore: update dependencies to latest versions`             |
| `docs`     | Dokümantasyon değişiklikleri                            | `docs: update API documentation for reports module`         |
| `refactor` | Kod yeniden düzenleme (özellik/bug değişikliği olmadan) | `refactor(auth): simplify JWT token validation logic`       |
| `test`     | Test ekleme veya düzeltme                               | `test(ability): add comprehensive ABAC authorization tests` |

### 🎯 Scope Örnekleri

- `api` - Backend API değişiklikleri
- `web` - Frontend web uygulaması
- `shared` - Paylaşılan paketler
- `ui` - UI bileşenleri
- `auth` - Kimlik doğrulama sistemi
- `reports` - Rapor modülü
- `users` - Kullanıcı modülü
- `teams` - Takım modülü
- `config` - Konfigürasyon dosyaları
- `db` - Veritabanı değişiklikleri

## ✅ İyi Commit Mesajı Örnekleri

```bash
# Yeni özellik
feat(reports): implement ABAC authorization for report actions

# Bug düzeltme
fix(api): resolve TypeScript type conflicts in PolicyHandler

# Refactoring
refactor(shared): clean up build output files from src directory

# Test ekleme
test(ability): add 28 comprehensive test cases for all user roles

# Dokümantasyon
docs(api): add Swagger documentation for new endpoints

# Dependency güncellemesi
chore: update @nestjs packages to latest stable versions
```

## ❌ Kötü Commit Mesajı Örnekleri

```bash
# Çok genel
fix: bug fix

# Tip eksik
add new feature

# Açıklama yetersiz
feat: update

# Türkçe kullanım (İngilizce tercih edilir)
feat: yeni özellik eklendi
```

## 🔄 Düzenli Commit Hatırlatıcıları

### 📅 Günlük Commit Kontrol Listesi

**Her gün sonunda şunları kontrol edin:**

- [ ] Bugün yaptığım değişiklikler commit edildi mi?
- [ ] Commit mesajları conventional format'a uygun mu?
- [ ] Her commit tek bir mantıksal değişikliği içeriyor mu?
- [ ] Test edilmemiş kod commit edilmedi mi?

### 🚀 Özellik Geliştirme Süreci

**Yeni özellik geliştirirken:**

1. **Başlangıç:** `feat(scope): start implementing [feature-name]`
2. **Ara adımlar:** `feat(scope): add [specific-component] for [feature-name]`
3. **Test ekleme:** `test(scope): add tests for [feature-name]`
4. **Dokümantasyon:** `docs(scope): document [feature-name] API endpoints`
5. **Tamamlama:** `feat(scope): complete [feature-name] implementation`

### 🐛 Bug Düzeltme Süreci

**Bug düzeltirken:**

1. **Tespit:** `fix(scope): identify issue with [problem-description]`
2. **Düzeltme:** `fix(scope): resolve [specific-issue] in [component]`
3. **Test:** `test(scope): add regression tests for [bug-fix]`

### 🔧 Refactoring Süreci

**Kod yeniden düzenlerken:**

1. **Başlangıç:** `refactor(scope): start restructuring [component-name]`
2. **Adımlar:** `refactor(scope): extract [functionality] to separate module`
3. **Temizlik:** `refactor(scope): remove unused code and dependencies`
4. **Test:** `test(scope): ensure all tests pass after refactoring`

## 🎯 Proje Spesifik Commit Senaryoları

### ABAC Authorization Sistemi

```bash
feat(auth): implement ABAC authorization with CasL
feat(auth): add ability factory for role-based permissions
test(auth): add comprehensive tests for all user roles
fix(auth): resolve subject type detection in policies guard
refactor(auth): improve type safety in policy handlers
```

### Reports Modülü

```bash
feat(reports): add support report functionality
feat(reports): implement department forwarding system
fix(reports): resolve status transition validation
test(reports): add integration tests for report lifecycle
docs(reports): update API documentation for new endpoints
```

### Shared Packages

```bash
feat(shared): add new TypeScript types for team management
fix(shared): clean up build output files from src directory
chore(shared): update build configuration for proper dist output
refactor(shared): reorganize type definitions structure
```

## 🛠️ Git Hooks ve Otomatik Kontroller

Projemizde aşağıdaki git hooks aktif:

### Pre-commit Hook

- ESLint kontrolü ve otomatik düzeltme
- Prettier ile kod formatlama
- TypeScript tip kontrolü

### Commit-msg Hook

- Commit mesajı format kontrolü (commitlint)
- Conventional commits standardına uygunluk

## 📊 Commit Sıklığı Önerileri

### 🟢 İdeal Commit Sıklığı

- **Günlük:** En az 1-3 commit
- **Özellik başına:** 3-8 commit (küçük, mantıksal adımlar)
- **Bug fix başına:** 1-2 commit

### 🔴 Kaçınılması Gerekenler

- Günlerce commit yapmamak
- Çok büyük, karmaşık commit'ler
- "WIP" (Work in Progress) commit'leri main branch'e atmak

## 🚨 Acil Durum Commit'leri

Kritik bug'lar için:

```bash
fix(critical): resolve security vulnerability in auth system

BREAKING CHANGE: Updated JWT token validation logic.
All existing tokens will be invalidated.

Fixes: #123
```

## 📈 Commit Mesajı Kalite Kontrol

**Her commit öncesi şu soruları sorun:**

1. ✅ Commit mesajım ne yaptığımı açık şekilde anlatıyor mu?
2. ✅ Gelecekte bu commit'i ararken bulabilir miyim?
3. ✅ Başka bir geliştirici bu mesajdan ne yapıldığını anlayabilir mi?
4. ✅ Conventional commits formatına uygun mu?
5. ✅ Scope doğru belirtilmiş mi?

## 🔗 Faydalı Git Komutları

```bash
# Son commit mesajını düzenleme
git commit --amend

# Commit geçmişini görme
git log --oneline --graph

# Belirli dosyaları commit etme
git add <file1> <file2>
git commit -m "feat(scope): specific change description"

# Commit'i geri alma (dikkatli kullanın)
git revert <commit-hash>
```

## 📝 Commit Mesajı Şablonu

`.gitmessage` dosyası oluşturarak varsayılan şablon kullanabilirsiniz:

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Type: feat, fix, chore, docs, refactor, test
# Scope: api, web, shared, ui, auth, reports, users, teams, config, db
# Subject: Imperative mood, no period, max 50 chars
# Body: Explain what and why (optional)
# Footer: Breaking changes, issue references (optional)
```

---

**💡 Hatırlatma:** Düzenli ve kaliteli commit'ler, proje geçmişini takip etmeyi, bug'ları bulmayı ve ekip çalışmasını kolaylaştırır. Her commit'iniz projenin hikayesinin bir parçasıdır!
