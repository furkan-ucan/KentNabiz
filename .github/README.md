# GitHub CI/CD ve Branch Protection

## Branch Protection Kuralları

Bu projenin `main` branch'i için aşağıdaki koruma kuralları ayarlanmalıdır:

1. **Pull Request gerektir**: Doğrudan main branch'e push yapılamaz
2. **Status checks'in başarılı olmasını gerektir**:
   - `test` job
   - `build` job
3. **Gözden geçiren onayı gerektir**: En az 1 onay
4. **Stale gözden geçirmeleri reddet**: Yeni code push'lar önceki onayları geçersiz kılar
5. **Branch güncel olmalı**: Merge öncesi branch güncel olmalıdır
6. **Linear history zorla**: Merge commit'ler yerine rebase ve fast-forward tercih edilmeli

## CI Workflow Açıklaması

CI workflow iki ana job içermektedir:

### 1. Test Job

- Kod kalitesi kontrolleri
- Statik tip kontrolü
- Linting
- Birim testleri

### 2. Build Job

- Tüm paketleri oluşturma
- Derleme işlemlerini doğrulama

## Kurulumu Tamamlamak İçin

GitHub repository ayarlarından:

1. Settings > Branches > Branch protection rules > Add rule
2. Branch name pattern: `main`
3. Yukarıdaki koruma kurallarını uygulayın
4. Save changes
