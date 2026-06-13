class Payment {
  Payment({
    required this.id,
    required this.fineId,
    required this.referenceNumber,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.transactionId,
    required this.paymentDate,
    this.receiptUrl,
    this.notes,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      fineId: json['fineId'] as String,
      referenceNumber: json['referenceNumber'] as String,
      amount: (json['amount'] as num).toDouble(),
      paymentMethod: json['paymentMethod'] as String,
      status: json['status'] as String? ?? 'PENDING',
      transactionId: json['transactionId'] as String?,
      paymentDate: json['paymentDate'] as String,
      receiptUrl: json['receiptUrl'] as String?,
      notes: json['notes'] as String?,
    );
  }
  final String id;
  final String fineId;
  final String referenceNumber;
  final double amount;
  final String paymentMethod;
  final String status; // PENDING, COMPLETED, FAILED
  final String? transactionId;
  final String paymentDate;
  final String? receiptUrl;
  final String? notes;

  Map<String, dynamic> toJson() => {
    'id': id,
    'fineId': fineId,
    'referenceNumber': referenceNumber,
    'amount': amount,
    'paymentMethod': paymentMethod,
    'status': status,
    'transactionId': transactionId,
    'paymentDate': paymentDate,
    'receiptUrl': receiptUrl,
    'notes': notes,
  };
}
