// lib/core/logger_service.dart
import 'package:logger/logger.dart';

// Uygulama genelinde kullanacağımız tek bir logger örneği.
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 1, // Çağrıldığı metodu göster
    errorMethodCount: 5, // Hata durumunda daha fazla stack trace göster
    lineLength: 80, // Satır uzunluğu
    colors: true, // Renkli loglar
    printEmojis: true, // Log seviyesine göre emoji
    dateTimeFormat: DateTimeFormat.none, // Zaman damgası yok
  ),
);
