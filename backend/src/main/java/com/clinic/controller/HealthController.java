package com.clinic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.Instant;
import java.util.Map;

/**
 * Health Check Controller
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Check API health status")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ClinicPro API",
                "timestamp", Instant.now().toString()));
    }

    @GetMapping("/health/db")
    @Operation(summary = "Check database connection status")
    public ResponseEntity<Map<String, Object>> dbHealthCheck() {
        // TODO: Add actual database connection check
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", "PostgreSQL",
                "timestamp", Instant.now().toString()));
    }
}
