class TextFormatter {

  static String toTitleCase(String text) {

    if (text.trim().isEmpty) {
      return "";
    }

    return text
        .trim()
        .split(RegExp(r'\s+'))
        .map((word) {
          if (word.isEmpty) return "";
          return word[0].toUpperCase() + word.substring(1).toLowerCase();
        })
        .join(" ");
  }
}