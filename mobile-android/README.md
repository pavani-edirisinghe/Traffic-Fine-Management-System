# Traffic Fine Management System - Mobile Portal

A streamlined, lightweight mobile application for drivers in Sri Lanka to instantly pay traffic fines on-the-spot using a secure reference token provided by a police officer.

## Features

- **Instant Fine Lookup**: Drivers can look up their fine using a unique Reference Number or Access Token provided by the issuing officer.
- **No Registration Required**: A frictionless flow that removes the need for driver accounts, or complex logins.
- **Seamless Payments**: Direct integration for immediate fine settlement via Credit/Debit Card or Bank Transfer.
- **Instant Confirmation**: Generates a verifiable confirmation code, transaction ID, and digital receipt upon successful payment.
- **Secure Architecture**: JWT-based token validation ensures fines can only be accessed by the individual holding the physical/digital token.

### Technical Features
- **State Management**: Provider package for efficient state management
- **Navigation**: GoRouter for declarative routing
- **Local Storage**: SharedPreferences and Hive for data persistence
- **HTTP Client**: Dio with interceptors for API communication
- **Design**: Material 3 design system
- **Performance**: Optimized build with code splitting

### Prerequisites
Before you begin, ensure you have the following installed:
Flutter SDK: >= 3.0.0
Dart SDK: >= 3.0.0
Android Studio / Android SDK: Min API 28 (Android 9.0)

### Project Setup

Clone the repository and navigate to the mobile-android directory:
```bash
cd mobile-android
```

### Install Dependencies

```bash
flutter pub get
```

### Generate Build Files

```bash
flutter pub run build_runner build
```

### Run the App

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

## Project Structure

The application follows a simplified Clean Architecture approach optimized for a single-purpose payment flow:

```text
lib/
├── main.dart                          # App entry point
├── config/
│   ├── theme/app_theme.dart           # Centralized Material 3 styling
│   ├── router/app_router.dart         # GoRouter configuration
│   └── dependencies/service_locator.dart # GetIt dependency injection
├── data/
│   ├── datasources/                   # API clients and local storage
│   └── repositories/                  # Data abstraction (Auth, Fine, Payment)
├── domain/
│   └── models/                        # Core data models (User, TrafficFine, Payment)
└── presentation/
    ├── providers/                     # State management (AuthProvider, PaymentProvider)
    └── screens/
        ├── auth/
        │   ├── splash_screen.dart     
        │   └── login_screen.dart      # Token/Reference input screen
        └── payment/
            ├── payment_screen.dart    # Fine details and payment method selection
            ├── payment_confirmation_screen.dart
            ├── payment_success_screen.dart
            └── payment_failure_screen.dart