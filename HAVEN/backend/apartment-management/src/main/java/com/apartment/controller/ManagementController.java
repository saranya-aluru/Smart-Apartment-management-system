
package com.apartment.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ManagementController {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public ManagementController(
            JdbcTemplate jdbc,
            PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    // COMMON HELPERS

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(
            HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(
            HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(
            HttpStatus.CONFLICT, message);
    }

    private String required(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null || value.toString().isBlank()) {
            throw bad(key + " is required");
        }
        return value.toString().trim();
    }

    private long requiredLong(Map<String, Object> body, String key) {
        try {
            return Long.parseLong(required(body, key));
        } catch (NumberFormatException ex) {
            throw bad(key + " must be a valid number");
        }
    }

    private long validId(long id) {
        if (id <= 0) throw bad("ID must be positive");
        return id;
    }

    private Map<String, Object> one(
            String sql, Object... args) {
        List<Map<String, Object>> result =
            jdbc.queryForList(sql, args);

        if (result.isEmpty()) {
            throw notFound("Record not found");
        }
        return result.get(0);
    }

    private long currentResidentId(Authentication auth) {
        List<Long> result = jdbc.query(
            "SELECT r.resident_id FROM residents r " +
            "JOIN users u ON u.user_id=r.user_id " +
            "WHERE u.username=? AND r.resident_status='ACTIVE'",
            (rs, rowNum) -> rs.getLong(1),
            auth.getName()
        );

        if (result.isEmpty()) {
            throw notFound("Resident profile not found");
        }
        return result.get(0);
    }

    private long currentStaffId(Authentication auth) {
        List<Long> result = jdbc.query(
            "SELECT s.staff_id FROM staff s " +
            "JOIN users u ON u.user_id=s.user_id " +
            "WHERE u.username=? AND s.staff_status='ACTIVE'",
            (rs, rowNum) -> rs.getLong(1),
            auth.getName()
        );

        if (result.isEmpty()) {
            throw notFound("Staff profile not found");
        }
        return result.get(0);
    }

    private void validateEnum(
            String value, String field, String... allowed) {
        for (String item : allowed) {
            if (item.equals(value)) return;
        }
        throw bad("Invalid " + field +
            ". Allowed: " + String.join(", ", allowed));
    }

    // 1. ADMIN DASHBOARD

    @GetMapping("/admin/dashboard")
    public Map<String, Object> adminDashboard() {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("activeResidents",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM residents " +
                "WHERE resident_status='ACTIVE'",
                Integer.class));

        result.put("activeStaff",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM staff " +
                "WHERE staff_status='ACTIVE'",
                Integer.class));

        result.put("totalApartments",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM apartments",
                Integer.class));

        result.put("vacantApartments",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM apartments " +
                "WHERE status='VACANT'",
                Integer.class));

        result.put("openMaintenance",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM maintenance_requests " +
                "WHERE status IN ('PENDING','IN_PROGRESS')",
                Integer.class));

        result.put("pendingServiceRequests",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM service_requests " +
                "WHERE status='PENDING'",
                Integer.class));

        result.put("upcomingEvents",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM community_events " +
                "WHERE status='UPCOMING' AND event_date>=CURRENT_DATE",
                Integer.class));

        result.put("pendingClubhouseBookings",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM clubhouse_bookings " +
                "WHERE booking_status='PENDING'",
                Integer.class));

        return result;
    }

    // 2. RESIDENT DASHBOARD

    @GetMapping("/resident/dashboard")
    public Map<String, Object> residentDashboard(
            Authentication auth) {

        long residentId = currentResidentId(auth);
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("profile", one(
            "SELECT r.*,a.apartment_number,a.building,a.floor " +
            "FROM residents r JOIN apartments a " +
            "ON a.apartment_id=r.apartment_id " +
            "WHERE r.resident_id=?",
            residentId));

        result.put("openMaintenance",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM maintenance_requests " +
                "WHERE resident_id=? AND status IN ('PENDING','IN_PROGRESS')",
                Integer.class, residentId));

        result.put("serviceRequests",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM service_requests WHERE resident_id=?",
                Integer.class, residentId));

        result.put("clubhouseBookings",
            jdbc.queryForObject(
                "SELECT COUNT(*) FROM clubhouse_bookings WHERE resident_id=?",
                Integer.class, residentId));

        return result;
    }

    // 3. APARTMENTS

    @GetMapping("/apartments")
    public List<Map<String, Object>> listApartments(
            @RequestParam(required = false) String status) {

        if (status == null || status.isBlank()) {
            return jdbc.queryForList(
                "SELECT * FROM apartments " +
                "ORDER BY building,floor,apartment_number");
        }

        validateEnum(status, "status",
            "VACANT", "OCCUPIED", "MAINTENANCE");

        return jdbc.queryForList(
            "SELECT * FROM apartments WHERE status=? " +
            "ORDER BY building,floor,apartment_number",
            status);
    }

    @PostMapping("/admin/apartments")
    public Map<String, Object> createApartment(
            @RequestBody Map<String, Object> body) {

        String status =
            body.getOrDefault("status", "VACANT").toString();

        validateEnum(status, "status",
            "VACANT", "OCCUPIED", "MAINTENANCE");

        jdbc.update(
            "INSERT INTO apartments " +
            "(apartment_number,building,floor,bedrooms,area_sqft,status) " +
            "VALUES(?,?,?,?,?,?)",
            required(body, "apartmentNumber"),
            required(body, "building"),
            body.get("floor"),
            body.get("bedrooms"),
            body.get("areaSqft"),
            status
        );

        return one(
            "SELECT * FROM apartments WHERE apartment_id=LAST_INSERT_ID()");
    }

    @PutMapping("/admin/apartments/{id}")
    public Map<String, Object> updateApartment(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        jdbc.update(
            "UPDATE apartments SET " +
            "apartment_number=COALESCE(?,apartment_number), " +
            "building=COALESCE(?,building), " +
            "floor=COALESCE(?,floor), " +
            "bedrooms=COALESCE(?,bedrooms), " +
            "area_sqft=COALESCE(?,area_sqft) " +
            "WHERE apartment_id=?",
            body.get("apartmentNumber"),
            body.get("building"),
            body.get("floor"),
            body.get("bedrooms"),
            body.get("areaSqft"),
            validId(id)
        );

        return one(
            "SELECT * FROM apartments WHERE apartment_id=?", id);
    }

    @PutMapping("/admin/apartments/{id}/status")
    public Map<String, Object> updateApartmentStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "VACANT", "OCCUPIED", "MAINTENANCE");

        jdbc.update(
            "UPDATE apartments SET status=? WHERE apartment_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM apartments WHERE apartment_id=?", id);
    }

    // 4. RESIDENT MANAGEMENT

    @GetMapping("/admin/residents")
    public List<Map<String, Object>> listResidents() {
        return jdbc.queryForList(
            "SELECT r.*,u.username,u.email," +
            "a.apartment_number,a.building " +
            "FROM residents r " +
            "JOIN users u ON u.user_id=r.user_id " +
            "JOIN apartments a ON a.apartment_id=r.apartment_id " +
            "ORDER BY r.resident_id DESC");
    }

    @GetMapping("/resident/profile")
    public Map<String, Object> residentProfile(
            Authentication auth) {

        return one(
            "SELECT r.*,u.username,u.email," +
            "a.apartment_number,a.building,a.floor," +
            "a.bedrooms,a.area_sqft " +
            "FROM residents r " +
            "JOIN users u ON u.user_id=r.user_id " +
            "JOIN apartments a ON a.apartment_id=r.apartment_id " +
            "WHERE r.resident_id=?",
            currentResidentId(auth));
    }

    // 5. STAFF MANAGEMENT

    @GetMapping("/admin/staff")
    public List<Map<String, Object>> listStaff() {
        return jdbc.queryForList(
            "SELECT s.*,u.username,u.email " +
            "FROM staff s JOIN users u ON u.user_id=s.user_id " +
            "ORDER BY s.staff_id DESC");
    }

    @PostMapping("/admin/staff")
    @Transactional
    public Map<String, Object> createStaff(
            @RequestBody Map<String, Object> body) {

        String username = required(body, "username");
        String email = required(body, "email");
        String password = required(body, "password");
        String fullName = required(body, "fullName");

        if (password.length() < 8) {
            throw bad("Password must contain at least 8 characters");
        }

        Integer exists = jdbc.queryForObject(
            "SELECT COUNT(*) FROM users WHERE username=? OR email=?",
            Integer.class, username, email);

        if (exists != null && exists > 0) {
            throw conflict("Username or email already exists");
        }

        jdbc.update(
            "INSERT INTO users(username,email,password,role,account_status) " +
            "VALUES(?,?,?,'STAFF','ACTIVE')",
            username, email, passwordEncoder.encode(password));

        Long userId = jdbc.queryForObject(
            "SELECT user_id FROM users WHERE username=?",
            Long.class, username);

        jdbc.update(
            "INSERT INTO staff " +
            "(user_id,full_name,department,phone,staff_status) " +
            "VALUES(?,?,?,?, 'ACTIVE')",
            userId,
            fullName,
            body.get("department"),
            body.get("phone"));

        return one(
            "SELECT s.*,u.username,u.email " +
            "FROM staff s JOIN users u ON u.user_id=s.user_id " +
            "WHERE s.user_id=?", userId);
    }

    @PutMapping("/admin/staff/{id}/status")
    public Map<String, Object> updateStaffStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status", "ACTIVE", "INACTIVE");

        jdbc.update(
            "UPDATE staff SET staff_status=? WHERE staff_id=?",
            status, validId(id));

        return one("SELECT * FROM staff WHERE staff_id=?", id);
    }

    // 6. MAINTENANCE REQUESTS

    @GetMapping("/admin/maintenance")
    public List<Map<String, Object>> allMaintenance() {
        return jdbc.queryForList(
            "SELECT m.*,r.full_name AS resident_name," +
            "s.full_name AS staff_name " +
            "FROM maintenance_requests m " +
            "JOIN residents r ON r.resident_id=m.resident_id " +
            "LEFT JOIN staff s ON s.staff_id=m.assigned_staff_id " +
            "ORDER BY m.request_date DESC");
    }

    @GetMapping("/resident/maintenance")
    public List<Map<String, Object>> residentMaintenance(
            Authentication auth) {

        return jdbc.queryForList(
            "SELECT * FROM maintenance_requests " +
            "WHERE resident_id=? ORDER BY request_date DESC",
            currentResidentId(auth));
    }

    @PostMapping("/resident/maintenance")
    public Map<String, Object> createMaintenance(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String category = required(body, "category");
        String priority =
            body.getOrDefault("priority", "MEDIUM").toString();

        validateEnum(category, "category",
            "PLUMBING", "ELECTRICAL", "CLEANING",
            "SECURITY", "OTHER");

        validateEnum(priority, "priority",
            "LOW", "MEDIUM", "HIGH", "URGENT");

        jdbc.update(
            "INSERT INTO maintenance_requests " +
            "(resident_id,category,description,priority,status) " +
            "VALUES(?,?,?,?,'PENDING')",
            currentResidentId(auth),
            category,
            required(body, "description"),
            priority);

        return one(
            "SELECT * FROM maintenance_requests WHERE request_id=LAST_INSERT_ID()");
    }

    @PutMapping("/admin/maintenance/{id}/assign")
    public Map<String, Object> assignMaintenance(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        long staffId = requiredLong(body, "staffId");

        one(
            "SELECT staff_id FROM staff " +
            "WHERE staff_id=? AND staff_status='ACTIVE'",
            staffId);

        jdbc.update(
            "UPDATE maintenance_requests " +
            "SET assigned_staff_id=?,status='IN_PROGRESS' " +
            "WHERE request_id=?",
            staffId, validId(id));

        return one(
            "SELECT * FROM maintenance_requests WHERE request_id=?", id);
    }

    @GetMapping("/staff/maintenance")
    public List<Map<String, Object>> staffMaintenance(
            Authentication auth) {

        long staffId = currentStaffId(auth);
        return jdbc.queryForList(
            "SELECT m.*, r.full_name AS resident_name, r.phone AS resident_phone, " +
            "a.apartment_number, a.building " +
            "FROM maintenance_requests m " +
            "JOIN residents r ON r.resident_id=m.resident_id " +
            "JOIN apartments a ON a.apartment_id=r.apartment_id " +
            "WHERE m.assigned_staff_id=? " +
            "ORDER BY m.request_date DESC",
            staffId);
    }

    @GetMapping("/staff/profile")
    public Map<String, Object> staffProfile(
            Authentication auth) {

        long staffId = currentStaffId(auth);
        return one(
            "SELECT s.*, u.username, u.email " +
            "FROM staff s JOIN users u ON u.user_id=s.user_id " +
            "WHERE s.staff_id=?",
            staffId);
    }

    @PutMapping("/staff/maintenance/{id}/status")
    public Map<String, Object> updateMaintenanceStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        long staffId = currentStaffId(auth);
        String status = required(body, "status");

        validateEnum(status, "status",
            "IN_PROGRESS", "COMPLETED");

        int changed = jdbc.update(
            "UPDATE maintenance_requests SET status=?, " +
            "completed_date=CASE WHEN ?='COMPLETED' THEN NOW() ELSE NULL END " +
            "WHERE request_id=? AND assigned_staff_id=?",
            status, status, validId(id), staffId);

        if (changed == 0) {
            throw notFound("Assigned maintenance request not found");
        }

        return one(
            "SELECT * FROM maintenance_requests WHERE request_id=?", id);
    }

    // 7. COMMUNITY SERVICES

    @GetMapping("/services")
    public List<Map<String, Object>> listServices() {
        return jdbc.queryForList(
            "SELECT * FROM community_services ORDER BY service_name");
    }

    @PostMapping("/admin/services")
    public Map<String, Object> createService(
            @RequestBody Map<String, Object> body) {

        BigDecimal charge;

        try {
            charge = new BigDecimal(
                body.getOrDefault("serviceCharge", "0").toString());
        } catch (NumberFormatException ex) {
            throw bad("Invalid service charge");
        }

        if (charge.signum() < 0) {
            throw bad("Service charge cannot be negative");
        }

        jdbc.update(
            "INSERT INTO community_services " +
            "(service_name,description,service_charge,availability_status) " +
            "VALUES(?,?,?,'AVAILABLE')",
            required(body, "serviceName"),
            body.get("description"),
            charge);

        return one(
            "SELECT * FROM community_services WHERE service_id=LAST_INSERT_ID()");
    }

    @PutMapping("/admin/services/{id}/availability")
    public Map<String, Object> updateServiceAvailability(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "availabilityStatus");
        validateEnum(status, "availabilityStatus",
            "AVAILABLE", "UNAVAILABLE");

        jdbc.update(
            "UPDATE community_services SET availability_status=? " +
            "WHERE service_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM community_services WHERE service_id=?", id);
    }

    @PostMapping("/resident/service-requests")
    public Map<String, Object> requestService(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        long serviceId = requiredLong(body, "serviceId");

        one(
            "SELECT service_id FROM community_services " +
            "WHERE service_id=? AND availability_status='AVAILABLE'",
            serviceId);

        LocalDate bookingDate;

        try {
            bookingDate = LocalDate.parse(required(body, "bookingDate"));
        } catch (Exception ex) {
            throw bad("bookingDate must use YYYY-MM-DD");
        }

        jdbc.update(
            "INSERT INTO service_requests " +
            "(resident_id,service_id,booking_date,description,status) " +
            "VALUES(?,?,?,?,'PENDING')",
            currentResidentId(auth),
            serviceId,
            bookingDate,
            body.get("description"));

        return one(
            "SELECT * FROM service_requests WHERE request_id=LAST_INSERT_ID()");
    }

    @GetMapping("/resident/service-requests")
    public List<Map<String, Object>> residentServiceRequests(
            Authentication auth) {

        return jdbc.queryForList(
            "SELECT sr.*,cs.service_name,cs.service_charge " +
            "FROM service_requests sr " +
            "JOIN community_services cs ON cs.service_id=sr.service_id " +
            "WHERE sr.resident_id=? ORDER BY sr.created_at DESC",
            currentResidentId(auth));
    }

    @GetMapping("/admin/service-requests")
    public List<Map<String, Object>> allServiceRequests() {
        return jdbc.queryForList(
            "SELECT sr.*,r.full_name AS resident_name,cs.service_name " +
            "FROM service_requests sr " +
            "JOIN residents r ON r.resident_id=sr.resident_id " +
            "JOIN community_services cs ON cs.service_id=sr.service_id " +
            "ORDER BY sr.created_at DESC");
    }

    @PutMapping("/admin/service-requests/{id}/status")
    public Map<String, Object> updateServiceRequest(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "PENDING", "APPROVED", "COMPLETED", "CANCELLED");

        jdbc.update(
            "UPDATE service_requests SET status=? WHERE request_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM service_requests WHERE request_id=?", id);
    }

    // 8. COMMUNITY EVENTS

    @GetMapping("/events")
    public List<Map<String, Object>> listEvents() {
        return jdbc.queryForList(
            "SELECT e.*,u.username AS created_by_username " +
            "FROM community_events e " +
            "JOIN users u ON u.user_id=e.created_by " +
            "WHERE e.status='UPCOMING' " +
            "ORDER BY e.event_date,e.start_time");
    }

    @PostMapping("/admin/events")
    public Map<String, Object> createEvent(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        LocalDate date;
        LocalTime start;
        LocalTime end;

        try {
            date = LocalDate.parse(required(body, "eventDate"));
            start = LocalTime.parse(required(body, "startTime"));
            end = LocalTime.parse(required(body, "endTime"));
        } catch (Exception ex) {
            throw bad("Use eventDate YYYY-MM-DD and times HH:mm");
        }

        if (!end.isAfter(start)) {
            throw bad("Event endTime must be after startTime");
        }

        Long creatorId = jdbc.queryForObject(
            "SELECT user_id FROM users WHERE username=?",
            Long.class, auth.getName());

        jdbc.update(
            "INSERT INTO community_events " +
            "(title,description,event_date,start_time,end_time," +
            "venue,poster_url,created_by,status) " +
            "VALUES(?,?,?,?,?,?,?,?, 'UPCOMING')",
            required(body, "title"),
            body.get("description"),
            date,
            start,
            end,
            body.get("venue"),
            body.get("posterUrl"),
            creatorId);

        return one(
            "SELECT * FROM community_events WHERE event_id=LAST_INSERT_ID()");
    }

    @PostMapping("/resident/events/{eventId}/register")
    public Map<String, Object> registerEvent(
            @PathVariable long eventId,
            Authentication auth) {

        one(
            "SELECT event_id FROM community_events " +
            "WHERE event_id=? AND status='UPCOMING' " +
            "AND event_date>=CURRENT_DATE",
            validId(eventId));

        long residentId = currentResidentId(auth);

        Integer existing = jdbc.queryForObject(
            "SELECT COUNT(*) FROM event_registrations " +
            "WHERE event_id=? AND resident_id=?",
            Integer.class, eventId, residentId);

        if (existing != null && existing > 0) {
            jdbc.update(
                "UPDATE event_registrations " +
                "SET status='REGISTERED',registration_date=CURRENT_TIMESTAMP " +
                "WHERE event_id=? AND resident_id=?",
                eventId, residentId);
        } else {
            jdbc.update(
                "INSERT INTO event_registrations " +
                "(event_id,resident_id,status) VALUES(?,?,'REGISTERED')",
                eventId, residentId);
        }

        return one(
            "SELECT * FROM event_registrations " +
            "WHERE event_id=? AND resident_id=?",
            eventId, residentId);
    }

    @GetMapping("/resident/event-registrations")
    public List<Map<String, Object>> residentEventRegistrations(
            Authentication auth) {

        return jdbc.queryForList(
            "SELECT er.*,e.title,e.event_date,e.start_time,e.venue " +
            "FROM event_registrations er " +
            "JOIN community_events e ON e.event_id=er.event_id " +
            "WHERE er.resident_id=? ORDER BY e.event_date",
            currentResidentId(auth));
    }

    @GetMapping("/admin/event-registrations/{eventId}")
    public List<Map<String, Object>> eventRegistrations(
            @PathVariable long eventId) {

        return jdbc.queryForList(
            "SELECT er.*,r.full_name,r.phone,u.email,a.apartment_number " +
            "FROM event_registrations er " +
            "JOIN residents r ON r.resident_id=er.resident_id " +
            "JOIN users u ON u.user_id=r.user_id " +
            "JOIN apartments a ON a.apartment_id=r.apartment_id " +
            "WHERE er.event_id=? ORDER BY er.registration_date",
            validId(eventId));
    }

    @PutMapping("/admin/events/{id}/status")
    public Map<String, Object> updateEventStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "UPCOMING", "COMPLETED", "CANCELLED");

        jdbc.update(
            "UPDATE community_events SET status=? WHERE event_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM community_events WHERE event_id=?", id);
    }

    // 9. ANNOUNCEMENTS

    @GetMapping("/announcements")
    public List<Map<String, Object>> publishedAnnouncements() {
        return jdbc.queryForList(
            "SELECT a.*,u.username AS author " +
            "FROM announcements a " +
            "JOIN users u ON u.user_id=a.created_by " +
            "WHERE a.status='PUBLISHED' " +
            "AND (a.expiry_date IS NULL OR a.expiry_date>=NOW()) " +
            "ORDER BY a.published_date DESC");
    }

    @GetMapping("/admin/announcements")
    public List<Map<String, Object>> allAnnouncements() {
        return jdbc.queryForList(
            "SELECT a.*,u.username AS author " +
            "FROM announcements a " +
            "JOIN users u ON u.user_id=a.created_by " +
            "ORDER BY a.published_date DESC");
    }

    @PostMapping("/admin/announcements")
    public Map<String, Object> createAnnouncement(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String category =
            body.getOrDefault("category", "GENERAL").toString();

        String status =
            body.getOrDefault("status", "PUBLISHED").toString();

        validateEnum(category, "category",
            "GENERAL", "MAINTENANCE", "SECURITY",
            "PAYMENT", "EMERGENCY");

        validateEnum(status, "status",
            "DRAFT", "PUBLISHED", "ARCHIVED");

        Long creatorId = jdbc.queryForObject(
            "SELECT user_id FROM users WHERE username=?",
            Long.class, auth.getName());

        jdbc.update(
            "INSERT INTO announcements " +
            "(title,description,category,created_by,status) " +
            "VALUES(?,?,?,?,?)",
            required(body, "title"),
            required(body, "description"),
            category,
            creatorId,
            status);

        return one(
            "SELECT * FROM announcements WHERE announcement_id=LAST_INSERT_ID()");
    }

    @PutMapping("/admin/announcements/{id}/status")
    public Map<String, Object> updateAnnouncementStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "DRAFT", "PUBLISHED", "ARCHIVED");

        jdbc.update(
            "UPDATE announcements SET status=? WHERE announcement_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM announcements WHERE announcement_id=?", id);
    }

    // 10. CLUBHOUSE FACILITIES

    @GetMapping("/clubhouse/facilities")
    public List<Map<String, Object>> listClubhouseFacilities() {
        return jdbc.queryForList(
            "SELECT * FROM clubhouse_facilities ORDER BY name");
    }

    @PostMapping("/admin/clubhouse/facilities")
    public Map<String, Object> createClubhouseFacility(
            @RequestBody Map<String, Object> body) {

        int capacity;
        BigDecimal charge;

        try {
            capacity = Integer.parseInt(required(body, "capacity"));
            charge = new BigDecimal(
                body.getOrDefault("hourlyCharge", "0").toString());
        } catch (Exception ex) {
            throw bad("capacity and hourlyCharge must be valid numbers");
        }

        if (capacity <= 0 || charge.signum() < 0) {
            throw bad("Capacity must be positive and charge cannot be negative");
        }

        jdbc.update(
            "INSERT INTO clubhouse_facilities " +
            "(name,description,capacity,location,hourly_charge," +
            "opening_time,closing_time,status) " +
            "VALUES(?,?,?,?,?,?,?,'AVAILABLE')",
            required(body, "name"),
            body.get("description"),
            capacity,
            body.get("location"),
            charge,
            body.get("openingTime"),
            body.get("closingTime"));

        return one(
            "SELECT * FROM clubhouse_facilities WHERE clubhouse_id=LAST_INSERT_ID()");
    }

    @PutMapping("/admin/clubhouse/facilities/{id}/status")
    public Map<String, Object> updateFacilityStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "AVAILABLE", "UNAVAILABLE");

        jdbc.update(
            "UPDATE clubhouse_facilities SET status=? WHERE clubhouse_id=?",
            status, validId(id));

        return one(
            "SELECT * FROM clubhouse_facilities WHERE clubhouse_id=?", id);
    }

    // 11. CLUBHOUSE BOOKINGS

    @PostMapping("/resident/clubhouse/bookings")
    @Transactional
    public Map<String, Object> createClubhouseBooking(
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        long facilityId = requiredLong(body, "clubhouseId");

        LocalDate date;
        LocalTime start;
        LocalTime end;
        int guests;

        try {
            date = LocalDate.parse(required(body, "bookingDate"));
            start = LocalTime.parse(required(body, "startTime"));
            end = LocalTime.parse(required(body, "endTime"));
            guests = Integer.parseInt(required(body, "guestCount"));
        } catch (Exception ex) {
            throw bad("Use bookingDate YYYY-MM-DD, times HH:mm and numeric guestCount");
        }

        if (!end.isAfter(start)) {
            throw bad("Booking endTime must be after startTime");
        }

        if (guests <= 0) {
            throw bad("guestCount must be positive");
        }

        Map<String, Object> facility = one(
            "SELECT * FROM clubhouse_facilities " +
            "WHERE clubhouse_id=? AND status='AVAILABLE' FOR UPDATE",
            facilityId);

        int capacity =
            ((Number) facility.get("capacity")).intValue();

        if (guests > capacity) {
            throw bad("Guest count exceeds facility capacity");
        }

        LocalTime opening =
            facility.get("opening_time") == null ? null :
            LocalTime.parse(facility.get("opening_time").toString());

        LocalTime closing =
            facility.get("closing_time") == null ? null :
            LocalTime.parse(facility.get("closing_time").toString());

        if (opening != null && start.isBefore(opening)) {
            throw bad("Booking starts before opening time");
        }

        if (closing != null && end.isAfter(closing)) {
            throw bad("Booking ends after closing time");
        }

        Integer overlaps = jdbc.queryForObject(
            "SELECT COUNT(*) FROM clubhouse_bookings " +
            "WHERE clubhouse_id=? AND booking_date=? " +
            "AND booking_status IN ('PENDING','APPROVED') " +
            "AND start_time < ? AND end_time > ?",
            Integer.class, facilityId, date, end, start);

        if (overlaps != null && overlaps > 0) {
            throw conflict(
                "This facility is already booked for the selected time");
        }

        BigDecimal hourlyCharge =
            new BigDecimal(facility.get("hourly_charge").toString());

        long minutes =
            java.time.Duration.between(start, end).toMinutes();

        BigDecimal amount = hourlyCharge
            .multiply(BigDecimal.valueOf(minutes))
            .divide(
                BigDecimal.valueOf(60),
                2,
                java.math.RoundingMode.HALF_UP);

        jdbc.update(
            "INSERT INTO clubhouse_bookings " +
            "(resident_id,clubhouse_id,booking_date,start_time,end_time," +
            "purpose,guest_count,booking_status,booking_charge) " +
            "VALUES(?,?,?,?,?,?,?,'PENDING',?)",
            currentResidentId(auth),
            facilityId,
            date,
            start,
            end,
            body.get("purpose"),
            guests,
            amount);

        return one(
            "SELECT * FROM clubhouse_bookings WHERE booking_id=LAST_INSERT_ID()");
    }

    @GetMapping("/resident/clubhouse/bookings")
    public List<Map<String, Object>> residentClubhouseBookings(
            Authentication auth) {

        return jdbc.queryForList(
            "SELECT b.*,f.name AS facility_name,f.location " +
            "FROM clubhouse_bookings b " +
            "JOIN clubhouse_facilities f " +
            "ON f.clubhouse_id=b.clubhouse_id " +
            "WHERE b.resident_id=? " +
            "ORDER BY b.booking_date DESC,b.start_time DESC",
            currentResidentId(auth));
    }

    @GetMapping("/admin/clubhouse/bookings")
    public List<Map<String, Object>> allClubhouseBookings() {
        return jdbc.queryForList(
            "SELECT b.*,f.name AS facility_name," +
            "r.full_name AS resident_name,a.apartment_number " +
            "FROM clubhouse_bookings b " +
            "JOIN clubhouse_facilities f ON f.clubhouse_id=b.clubhouse_id " +
            "JOIN residents r ON r.resident_id=b.resident_id " +
            "JOIN apartments a ON a.apartment_id=r.apartment_id " +
            "ORDER BY b.booking_date DESC,b.start_time");
    }

    @PutMapping("/admin/clubhouse/bookings/{id}/status")
    public Map<String, Object> updateClubhouseBookingStatus(
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {

        String status = required(body, "status");
        validateEnum(status, "status",
            "APPROVED", "REJECTED", "CANCELLED");

        Map<String, Object> booking = one(
            "SELECT * FROM clubhouse_bookings WHERE booking_id=?",
            validId(id));

        if ("APPROVED".equals(status)) {
            Integer overlaps = jdbc.queryForObject(
                "SELECT COUNT(*) FROM clubhouse_bookings " +
                "WHERE clubhouse_id=? AND booking_date=? " +
                "AND booking_id<>? " +
                "AND booking_status IN ('PENDING','APPROVED') " +
                "AND start_time < ? AND end_time > ?",
                Integer.class,
                booking.get("clubhouse_id"),
                booking.get("booking_date"),
                id,
                booking.get("end_time"),
                booking.get("start_time"));

            if (overlaps != null && overlaps > 0) {
                throw conflict(
                    "Cannot approve: another booking overlaps this time");
            }
        }

        jdbc.update(
            "UPDATE clubhouse_bookings SET booking_status=? WHERE booking_id=?",
            status, id);

        return one(
            "SELECT * FROM clubhouse_bookings WHERE booking_id=?", id);
    }

    @PutMapping("/resident/clubhouse/bookings/{id}/cancel")
    public Map<String, Object> cancelOwnBooking(
            @PathVariable long id,
            Authentication auth) {

        int changed = jdbc.update(
            "UPDATE clubhouse_bookings " +
            "SET booking_status='CANCELLED' " +
            "WHERE booking_id=? AND resident_id=? " +
            "AND booking_status IN ('PENDING','APPROVED')",
            validId(id),
            currentResidentId(auth));

        if (changed == 0) {
            throw notFound(
                "Active booking not found for this resident");
        }

        return one(
            "SELECT * FROM clubhouse_bookings WHERE booking_id=?", id);
    }
}
