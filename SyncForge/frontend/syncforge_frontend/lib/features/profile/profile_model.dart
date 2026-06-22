class UserProfile {
  final String fullName;
  final String email;
  final String phoneNumber;
  final String role;

  UserProfile({
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.role,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      fullName: json["fullName"] ?? "",
      email: json["email"] ?? "",
      phoneNumber: json["phoneNumber"] ?? "",
      role: json["role"] ?? "",
    );
  }
}
