
package com.apartment.service;

import com.apartment.dto.RegisterRequest;
import com.apartment.entity.Apartment;
import com.apartment.entity.Resident;
import com.apartment.entity.User;
import com.apartment.repository.ApartmentRepository;
import com.apartment.repository.ResidentRepository;
import com.apartment.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            ResidentRepository residentRepository,
            ApartmentRepository apartmentRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.residentRepository = residentRepository;
        this.apartmentRepository = apartmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        // Check duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Lock and check selected apartment
        Apartment apartment = apartmentRepository
                .findByIdForUpdate(request.getApartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Apartment not found"));

        if (apartment.getStatus() != Apartment.ApartmentStatus.VACANT) {
            throw new RuntimeException(
                    "This apartment is no longer available");
        }

        // Create user account
        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.RESIDENT);
        user.setAccountStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Create resident profile
        Resident resident = new Resident();

        resident.setUserId(savedUser.getUserId());
        resident.setApartmentId(apartment.getApartmentId());
        resident.setFullName(request.getFullName());
        resident.setPhone(request.getPhone());
        resident.setMoveInDate(LocalDate.now());
        resident.setResidentStatus(
                Resident.ResidentStatus.ACTIVE);
        resident.setCreatedAt(LocalDateTime.now());

        residentRepository.save(resident);

        // Update apartment status
        apartment.setStatus(
                Apartment.ApartmentStatus.OCCUPIED);

        apartmentRepository.save(apartment);

        return savedUser;
    }

    // Find user by username
    public User findByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }
}
