package com.apartment.repository;

import com.apartment.entity.Resident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Long> {

    Optional<Resident> findByUserId(Long userId);

    boolean existsByApartmentId(Long apartmentId);
}