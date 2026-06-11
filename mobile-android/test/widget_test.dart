import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:traffic_fine_management/main.dart';
import 'package:traffic_fine_management/config/dependencies/service_locator.dart';

void main() {
  testWidgets('app boots without exceptions', (WidgetTester tester) async {
    TestWidgetsFlutterBinding.ensureInitialized();
    setupServiceLocator();

    await tester.pumpWidget(const TrafficFineApp());
    await tester.pumpAndSettle();

    expect(find.byType(MaterialApp), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
