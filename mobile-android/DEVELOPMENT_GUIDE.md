# Flutter Android App - Development Guide

## Quick Start

### 1. Initial Setup (One-time)

```bash
cd mobile-android

# Install Flutter dependencies
flutter pub get

# Generate build files
flutter pub run build_runner build

# Check environment
flutter doctor
```

### 2. Running the App

**Development:**
```bash
flutter run
```

**Debug with Verbose Output:**
```bash
flutter run -v
```

**Release Mode:**
```bash
flutter run --release
```

**On Specific Device:**
```bash
# List devices
flutter devices

# Run on specific device
flutter run -d <device_id>
```

## Development Workflow

### Adding New Screens

1. Create a new screen in `lib/presentation/screens/{feature}/`
2. Update routes in `lib/config/router/app_router.dart`
3. Add route in the `AppRouter.router` GoRouter configuration
4. Create corresponding provider if needed in `lib/presentation/providers/`

### Adding New API Endpoints

1. Add method in `lib/data/datasources/remote/api_client.dart`
2. Add wrapper method in relevant repository
3. Create provider method if needed
4. Update service locator if new repository is added

### State Management Pattern

```dart
// In Provider
class MyProvider extends ChangeNotifier {
  String _data = '';
  bool _isLoading = false;
  String? _error;

  String get data => _data;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _data = await repository.getData();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### Using Providers in UI

```dart
// Reading data
Consumer<MyProvider>(
  builder: (context, provider, _) {
    return Text(provider.data);
  },
)

// Calling methods
context.read<MyProvider>().fetchData();
```

## Common Tasks

### Updating API Base URL

Edit `lib/data/datasources/remote/api_client.dart`:
```dart
static const String _baseUrl = 'http://your-server:8080/api';
```

### Adding New Dependencies

1. Update `pubspec.yaml`
2. Run `flutter pub get`
3. For code generation packages, run `flutter pub run build_runner build`

### Handling Errors

All API errors are caught and returned through providers:
```dart
if (provider.error != null) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(provider.error!)),
  );
}
```

### Working with Local Storage

```dart
// Save data
await localStorage.saveToken(token);

// Retrieve data
String? token = localStorage.getToken();

// Remove data
await localStorage.removeToken();

// Clear all
await localStorage.clearAll();
```

## Debugging

### Enable Debug Logs

```bash
flutter run -v
```

### Use DevTools

```bash
flutter pub global activate devtools
devtools
```

Then run:
```bash
flutter run --observatory-port=<port>
```

### Hot Reload

Press `r` in terminal during `flutter run` to hot reload.

Press `R` for full restart.

## Code Organization

### Naming Conventions

- **Files**: `snake_case` (e.g., `user_model.dart`)
- **Classes**: `PascalCase` (e.g., `UserModel`)
- **Constants**: `camelCase` (e.g., `const apiTimeout = 30`)
- **Variables**: `camelCase` (e.g., `var userName`)
- **Privates**: Prefix with `_` (e.g., `_privateMethod()`)

### File Structure

```
lib/
├── config/          # Configuration & setup
├── data/            # Data layer (API, local storage)
├── domain/          # Domain models & business logic
└── presentation/    # UI layer (screens, widgets, providers)
```

## Testing

### Run All Tests

```bash
flutter test
```

### Run Specific Test File

```bash
flutter test test/providers/auth_provider_test.dart
```

### Generate Coverage Report

```bash
flutter test --coverage
lcov --list coverage/lcov.info  # View coverage
```

## Building APK/App Bundle

### Debug APK
```bash
flutter build apk --debug
```

### Release APK
```bash
flutter build apk --release
```

### App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

### Analyze APK Size
```bash
flutter build apk --release
# Find APK at: build/app/outputs/flutter-apk/app-release.apk
```

## Performance Tips

1. **Avoid Rebuilds**
   - Use `Consumer` instead of `Provider.watch`
   - Use `select` for specific state pieces

2. **Optimize Images**
   - Use appropriate image sizes
   - Enable caching

3. **List Performance**
   - Use `ListView.builder` for large lists
   - Implement pagination

4. **Lazy Loading**
   - Load screens on demand
   - Don't load all payment history at once

## Environment Variables

Create `.env` file in project root (not included in git):

```
API_BASE_URL=http://your-api-server:8080/api
PAYMENT_GATEWAY_KEY=your_key_here
SMS_PROVIDER_KEY=your_key_here
```

Load with `flutter_dotenv` package.

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and test
flutter test
flutter analyze

# Commit
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/feature-name

# Create pull request on GitHub
```

## Common Issues & Solutions

### Issue: Gradle Build Failed
**Solution**: 
```bash
flutter clean
rm -rf build/
flutter pub get
flutter run
```

### Issue: API Connection Refused
**Solution**: 
- Check backend server is running
- Verify firewall allows connection
- Check base URL is correct
- Use `flutter run -v` to see detailed logs

### Issue: Token Expired
**Solution**: 
- Token is stored in SecureStorage
- Implement token refresh logic in ApiClient interceptor
- Log user out on 401 response

### Issue: Hot Reload Not Working
**Solution**: 
- Press `R` for full restart instead
- Some changes require full rebuild (imports, const changes)

## Useful Links

- [Flutter Official Docs](https://flutter.dev/docs)
- [Provider Package Docs](https://pub.dev/packages/provider)
- [GoRouter Docs](https://pub.dev/packages/go_router)
- [Dio Package Docs](https://pub.dev/packages/dio)
- [Material Design 3](https://m3.material.io/)

## Team Communication

- Code reviews: Required before merge
- PR Comments: Address before merging
- Slack Channel: #mobile-development
- Daily Standup: 10:00 AM
- Sprint Planning: Every Monday

## Version Management

Current Version: 1.0.0+1

Version Format: `major.minor.patch+buildNumber`

Update in `pubspec.yaml`:
```yaml
version: 1.0.0+1
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No analyzer warnings
- [ ] API endpoints tested
- [ ] Offline functionality verified
- [ ] Payment flow tested end-to-end
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security review completed
- [ ] Release build generated
- [ ] App signed properly
- [ ] App bundle uploaded to Play Store
