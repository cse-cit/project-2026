import 'package:flutter/material.dart';

import '../../core/widgets/custom_textfield.dart';

import 'auth_service.dart';

class RegisterScreen extends StatefulWidget {

  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() =>
      _RegisterScreenState();
}

class _RegisterScreenState
    extends State<RegisterScreen> {

  final fullNameController =
      TextEditingController();

  final emailController =
      TextEditingController();

  final phoneController =
      TextEditingController();

  final passwordController =
      TextEditingController();

  final confirmPasswordController =
      TextEditingController();

  bool loading = false;

  Future<void> register() async {

    final fullName =
        fullNameController.text.trim();

    final email =
        emailController.text.trim();

    final phone =
        phoneController.text.trim();

    final password =
        passwordController.text.trim();

    final confirmPassword =
        confirmPasswordController
            .text
            .trim();

    // VALIDATION

    if (fullName.isEmpty ||
        email.isEmpty ||
        phone.isEmpty ||
        password.isEmpty ||
        confirmPassword.isEmpty) {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(
          content:
              Text("All fields are required"),
        ),
      );

      return;
    }

    if (password != confirmPassword) {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(
          content:
              Text("Passwords do not match"),
        ),
      );

      return;
    }

    setState(() {
      loading = true;
    });

    bool success =
        await AuthService.register(

      fullName,

      email,

      phone,

      password,
    );

    setState(() {
      loading = false;
    });

    if (!mounted) return;

    if (success) {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(
          content:
              Text("Registration successful"),
        ),
      );

      Navigator.pop(context);

    } else {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(
          content:
              Text("Registration failed"),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {

    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return Scaffold(

      body: Container(

        decoration: BoxDecoration(

          gradient: LinearGradient(

            begin: Alignment.topLeft,
            end: Alignment.bottomRight,

            colors: isDark

                ? [
                    const Color(
                        0xFF0F172A),
                    const Color(
                        0xFF111827),
                    const Color(
                        0xFF1E293B),
                  ]

                : [
                    const Color(
                        0xFFF8FAFC),
                    const Color(
                        0xFFE2E8F0),
                    const Color(
                        0xFFCBD5E1),
                  ],
          ),
        ),

        child: Center(

          child:
              SingleChildScrollView(

            padding:
                const EdgeInsets.all(24),

            child: ConstrainedBox(

              constraints:
                  const BoxConstraints(
                maxWidth: 420,
              ),

              child: Card(

                elevation: 10,

                color: Theme.of(context)
                    .cardColor,

                shape:
                    RoundedRectangleBorder(

                  borderRadius:
                      BorderRadius.circular(
                    24,
                  ),
                ),

                child: Padding(

                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 28,
                    vertical: 34,
                  ),

                  child: Column(

                    mainAxisSize:
                        MainAxisSize.min,

                    children: [

                      // LOGO

                      Container(

                        padding:
                            const EdgeInsets.all(
                          16,
                        ),

                        decoration:
                            BoxDecoration(

                          color: Theme.of(
                                  context)
                              .colorScheme
                              .primary
                              .withOpacity(0.08),

                          shape:
                              BoxShape.circle,
                        ),

                        child: Image.asset(

                          "assets/images/syncforge_logo.png",

                          height: 64,
                        ),
                      ),

                      const SizedBox(
                        height: 18,
                      ),

                      const Text(

                        "Create Account",

                        style: TextStyle(

                          fontSize: 28,

                          fontWeight:
                              FontWeight.bold,
                        ),
                      ),

                      const SizedBox(
                        height: 6,
                      ),

                      Text(

                        "Join SyncForge and collaborate smarter",

                        textAlign:
                            TextAlign.center,

                        style: TextStyle(

                          fontSize: 13,

                          color:
                              Colors.grey.shade500,
                        ),
                      ),

                      const SizedBox(
                        height: 30,
                      ),

                      CustomTextField(

                        controller:
                            fullNameController,

                        label:
                            "Full Name",
                      ),

                      const SizedBox(
                        height: 16,
                      ),

                      CustomTextField(

                        controller:
                            emailController,

                        label: "Email",
                      ),

                      const SizedBox(
                        height: 16,
                      ),

                      CustomTextField(

                        controller:
                            phoneController,

                        label:
                            "Phone Number",
                      ),

                      const SizedBox(
                        height: 16,
                      ),

                      CustomTextField(

                        controller:
                            passwordController,

                        label:
                            "Password",

                        obscure: true,
                      ),

                      const SizedBox(
                        height: 16,
                      ),

                      CustomTextField(

                        controller:
                            confirmPasswordController,

                        label:
                            "Confirm Password",

                        obscure: true,
                      ),

                      const SizedBox(
                        height: 28,
                      ),

                      SizedBox(

                        width:
                            double.infinity,

                        height: 52,

                        child:
                            ElevatedButton(

                          style:
                              ElevatedButton.styleFrom(

                            backgroundColor:
                                Theme.of(context)
                                    .colorScheme
                                    .primary,

                            shape:
                                RoundedRectangleBorder(

                              borderRadius:
                                  BorderRadius.circular(
                                14,
                              ),
                            ),
                          ),

                          onPressed:
                              loading
                                  ? null
                                  : register,

                          child:
                              loading

                                  ? const SizedBox(

                                      height: 22,
                                      width: 22,

                                      child:
                                          CircularProgressIndicator(
                                        strokeWidth:
                                            2,
                                        color:
                                            Colors.white,
                                      ),
                                    )

                                  : const Text(

                                      "Create Account",

                                      style:
                                          TextStyle(

                                        color:
                                            Colors.white,

                                        fontSize:
                                            16,

                                        fontWeight:
                                            FontWeight.w600,
                                      ),
                                    ),
                        ),
                      ),

                      const SizedBox(
                        height: 18,
                      ),

                      Row(

                        mainAxisAlignment:
                            MainAxisAlignment.center,

                        children: [

                          Text(

                            "Already have an account?",

                            style: TextStyle(
                              color:
                                  Colors.grey
                                      .shade600,
                            ),
                          ),

                          TextButton(

                            onPressed: () {
                              Navigator.pop(
                                  context);
                            },

                            child:
                                const Text(

                              "Login",

                              style: TextStyle(
                                fontWeight:
                                    FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}