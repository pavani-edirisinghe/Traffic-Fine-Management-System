class User {
  User({
    required this.id,
    required this.username,
    required this.licenseNumber,
    required this.email,
    required this.phoneNumber,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.licenseExpiryDate,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    String readString(String key, {String fallback = ''}) {
      final value = json[key];
      if (value == null) {
        return fallback;
      }
      return value.toString();
    }

    return User(
      id: readString('id'),
      username: readString('username', fallback: readString('email')),
      licenseNumber: readString('licenseNumber'),
      email: readString('email', fallback: readString('username')),
      phoneNumber: readString('phoneNumber'),
      firstName: readString('firstName'),
      lastName: readString('lastName'),
      role: readString('role'),
      licenseExpiryDate: readString('licenseExpiryDate'),
      createdAt: readString('createdAt'),
    );
  }
  final String id;
  final String username;
  final String licenseNumber;
  final String email;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String role;
  final String licenseExpiryDate;
  final String createdAt;

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'licenseNumber': licenseNumber,
    'email': email,
    'phoneNumber': phoneNumber,
    'firstName': firstName,
    'lastName': lastName,
    'role': role,
    'licenseExpiryDate': licenseExpiryDate,
    'createdAt': createdAt,
  };

  String get fullName => '$firstName $lastName';
}
