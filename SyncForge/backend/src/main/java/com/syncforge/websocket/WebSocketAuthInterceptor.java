package com.syncforge.websocket;

import com.syncforge.auth.JwtService;
import com.syncforge.user.User;
import com.syncforge.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = 
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Intercept only when the client tries to initialize a STOMP connection
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            
            // Extract the 'Authorization' header your Flutter code is passing
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtService.extractUsername(token);
                    User user = userRepository.findByEmail(email).orElse(null);

                    if (user != null) {
                        // Bind the authenticated user directly into the active socket session attributes
                        accessor.getSessionAttributes().put("user", user);
                        log.info("✅ WebSocket authenticated successfully for user: {}", email);
                    } else {
                        log.error("❌ WebSocket auth failed: User not found.");
                        return null; // Reject connection
                    }
                } catch (Exception e) {
                    log.error("❌ WebSocket JWT validation crash: {}", e.getMessage());
                    return null; // Reject connection
                }
            } else {
                log.error("❌ WebSocket access denied: Missing or invalid Authorization header format.");
                return null; // Reject connection
            }
        }
        return message;
    }
}