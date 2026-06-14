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
      // 1. FIXED THE CRASH: Safely convert integer IDs to Strings
      id: json['id']?.toString() ?? '',
      referenceNumber: json['referenceNumber']?.toString() ?? '',
      
      // 2. FIXED FIELD MISMATCHES: Check both Flutter's expected name and Spring Boot's actual name
      categoryId: (json['categoryId'] ?? json['categoryIdentifier'])?.toString() ?? '',
      categoryName: json['categoryName']?.toString() ?? '',
      
      // Safely parse the double amount
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      
      violationDescription: (json['violationDescription'] ?? json['description'])?.toString() ?? '',
      issueDate: (json['issueDate'] ?? json['issuedAt'])?.toString() ?? '',
      
      // Handle the nested driver object from the backend
      driverId: (json['driverId'] ?? json['driver']?['id'])?.toString() ?? '',
      
      vehicleNumber: json['vehicleNumber']?.toString() ?? '',
      status: json['status']?.toString() ?? 'PENDING',
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