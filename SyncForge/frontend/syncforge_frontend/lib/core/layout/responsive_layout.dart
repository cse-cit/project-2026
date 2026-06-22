import 'package:flutter/material.dart';

class ResponsiveLayout extends StatelessWidget {

  final Widget mobile;
  final Widget tablet;
  final Widget desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    required this.tablet,
    required this.desktop,
  });

  @override
  Widget build(BuildContext context) {

    double width = MediaQuery.of(context).size.width;

    if (width < 700) {
      return mobile;
    }

    if (width < 1100) {
      return tablet;
    }

    return desktop;
  }
}