package com.syncforge.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {}