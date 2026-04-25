package com.clinic.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "testSecretKeyWithEnoughLengthForHS256Algorithm12345";
    private final long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", expiration);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", expiration * 2);
        jwtTokenProvider.init();
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        UserDetails userDetails = new User("test@clinic.com", "password", new ArrayList<>());
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null);

        String token = jwtTokenProvider.generateToken(authentication);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("test@clinic.com", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void validateToken_ShouldReturnFalseForInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalidToken"));
    }

    @Test
    void validateToken_ShouldReturnFalseForExpiredToken() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", -1000L); // Expired 1 second ago

        UserDetails userDetails = new User("test@clinic.com", "password", new ArrayList<>());
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null);
        String token = jwtTokenProvider.generateToken(authentication);

        assertFalse(jwtTokenProvider.validateToken(token));
    }
}
