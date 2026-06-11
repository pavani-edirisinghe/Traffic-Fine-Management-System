# Quick Start Guide - Traffic Fine Mobile App

Get the app running in 5 minutes!

## Prerequisites
- Flutter SDK installed (`flutter doctor` shows no issues)
- Android emulator running or device connected
- Backend API running on `http://192.168.1.100:8080/api` (or update the URL)

## 1. Install Dependencies (2 minutes)

```bash
cd mobile-android
flutter pub get
```

## 2. Update Backend URL (1 minute)

**File**: `lib/data/datasources/remote/api_client.dart`

```dart
// Line 7: Change this to your backend URL
static const String _baseUrl = 'http://YOUR_BACKEND_IP:8080/api';
```

## 3. Run the App (2 minutes)

```bash
# On emulator
flutter run

# On physical device
flutter devices  # See available devices
flutter run -d <device_id>
```

## First Time User Flow

1. **Register** → Tap "Register here" on login screen
   - Enter: License number, Name, Email, Phone, Password
   - Backend creates account & returns JWT token

2. **Search Fine** → "Pay a Fine" card on home screen
   - Enter: Reference number (e.g., RF20240514001)
   - Select: Fine category
   - System validates fine

3. **Make Payment** → Fill in payment details
   - Select: Payment method (Card/Banking/Transfer)
   - Review: Fine amount
   - Complete payment

4. **View History** → "Payment History" card
   - See all past transactions
   - View payment status & receipts

## Test Accounts

Create test accounts via the register screen with any details:

```
Email: test@example.com
License: L/SL/TEST/123456
Phone: +94771234567
Password: TestPass123
```

## Useful Commands

```bash
# Hot reload during development
# Press 'r' in terminal

# Full restart
# Press 'R' in terminal

# View logs
flutter logs

# Analyze code
flutter analyze

# Format code
dart format lib/

# Build debug APK
flutter build apk --debug

# Build release APK
flutter build apk --release
```

## Screens Overview

### Authentication
- **Login**: Email + Password
- **Register**: Full registration form with license details

### Main App
- **Home**: Quick access to pay fine & view history
- **Fine Entry**: Search fines by reference & category
- **Payment**: Show fine details & select payment method
- **Confirmation**: Verify payment with transaction ID
- **Profile**: View user information
- **History**: List of all payments

## Troubleshooting

### App won't start?
```bash
flutter clean
flutter pub get
flutter run -v  # Shows detailed logs
```

### Can't connect to API?
- Check backend is running
- Verify API URL in api_client.dart
- Check device has internet
- Use `adb logcat` to see error details

### Dependency errors?
```bash
flutter pub cache clean
flutter pub get
flutter pub run build_runner build
```

### Payment not working?
- Verify fine exists in backend
- Check payment endpoint is implemented
- Verify JWT token is valid
- Check transaction ID format

## File Structure Quick Reference

```
lib/
├── main.dart              ← App entry point
├── config/
│   ├── theme/            ← Colors, fonts, themes
│   ├── router/           ← Navigation setup
│   └── dependencies/     ← Service locator
├── data/
│   ├── datasources/      ← API & local storage
│   └── repositories/     ← Business logic
├── domain/
│   └── models/           ← Data models
└── presentation/
    ├── providers/        ← State management
    └── screens/          ← All UI screens
```

## Important Files for Customization

| File | Purpose | Changes Needed |
|------|---------|-----------------|
| `api_client.dart` | API configuration | Update base URL |
| `app_theme.dart` | UI colors & fonts | Customize branding |
| `auth_provider.dart` | Auth logic | Add extra fields |
| `*_screen.dart` | UI screens | Match Figma design |

## Next Steps

1. ✅ Run app to verify setup
2. ✅ Test login/register with backend
3. ✅ Test fine lookup
4. ✅ Test payment flow
5. 📝 Update API URLs if needed
6. 📝 Configure payment gateway
7. 📝 Add SMS notifications
8. 🚀 Build APK for distribution

## Documentation Files

- **README.md** - Full feature overview
- **DEVELOPMENT_GUIDE.md** - Dev workflows
- **API_CONTRACT.md** - Backend API specs
- **SETUP_AND_DEPLOYMENT.md** - Full deployment guide

## Common Tasks

### Add a new screen
1. Create file in `lib/presentation/screens/{feature}/`
2. Add route in `lib/config/router/app_router.dart`
3. Create provider if needed

### Add API endpoint
1. Add method in `api_client.dart`
2. Create repository method
3. Use in provider

### Change colors
Edit `lib/config/theme/app_theme.dart` constants.

### Debug payment flow
1. Add `print()` statements in providers
2. Use `flutter logs` to see output
3. Check backend logs

---

**Need help?** Check the documentation files or run `flutter doctor` to verify your setup!
