class AppConfig {

  // ===================================
  // CHANGE ONLY THESE
  // ===================================

  // PHONE TESTING
  static const String server =
      "10.103.253.13:8080";

  // LAPTOP PRESENTATION
   //static const String server =
    //  "localhost:8080";

  // DEPLOYED SERVER
  // static const String server =
  //     "yourdomain.com";

  // ===================================
  // AUTO GENERATED URLS
  // ===================================

  static const String apiBaseUrl =
      "http://$server/api";

  static const String baseUrl =
      "http://$server";

  static const String websocketUrl =
      "ws://$server/ws";
}