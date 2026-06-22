package com.syncforge.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SocketEvent {

    private String type;
    private Object data;
}