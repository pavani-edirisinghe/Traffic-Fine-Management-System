# Traffic Fine Management System - Flutter Android App

A mobile application for drivers in Sri Lanka to pay traffic fines on-the-spot or online through a secure, user-friendly interface.

## Features

### Core Features
- **User Authentication**: Secure JWT-based login and registration
- **Fine Lookup**: Search for traffic fines using reference number and category
- **Multiple Payment Methods**: Support for card, mobile banking, and bank transfers
- **Real-time Payment Status**: Check payment status instantly
- **Payment History**: View all past payments and receipts
- **User Profile**: Manage and view personal information
- **Offline Support**: Store offline payments for sync when online
- **Security**: JWT tokens, encrypted storage, secure API communication

### Technical Features
- **State Management**: Provider package for efficient state management
- **Navigation**: GoRouter for declarative routing
- **Local Storage**: SharedPreferences and Hive for data persistence
- **HTTP Client**: Dio with interceptors for API communication
- **Design**: Material 3 design system
- **Performance**: Optimized build with code splitting

## Project Structure

```
lib/
├── main.dart                          # App entry point
├── config/
│   ├── theme/
│   │   └── app_theme.dart            # App theme configuration
│   ├── router/
│   │   └── app_router.dart           # Navigation routes
│   └── dependencies/
│       └── service_locator.dart      # Dependency injection setup
├── data/
│   ├── datasources/
│   │   ├── local/
│   │   │   └── local_storage_datasource.dart
│   │   └── remote/
│   │       └── api_client.dart
│   └── repositories/
│       ├── auth_repository.dart
│       ├── fine_repository.dart
│       └── payment_repository.dart
├── domain/
│   └── models/
│       ├── user.dart
│       ├── traffic_fine.dart
│       └── payment.dart
└── presentation/
    ├── providers/
    │   ├── auth_provider.dart
    │   └── payment_provider.dart
    └── screens/
        ├── auth/
        │   ├── login_screen.dart
        │   └── register_screen.dart
        ├── home/
        │   └── home_screen.dart
        ├── payment/
        │   ├── fine_entry_screen.dart
        │   ├── payment_screen.dart
        │   └── payment_confirmation_screen.dart
        ├── profile/
        │   └── profile_screen.dart
        └── payment_history/
            └── payment_history_screen.dart
```

## Architecture

The app follows **Clean Architecture** with three main layers:

### 1. **Presentation Layer**
- Flutter widgets and screens
- Provider-based state management
- User interface and user experience

### 2. **Data Layer**
- Data sources (local and remote)
- Repository pattern for data abstraction
- API clients and database handlers

### 3. **Domain Layer**
- Business logic and models
- Repository interfaces
- Use cases

## Requirements

- Flutter SDK: >= 3.0.0
- Dart SDK: >= 3.0.0
- Android SDK: Min API 28 (Android 9.0)
- Java 17 or higher

## Installation

### 1. Prerequisites

Install Flutter and ensure your environment is set up:
```bash
flutter doctor
```

### 2. Project Setup

Clone the repository and navigate to the mobile-android directory:
```bash
cd mobile-android
```

### 3. Install Dependencies

```bash
flutter pub get
```

### 4. Generate Build Files

```bash
flutter pub run build_runner build
```

### 5. Run the App

**On Emulator:**
```bash
flutter run
```

**On Physical Device:**
```bash
flutter run -d <device_id>
```

**With Release Mode:**
```bash
flutter run --release
```

## Building for Production

### Android APK
```bash
flutter build apk --release
```

### Android App Bundle
```bash
flutter build appbundle --release
```

## Configuration

### API Base URL

Update the base URL in [lib/data/datasources/remote/api_client.dart](lib/data/datasources/remote/api_client.dart):

```dart
static const String _baseUrl = 'http://your-api-server:8080/api';
```

### Payment Gateway Integration

The app supports multiple payment gateways. Configure your payment provider:
- Update payment initiation logic in `payment_provider.dart`
- Configure payment verification endpoints
- Set up SMS notification handling

## API Integration

The app communicates with the backend REST API. Key endpoints:

- **Authentication**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

- **Fines**
  - `GET /api/fines/validate?referenceNumber=&categoryId=` - Validate fine

- **Payments**
  - `POST /api/payments` - Create payment
  - `GET /api/payments/{paymentId}` - Get payment status
  - `POST /api/payments/{paymentId}/verify` - Verify payment
  - `GET /api/payments/history` - Get payment history

- **User**
  - `GET /api/users/profile` - Get user profile

## Authentication

The app uses JWT (JSON Web Token) for authentication:

1. User logs in with email and password
2. Backend returns JWT token
3. Token is stored securely in local storage
4. Token is sent with each API request in Authorization header
5. Token is automatically refreshed on expiry

## State Management

The app uses **Provider** for state management:

- `AuthProvider`: Manages authentication state and user data
- `PaymentProvider`: Manages payment flow and transaction state

## Local Storage

- **SharedPreferences**: For storing tokens and simple key-value data
- **Hive**: For storing offline payments (future enhancement)

## Security Considerations

- ✅ JWT tokens for API authentication
- ✅ Secure token storage using flutter_secure_storage
- ✅ HTTPS for API communication (configure in production)
- ✅ Input validation on all user inputs
- ✅ Sensitive data not logged
- ✅ Permissions properly requested

## Testing

Run unit tests:
```bash
flutter test
```

Run with coverage:
```bash
flutter test --coverage
```

## Troubleshooting

### Dependency Issues
```bash
flutter pub cache clean
flutter pub get
```

### Build Cache Issues
```bash
flutter clean
flutter pub get
flutter run
```

### API Connection Issues
- Verify backend server is running
- Check API base URL configuration
- Ensure device has internet connectivity
- Check firewall settings

## Performance Optimization

- Lazy loading of payment history
- Image optimization and caching
- Minimal rebuild with Provider selector
- Efficient list rendering with ListView.builder
- Optimized API calls with debouncing

## Future Enhancements

- [ ] Biometric authentication
- [ ] Receipt download and sharing
- [ ] Push notifications for payment updates
- [ ] Multiple language support (Sinhala, Tamil)
- [ ] QR code scanning for fine reference
- [ ] Payment installment plans
- [ ] Direct SMS verification
- [ ] Offline payment queue

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact: [support email]
- Documentation: See DEVELOPMENT_GUIDE.md

## Team

- Mobile Development: [Your Name]
- Backend Development: [Team Member]
- Frontend Web: [Team Member]
- UI/UX Design: [Team Member]
- QA & Testing: [Team Member]
