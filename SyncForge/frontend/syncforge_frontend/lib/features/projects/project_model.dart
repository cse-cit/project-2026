class Project {
  final String id;
  final String name;
  final String description;
  final String ownerId;
  final List members;

  Project({
    required this.id,
    required this.name,
    required this.description,
    required this.ownerId,
    required this.members,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json["id"],
      name: json["name"],
      description: json["description"] ?? "",
      ownerId: json["ownerId"],
      members: json["members"] ?? [],
    );
  }
}
