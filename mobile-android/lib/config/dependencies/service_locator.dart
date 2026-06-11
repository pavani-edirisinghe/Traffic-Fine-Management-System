import 'package:get_it/get_it.dart';
import '../../data/datasources/local/local_storage_datasource.dart';
import '../../data/datasources/remote/api_client.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/fine_repository.dart';
import '../../data/repositories/payment_repository.dart';
import '../../presentation/providers/auth_provider.dart';
import '../../presentation/providers/payment_provider.dart';

final getIt = GetIt.instance;

void setupServiceLocator() {
  // Data Sources
  getIt.registerSingleton<ApiClient>(ApiClient());
  getIt.registerSingleton<LocalStorageDataSource>(LocalStorageDataSource());

  // Repositories
  getIt.registerSingleton<AuthRepository>(
    AuthRepository(
      apiClient: getIt<ApiClient>(),
      localStorage: getIt<LocalStorageDataSource>(),
    ),
  );
  getIt.registerSingleton<FineRepository>(
    FineRepository(apiClient: getIt<ApiClient>()),
  );
  getIt.registerSingleton<PaymentRepository>(
    PaymentRepository(
      apiClient: getIt<ApiClient>(),
      localStorage: getIt<LocalStorageDataSource>(),
    ),
  );

  // Providers
  getIt.registerSingleton<AuthProvider>(
    AuthProvider(authRepository: getIt<AuthRepository>()),
  );
  getIt.registerSingleton<PaymentProvider>(
    PaymentProvider(
      paymentRepository: getIt<PaymentRepository>(),
      fineRepository: getIt<FineRepository>(),
    ),
  );
}
