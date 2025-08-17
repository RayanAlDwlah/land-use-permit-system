package com.landuse.app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component @Slf4j
public class JwtUtil {

    @Value("${app.jwt.secret}")     private String jwtSecret;
    @Value("${app.jwt.expiration}") private long jwtExpirationMs;

    private SecretKey key() { return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)); }

    public String generateToken(Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        return Jwts.builder()
                .setSubject(principal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (JwtException e) {
            log.warn("JWT parse error: {}", e.getMessage()); return null;
        }
    }

    public boolean validateToken(String token, UserDetails ud) {
        try {
            String username = getUsernameFromToken(token);
            return username != null && username.equals(ud.getUsername()) && !isExpired(token);
        } catch (JwtException e) {
            log.warn("Invalid JWT: {}", e.getMessage()); return false;
        }
    }

    private boolean isExpired(String token) {
        try {
            Date exp = Jwts.parserBuilder().setSigningKey(key()).build()
                    .parseClaimsJws(token).getBody().getExpiration();
            return exp.before(new Date());
        } catch (JwtException e) {
            log.warn("exp parse error: {}", e.getMessage()); return true;
        }
    }
}