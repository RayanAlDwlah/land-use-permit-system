package com.landuse.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MeDTO {
    private String username;
    private String email;
    private String role;
}