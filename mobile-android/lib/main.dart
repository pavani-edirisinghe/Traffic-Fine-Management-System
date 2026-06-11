import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme/app_theme.dart';
import 'config/router/app_router.dart';
import 'config/dependencies/service_locator.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/payment_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  setupServiceLocator();
  runApp(const TrafficFineApp());
}

class TrafficFineApp extends StatelessWidget {
  const TrafficFineApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => getIt<AuthProvider>()),
          ChangeNotifierProvider(create: (_) => getIt<PaymentProvider>()),
        ],
        child: MaterialApp.router(
          title: 'Traffic Fine Management',
          theme: AppTheme.lightTheme,
          routerConfig: AppRouter.router,
          debugShowCheckedModeBanner: false,
        ),
      );
}
