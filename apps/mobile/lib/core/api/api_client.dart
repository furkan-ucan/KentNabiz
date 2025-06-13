import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kentnabiz_mobile/core/logger_service.dart';
import 'package:kentnabiz_mobile/core/secure_storage_service.dart';

class ApiClient {
  late final Dio dio;
  final SecureStorageService _storageService;

  ApiClient(this._storageService) {
    final baseUrl = dotenv.env['API_BASE_URL'];
    if (baseUrl == null || baseUrl.isEmpty) {
      const errorMsg = "API_BASE_URL .env dosyasında bulunamadı!";
      logger.e(errorMsg);
      throw Exception(errorMsg);
    }

    final options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    );

    dio = Dio(options);

    // Token Interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (options.path.contains('/auth/login') ||
              options.path.contains('/auth/register')) {
            return handler.next(options);
          }
          final token = await _storageService.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // TODO: 401 Unauthorized için refresh token mekanizması eklenecek
          return handler.next(e);
        },
      ),
    );

    // Loglama Interceptor'ı
    dio.interceptors.add(
      LogInterceptor(
        requestHeader: true,
        requestBody: true,
        responseHeader: true,
        responseBody: true,
        logPrint: (obj) => logger.d(obj),
      ),
    );
  }

  /// Media URL'leri için authorization header ile beraber HTTP HEAD isteği yapar
  /// Bu sayede resmin mevcut olup olmadığını kontrol eder
  Future<bool> checkMediaAccess(String mediaUrl) async {
    try {
      final response = await dio.head(mediaUrl);
      return response.statusCode == 200;
    } catch (e) {
      logger.w('Media access check failed for $mediaUrl: $e');
      return false;
    }
  }

  /// Media dosyalarını almak için özel method
  /// Authorization header ile beraber istek yapar
  Future<Response> getMediaFile(String mediaPath) async {
    return await dio.get(
      '/media/view/private/$mediaPath',
      options: Options(
        responseType: ResponseType.bytes,
      ),
    );
  }
}
