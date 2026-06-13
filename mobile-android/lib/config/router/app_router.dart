import 'package:go_router/go_router.dart';
import '../../presentation/screens/auth/splash_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/auth/register_screen.dart';
import '../../presentation/screens/home/home_screen.dart';
import '../../presentation/screens/payment/fine_entry_screen.dart';
import '../../presentation/screens/payment/payment_screen.dart';
import '../../presentation/screens/payment/payment_confirmation_screen.dart';
import '../../presentation/screens/payment/payment_success_screen.dart';
import '../../presentation/screens/payment/payment_failure_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/payment_history/payment_history_screen.dart';
import '../../presentation/screens/settings/settings_screen.dart';
import '../../presentation/screens/help/help_support_screen.dart';
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

          if (!isLoggedIn &&
              !isOnLoginPage &&
              !isOnSplashPage &&
              state.uri.path != '/register') {
            return '/login';
          }

          if (isLoggedIn && isOnLoginPage) {
            return '/home';
          }

          return null;
        },
        routes: [
          GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
          GoRoute(
              path: '/login', builder: (context, state) => const LoginScreen()),
          GoRoute(
            path: '/register',
            builder: (context, state) => const RegisterScreen(),
          ),
          GoRoute(
              path: '/home', builder: (context, state) => const HomeScreen()),
          GoRoute(
            path: '/fine-entry',
            builder: (context, state) => const FineEntryScreen(),
          ),
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
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/payment-history',
            builder: (context, state) => const PaymentHistoryScreen(),
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
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/help-support',
            builder: (context, state) => const HelpSupportScreen(),
          ),
        ],
      );
}
