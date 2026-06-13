package Architecture.demo.sample;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.Role;
import Architecture.demo.auth.UserRepository;
import Architecture.demo.auth.dto.CreateOfficerRequest;
import Architecture.demo.auth.dto.CreateOfficerResponse;
import Architecture.demo.auth.dto.UpdateOfficerRequest;
import Architecture.demo.auth.dto.UserSummaryResponse;
import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineRepository;
import Architecture.demo.fines.FineResponse;
import Architecture.demo.fines.FineStatus;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FineRepository fineRepository;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           FineRepository fineRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fineRepository = fineRepository;
    }

    @GetMapping("/ping")
    public String ping() {
        return "admin-ok";
    }

    @GetMapping("/officers")
    public List<UserSummaryResponse> getOfficers() {
        return userRepository.findAllByRole(Role.OFFICER).stream()
                .map(u -> new UserSummaryResponse(
                        u.getId(), u.getUsername(), u.getDisplayName(), u.getPhoneNumber(),
                        u.getFullName(), u.getBadgeId(), u.getDistrict(), u.getRole()))
                .toList();
    }

    @GetMapping("/drivers")
    public List<UserSummaryResponse> getDrivers() {
        return userRepository.findAllByRole(Role.DRIVER).stream()
                .map(u -> new UserSummaryResponse(
                        u.getId(), u.getUsername(), u.getDisplayName(), u.getPhoneNumber(),
                        u.getFullName(), u.getBadgeId(), u.getDistrict(), u.getRole()))
                .toList();
    }

    @GetMapping("/fines")
    public List<FineResponse> getAllFines() {
        return fineRepository.findAll().stream()
                .map(FineResponse::from)
                .toList();
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        List<Fine> all = fineRepository.findAll();
        long totalFines = all.size();
        long paidFines = all.stream().filter(f -> f.getStatus() == FineStatus.PAID).count();
        long unpaidFines = totalFines - paidFines;
        double totalRevenue = all.stream()
                .filter(f -> f.getStatus() == FineStatus.PAID)
                .mapToDouble(Fine::getAmount).sum();
        double pendingRevenue = all.stream()
                .filter(f -> f.getStatus() == FineStatus.UNPAID)
                .mapToDouble(Fine::getAmount).sum();

        List<Map<String, Object>> byDistrict = all.stream()
                .filter(f -> f.getDistrict() != null)
                .collect(Collectors.groupingBy(Fine::getDistrict, Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of("district", e.getKey(), "count", e.getValue()))
                .toList();

        List<Map<String, Object>> byCategory = all.stream()
                .filter(f -> f.getCategoryIdentifier() != null)
                .collect(Collectors.groupingBy(Fine::getCategoryIdentifier, Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of("category", e.getKey(), "count", e.getValue()))
                .toList();

        return Map.of(
                "totalFines", totalFines,
                "paidFines", paidFines,
                "unpaidFines", unpaidFines,
                "totalRevenue", totalRevenue,
                "pendingRevenue", pendingRevenue,
                "byDistrict", byDistrict,
                "byCategory", byCategory
        );
    }

    @PostMapping("/officers")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOfficerResponse createOfficer(@RequestBody CreateOfficerRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (isBlank(request.username())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        if (isBlank(request.password())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        if (isBlank(request.fullName())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        if (isBlank(request.badgeId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Badge ID is required");
        if (isBlank(request.phoneNumber())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
        if (isBlank(request.district())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "District is required");

        String username = request.username().trim();
        String temporaryPassword = request.password().trim();

        if (temporaryPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        AppUser officer = new AppUser(
                username,
                passwordEncoder.encode(temporaryPassword),
                request.fullName().trim(),
                request.badgeId().trim(),
                request.phoneNumber().trim(),
                request.district().trim(),
                Role.OFFICER
        );
        userRepository.save(officer);

        return new CreateOfficerResponse(officer.getId(), officer.getUsername(), temporaryPassword);
    }

    @PutMapping("/officers/{username}")
    public CreateOfficerResponse updateOfficer(@PathVariable String username,
                                               @RequestBody UpdateOfficerRequest request) {
        if (isBlank(username) || request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and update data are required");
        }
        AppUser officer = userRepository.findByUsername(username.trim())
                .filter(u -> u.getRole() == Role.OFFICER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));

        String updatedUsername = isBlank(request.newUsername()) ? officer.getUsername() : request.newUsername().trim();
        String updatedPassword = isBlank(request.newPassword()) ? null : request.newPassword().trim();

        if (!updatedUsername.equals(officer.getUsername()) && userRepository.existsByUsername(updatedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
        }
        officer.setUsername(updatedUsername);
        if (!isBlank(request.displayName())) officer.setDisplayName(request.displayName().trim());
        if (!isBlank(request.phoneNumber())) officer.setPhoneNumber(request.phoneNumber().trim());
        if (updatedPassword != null) officer.setPassword(passwordEncoder.encode(updatedPassword));
        userRepository.save(officer);

        return new CreateOfficerResponse(officer.getId(), officer.getUsername(), updatedPassword);
    }

    @DeleteMapping("/officers/{username}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOfficer(@PathVariable String username) {
        AppUser officer = userRepository.findByUsername(username.trim())
                .filter(u -> u.getRole() == Role.OFFICER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));
        userRepository.delete(officer);
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
