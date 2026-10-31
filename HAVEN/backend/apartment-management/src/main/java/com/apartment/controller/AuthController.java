
package com.apartment.controller;

import com.apartment.dto.AuthResponse;
import com.apartment.dto.LoginRequest;
import com.apartment.dto.RegisterRequest;
import com.apartment.entity.Apartment;
import com.apartment.repository.ApartmentRepository;
import com.apartment.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final ApartmentRepository apartmentRepository;

    public AuthController(
            AuthService authService,
            ApartmentRepository apartmentRepository) {

        this.authService = authService;
        this.apartmentRepository = apartmentRepository;
    }

    // Get all vacant apartments
    @GetMapping("/apartments")
    public ResponseEntity<List<Apartment>> getAvailableApartments() {

        List<Apartment> apartments =
                apartmentRepository.findByStatus(
                        Apartment.ApartmentStatus.VACANT);

        return ResponseEntity.ok(apartments);
    }

    // Register resident
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request));
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }
}
