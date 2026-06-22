package com.syncforge.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor authInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Keep the endpoint clean without any handshake hooks
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
                //.withSockJS(); // Supports web fallbacks smoothly
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Register the Auth Interceptor inside the active stream workflow channel
        registration.interceptors(authInterceptor);
    }
}