// lib/features/auth/data/auth_repository.dart
import 'package:kentnabiz_mobile/core/api/api_client.dart';

import 'package:kentnabiz_mobile/core/secure_storage_service.dart';
import 'package:kentnabiz_mobile/features/auth/domain/token_response.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorageService storageService;

  // Depencency'leri constructor'a ekle
  AuthRepository(this._apiClient, this.storageService);

  Future<TokenResponse> login(String email, String password) async {
    final response = await _apiClient.dio.post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );

    // Swagger'a göre data 'data' key'i altında geliyor.
    final tokenResponse = TokenResponse.fromJson(response.data['data']);

    await storageService.saveTokens(
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
    );

    return tokenResponse; // Token'ı geri döndür
  }

  Future<void> logout() async {
    await storageService.deleteAllTokens();
    // TODO: Sunucudaki logout endpoint'ini de çağırabiliriz.
  }
}
