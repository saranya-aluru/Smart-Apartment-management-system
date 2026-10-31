package com.apartment.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "residents")
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resident_id")
    private Long residentId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(name = "move_in_date")
    private LocalDate moveInDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "resident_status")
    private ResidentStatus residentStatus = ResidentStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum ResidentStatus {
        ACTIVE, INACTIVE
    }

    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getMoveInDate() { return moveInDate; }
    public void setMoveInDate(LocalDate moveInDate) { this.moveInDate = moveInDate; }

    public ResidentStatus getResidentStatus() { return residentStatus; }
    public void setResidentStatus(ResidentStatus residentStatus) { this.residentStatus = residentStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}