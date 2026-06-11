import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../config/theme/app_theme.dart';

class FineEntryScreen extends StatefulWidget {
  const FineEntryScreen({Key? key}) : super(key: key);

  @override
  State<FineEntryScreen> createState() => _FineEntryScreenState();
}

class _FineEntryScreenState extends State<FineEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _vehicleController = TextEditingController();
  final _offenceController = TextEditingController();
  final _locationController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _vehicleController.dispose();
    _offenceController.dispose();
    _locationController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    // TODO: Hook into provider/repository to create fine
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Fine submitted (mock)')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surfaceContainerLow,
        title: Text('Enter Fine',
            style: GoogleFonts.montserrat(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.primary)),
        leading: BackButton(color: AppColors.onSurface),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                TextFormField(
                  controller: _vehicleController,
                  decoration:
                      const InputDecoration(labelText: 'Vehicle Number'),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'Enter vehicle number' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _offenceController,
                  decoration: const InputDecoration(labelText: 'Offence'),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'Describe the offence' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _locationController,
                  decoration: const InputDecoration(labelText: 'Location'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _amountController,
                  decoration: const InputDecoration(labelText: 'Amount (LKR)'),
                  keyboardType: TextInputType.number,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Enter amount';
                    final n = double.tryParse(v);
                    if (n == null) return 'Enter valid number';
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _notesController,
                  decoration:
                      const InputDecoration(labelText: 'Notes (optional)'),
                  maxLines: 3,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _submit,
                  child: const Text('Create Fine'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
