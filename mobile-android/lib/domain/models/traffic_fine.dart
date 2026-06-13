class TrafficFine {
  // PENDING, PAID

  TrafficFine({
    required this.id,
    required this.referenceNumber,
    required this.categoryId,
    required this.categoryName,
    required this.amount,
    required this.violationDescription,
    required this.issueDate,
    required this.driverId,
    required this.vehicleNumber,
    required this.status,
  });

  factory TrafficFine.fromJson(Map<String, dynamic> json) {
    return TrafficFine(
      id: json['id'] as String,
      referenceNumber: json['referenceNumber'] as String,
      categoryId: json['categoryId'] as String,
      categoryName: json['categoryName'] as String,
      amount: (json['amount'] as num).toDouble(),
      violationDescription: json['violationDescription'] as String,
      issueDate: json['issueDate'] as String,
      driverId: json['driverId'] as String,
      vehicleNumber: json['vehicleNumber'] as String,
      status: json['status'] as String? ?? 'PENDING',
    );
  }
  final String id;
  final String referenceNumber;
  final String categoryId;
  final String categoryName;
  final double amount;
  final String violationDescription;
  final String issueDate;
  final String driverId;
  final String vehicleNumber;
  final String status;

  Map<String, dynamic> toJson() => {
    'id': id,
    'referenceNumber': referenceNumber,
    'categoryId': categoryId,
    'categoryName': categoryName,
    'amount': amount,
    'violationDescription': violationDescription,
    'issueDate': issueDate,
    'driverId': driverId,
    'vehicleNumber': vehicleNumber,
    'status': status,
  };
}
