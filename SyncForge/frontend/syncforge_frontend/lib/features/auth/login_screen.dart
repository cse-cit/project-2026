import 'package:flutter/material.dart';

import '../../core/widgets/custom_textfield.dart';

import 'auth_service.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {

  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() =>
      _LoginScreenState();
}

class _LoginScreenState
    extends State<LoginScreen> {

  final emailController =
      TextEditingController();

  final passwordController =
      TextEditingController();

  bool loading = false;

  Future<void> login() async {

    setState(() {
      loading = true;
    });

    bool success =
        await AuthService.login(

      emailController.text.trim(),

      passwordController.text.trim(),
    );

    setState(() {
      loading = false;
    });

    if (success) {

      if (!mounted) return;

      Navigator.pushReplacementNamed(
        context,
        "/projects",
      );

    } else {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        const SnackBar(
          content: Text(
            "Invalid email or password",
          ),
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

                        "SyncForge",

                        style: TextStyle(

                          fontSize: 30,

                          fontWeight:
                              FontWeight.bold,
                        ),
                      ),

                      const SizedBox(
                        height: 6,
                      ),

                      Text(

                        "Realtime Team Collaboration Platform",

                        textAlign:
                            TextAlign.center,

                        style: TextStyle(

                          fontSize: 13,

                          color:
                              Colors.grey.shade500,
                        ),
                      ),

                      const SizedBox(
                        height: 32,
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
                            passwordController,

                        label:
                            "Password",

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
                                  : login,

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

                                      "Login",

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

                            "Don't have an account?",

                            style: TextStyle(
                              color:
                                  Colors.grey
                                      .shade600,
                            ),
                          ),

                          TextButton(

                            onPressed: () {

                              Navigator.push(

                                context,

                                MaterialPageRoute(

                                  builder: (_) =>
                                      const RegisterScreen(),
                                ),
                              );
                            },

                            child:
                                const Text(

                              "Register",

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