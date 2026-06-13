import 'package:go_router/go_router.dart';
import '../../presentation/screens/auth/splash_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/payment/payment_screen.dart';
import '../../presentation/screens/payment/payment_confirmation_screen.dart';
import '../../presentation/screens/payment/payment_success_screen.dart';
import '../../presentation/screens/payment/payment_failure_screen.dart';
import '../../presentation/providers/auth_provider.dart';
import '../../config/dependencies/service_locator.dart';

class AppRouter {
  static GoRouter get router => GoRouter(
        initialLocation: '/',
        redirect: (context, state) {
          final authProvider = getIt<AuthProvider>();
          final isLoggedIn = authProvider.isAuthenticated;
          final isOnLoginPage = state.uri.path == '/login';
          final isOnSplashPage = state.uri.path == '/';

          if (!isLoggedIn && !isOnLoginPage && !isOnSplashPage) {
            return '/login';
          }
          return null;
        },
        routes: [
          GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
          GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
          // After entering reference, directly go to payment
          GoRoute(
            path: '/payment/:fineId',
            builder: (context, state) {
              final fineId = state.pathParameters['fineId']!;
              return PaymentScreen(fineId: fineId);
            },
          ),
          GoRoute(
            path: '/payment-confirmation/:paymentId',
            builder: (context, state) {
              final paymentId = state.pathParameters['paymentId']!;
              return PaymentConfirmationScreen(paymentId: paymentId);
            },
          ),
          GoRoute(
            path: '/payment-success/:paymentId',
            builder: (context, state) {
              final paymentId = state.pathParameters['paymentId']!;
              return PaymentSuccessScreen(paymentId: paymentId);
            },
          ),
          GoRoute(
            path: '/payment-failure',
            builder: (context, state) => const PaymentFailureScreen(),
          ),
        ],
      );
}