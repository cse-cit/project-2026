package com.syncforge.auth;

public record RegisterRequest(

        String fullName,

        String email,

        String password,

        String phoneNumber

) {}