package com.syncforge.project;

import com.syncforge.user.Role;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMember {

    private String userId;

    private Role role;
}