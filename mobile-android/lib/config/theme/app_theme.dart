import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF002753);
  static const Color primaryContainer = Color(0xFF003d7a);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onPrimaryContainer = Color(0xFF81aaed);
  static const Color onPrimaryFixed = Color(0xFF001b3d);
  static const Color onPrimaryFixedVariant = Color(0xFF134684);
  static const Color primaryFixed = Color(0xFFd6e3ff);
  static const Color primaryFixedDim = Color(0xFFa8c8ff);

  // Secondary Colors
  static const Color secondary = Color(0xFF974900);
  static const Color secondaryContainer = Color(0xFFfc7d00);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onSecondaryContainer = Color(0xFF5b2900);
  static const Color onSecondaryFixed = Color(0xFF311300);
  static const Color onSecondaryFixedVariant = Color(0xFF733600);
  static const Color secondaryFixed = Color(0xFFffdbc7);
  static const Color secondaryFixedDim = Color(0xFFffb688);

  // Tertiary Colors
  static const Color tertiary = Color(0xFF580000);
  static const Color tertiaryContainer = Color(0xFF820001);
  static const Color onTertiary = Color(0xFFFFFFFF);
  static const Color onTertiaryContainer = Color(0xFFff8574);
  static const Color onTertiaryFixed = Color(0xFF410000);
  static const Color onTertiaryFixedVariant = Color(0xFF930002);
  static const Color tertiaryFixed = Color(0xFFffdad5);
  static const Color tertiaryFixedDim = Color(0xFFffb4a8);

  // Surface Colors
  static const Color surface = Color(0xFFf9f9ff);
  static const Color surfaceDim = Color(0xFFd0daf2);
  static const Color surfaceBright = Color(0xFFf9f9ff);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainerLow = Color(0xFFf0f3ff);
  static const Color surfaceContainer = Color(0xFFe8eeff);
  static const Color surfaceContainerHigh = Color(0xFFdfe8ff);
  static const Color surfaceContainerHighest = Color(0xFFd9e3fb);
  static const Color surfaceVariant = Color(0xFFd9e3fb);
  static const Color inverseSurface = Color(0xFF273143);

  // Background & On-Surface
  static const Color background = Color(0xFFf9f9ff);
  static const Color onBackground = Color(0xFF111c2d);
  static const Color onSurface = Color(0xFF111c2d);
  static const Color onSurfaceVariant = Color(0xFF434750);
  static const Color inverseOnSurface = Color(0xFFecf0ff);

  // Error Colors
  static const Color error = Color(0xFFba1a1a);
  static const Color errorContainer = Color(0xFFffdad6);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color onErrorContainer = Color(0xFF93000a);

  // Success Colors
  static const Color success = Color(0xFF27AE60);
  static const Color successContainer = Color(0xFFA0F5AA);

  // Outline
  static const Color outline = Color(0xFF737781);
  static const Color outlineVariant = Color(0xFFc3c6d2);

  // Surface Tint
  static const Color surfaceTint = Color(0xFF335f9d);
}

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.onPrimary,
          primaryContainer: AppColors.primaryContainer,
          onPrimaryContainer: AppColors.onPrimaryContainer,
          secondary: AppColors.secondary,
          onSecondary: AppColors.onSecondary,
          secondaryContainer: AppColors.secondaryContainer,
          onSecondaryContainer: AppColors.onSecondaryContainer,
          tertiary: AppColors.tertiary,
          onTertiary: AppColors.onTertiary,
          tertiaryContainer: AppColors.tertiaryContainer,
          onTertiaryContainer: AppColors.onTertiaryContainer,
          error: AppColors.error,
          onError: AppColors.onError,
          errorContainer: AppColors.errorContainer,
          onErrorContainer: AppColors.onErrorContainer,
          surface: AppColors.surface,
          onSurface: AppColors.onSurface,
          outline: AppColors.outline,
          outlineVariant: AppColors.outlineVariant,
          surfaceContainerHighest: AppColors.surfaceVariant,
        ),
        scaffoldBackgroundColor: AppColors.surface,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.surfaceContainerLow,
          foregroundColor: AppColors.onSurface,
          elevation: 1,
          surfaceTintColor: AppColors.surfaceTint,
          centerTitle: false,
          titleTextStyle: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: AppColors.surfaceContainer,
          indicatorColor: AppColors.secondaryContainer,
          labelTextStyle: WidgetStateProperty.all(
            GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ),
        textTheme: TextTheme(
          displayLarge: GoogleFonts.montserrat(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: AppColors.onSurface,
            height: 1.25,
          ),
          headlineMedium: GoogleFonts.montserrat(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
            height: 1.33,
          ),
          titleLarge: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
            height: 1.4,
          ),
          bodyLarge: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w400,
            color: AppColors.onSurface,
            height: 1.56,
          ),
          bodyMedium: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: AppColors.onSurface,
            height: 1.5,
          ),
          labelLarge: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
            height: 1.43,
            letterSpacing: 0.1,
          ),
          labelMedium: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.onSurface,
            height: 1.33,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surfaceContainerLowest,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.outline, width: 2),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.outline, width: 2),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.error, width: 2),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.error, width: 2),
          ),
          hintStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: AppColors.onSurfaceVariant,
          ),
          labelStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.onPrimary,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            elevation: 2,
            textStyle: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            textStyle:
                GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
          ),
        ),
        cardTheme: CardThemeData(
          color: AppColors.surfaceContainerLowest,
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppColors.outlineVariant),
          ),
        ),
      );
}
