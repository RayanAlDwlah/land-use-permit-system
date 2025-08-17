package com.landuse.app.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO for exposing basic user information.
 */
@Getter
@Setter
public class UserDTO {
    private String username;
    private String email;
    private String role;
}