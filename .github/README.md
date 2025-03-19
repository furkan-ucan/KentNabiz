# GitHub CI/CD Yapılandırması

## Branch Protection Kuralları (Basitleştirilmiş)

Bu projenin `master` branch'i için aşağıdaki koruma kuralları ayarlanmıştır:

1. **Pull Request gerektir**: Doğrudan main branch'e push yapılamaz
2. **Gözden geçiren onayı gerektir**: En az 1 onay
3. **Stale gözden geçirmeleri reddet**: Yeni code push'lar önceki onayları geçersiz kılar
4. **Linear history zorla**: Merge commit'ler yerine rebase ve fast-forward tercih edilmeli

## CI Workflow Açıklaması

CI workflow basit bir test job'ı içerir:

### Basic Test Job

- Repository kontrolü
- Node.js kurulumu
- Basit doğrulama

## Kurulumu Tamamlamak İçin

GitHub repository ayarlarından:

1. Settings > Branches > Branch protection rules > Add rule
2. Branch name pattern: `master`
3. Yukarıdaki koruma kurallarını uygulayın
4. Save changes
