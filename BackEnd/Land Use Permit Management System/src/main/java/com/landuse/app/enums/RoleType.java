package com.landuse.app.enums;

/**
 * Application roles used with Spring Security.
 * NOTE: Must start with "ROLE_" to work with hasRole/hasAnyRole.
 */
public enum RoleType {
    ROLE_USER,
    ROLE_ADMIN
}