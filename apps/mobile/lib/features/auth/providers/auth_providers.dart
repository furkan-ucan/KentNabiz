// lib/features/auth/providers/auth_providers.dart

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import 'package:kentnabiz_mobile/core/api/api_client.dart';
import 'package:kentnabiz_mobile/core/logger_service.dart';
import 'package:kentnabiz_mobile/core/secure_storage_service.dart';
import 'package:kentnabiz_mobile/features/auth/data/auth_repository.dart';
import 'package:kentnabiz_mobile/shared/models/user.dart'; // Added import for User and UserRole
part 'auth_providers.freezed.dart';

// --- TEMEL SERVİS PROVIDER'LARI ---
final secureStorageProvider = Provider((ref) => SecureStorageService());
final apiClientProvider =
    Provider((ref) => ApiClient(ref.watch(secureStorageProvider)));
final authRepositoryProvider = Provider((ref) => AuthRepository(
    ref.watch(apiClientProvider), ref.watch(secureStorageProvider)));

// --- OTURUM DURUMU (AUTH STATE) YÖNETİMİ ---
enum AuthStatus { initial, authenticated, unauthenticated }

@freezed
class AuthState with _$AuthState {
  const factory AuthState({
    @Default(AuthStatus.initial) AuthStatus status,
    User? user,
  }) = _AuthState;
}

extension AuthStateX on AuthState {
  UserRole get primaryRole {
    if (user == null || user!.roles.isEmpty) return UserRole.unknown;
    if (user!.roles.contains(UserRole.teamMember)) return UserRole.teamMember;
    if (user!.roles.contains(UserRole.citizen)) return UserRole.citizen;
    return UserRole.unknown;
  }
}

final authStateProvider = StateProvider<AuthState>((ref) {
  return const AuthState();
});

final authControllerProvider = Provider((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return AuthController(ref: ref, authRepository: authRepository);
});

class AuthController {
  final Ref _ref;
  final AuthRepository _authRepository;

  AuthController({required Ref ref, required AuthRepository authRepository})
      : _ref = ref,
        _authRepository = authRepository;

  // ******* YENİ DETAYLI LOGLAMA *******
  Future<void> checkInitialAuthStatus() async {
    logger.i("[AUTH] checkInitialAuthStatus: Başlatılıyor...");
    try {
      final token = await _authRepository.storageService.getAccessToken();
      logger.i("[AUTH] Token okundu: ${token != null ? "VAR" : "YOK"}");

      if (token != null) {
        _authenticateWithToken(token);
      } else {
        logger.i("[AUTH] State 'unauthenticated' olarak güncelleniyor.");
        _ref.read(authStateProvider.notifier).state =
            const AuthState(status: AuthStatus.unauthenticated);
      }
    } catch (e, s) {
      logger.e("[AUTH] checkInitialAuthStatus içinde HATA YAKALANDI",
          error: e, stackTrace: s);
      _ref.read(authStateProvider.notifier).state =
          const AuthState(status: AuthStatus.unauthenticated);
    }
    logger.i("[AUTH] checkInitialAuthStatus: Tamamlandı.");
  }

  void _authenticateWithToken(String token) {
    logger.i("[AUTH] _authenticateWithToken: Başlatılıyor...");
    try {
      if (JwtDecoder.isExpired(token)) {
        logger.w("[AUTH] Token'ın süresi dolmuş. Çıkış yapılıyor.");
        logout();
        return;
      }

      logger.i("[AUTH] Token parse ediliyor...");
      final decodedToken = JwtDecoder.decode(token);

      logger.i("[AUTH] User.fromJson çağrılıyor...");
      final user = User.fromJson(decodedToken);
      logger.i("[AUTH] User nesnesi oluşturuldu: ${user.email}");

      logger.i("[AUTH] State 'authenticated' olarak güncelleniyor.");
      _ref.read(authStateProvider.notifier).state =
          AuthState(status: AuthStatus.authenticated, user: user);
    } catch (e, s) {
      logger.e("[AUTH] _authenticateWithToken içinde HATA YAKALANDI",
          error: e, stackTrace: s);
      logout();
    }
    logger.i("[AUTH] _authenticateWithToken: Tamamlandı.");
  }
  // ******* LOGLAMA SONU *******

  Future<void> login(String email, String password) async {
    try {
      final token = await _authRepository.login(email, password);
      _authenticateWithToken(token.accessToken);
    } catch (e) {
      _ref.read(authStateProvider.notifier).state =
          const AuthState(status: AuthStatus.unauthenticated);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _ref.read(authStateProvider.notifier).state =
        const AuthState(status: AuthStatus.unauthenticated, user: null);
  }
}

// YENİ PROVIDER:
// Uygulama başlarken auth durumunu kontrol edecek ve tamamlandığında haber verecek.
final authInitializerProvider = FutureProvider<void>((ref) async {
  // AuthController'daki başlangıç metodunu çağır.
  await ref.read(authControllerProvider).checkInitialAuthStatus();
});
