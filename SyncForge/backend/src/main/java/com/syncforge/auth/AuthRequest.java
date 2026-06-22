package com.syncforge.auth;

    public record AuthRequest(
            String email,
            String password
    ) {}
