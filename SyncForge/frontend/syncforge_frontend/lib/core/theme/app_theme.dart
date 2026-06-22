import 'package:flutter/material.dart';

class AppTheme {

  // Primary brand color
  static const Color primary = Color(0xFF2563EB);
  static const Color secondary = Color(0xFF06B6D4);

  // Light theme
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,

    primaryColor: primary,

    scaffoldBackgroundColor: const Color(0xFFF5F7FB),

    appBarTheme: const AppBarTheme(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 0,
    ),

    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primary,
      foregroundColor: Colors.white,
    ),

    cardTheme: const CardThemeData(
      color: Colors.white,
      elevation: 4,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
      ),
    ),

    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: secondary,
    ),
  );

  // Dark theme
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,

    primaryColor: primary,

    scaffoldBackgroundColor: const Color(0xFF0F172A),

    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1E293B),
      foregroundColor: Colors.white,
      elevation: 0,
    ),

    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primary,
    ),

    cardTheme: const CardThemeData(
      color: const Color(0xFF1E293B),
      elevation: 4,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
      ),
    ),

    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: secondary,
    ),
  );
}