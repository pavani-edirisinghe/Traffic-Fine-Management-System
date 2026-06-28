package Architecture.demo.admin;

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

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FineRepository fineRepository;

    public AdminController(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           FineRepository fineRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fineRepository = fineRepository;
    }

    // ── Officers ────────────────────────────────────────────────────────────────

    @GetMapping("/officers")
    public List<UserSummaryResponse> getOfficers() {
        return userRepository.findAllByRole(Role.OFFICER).stream()
                .map(u -> new UserSummaryResponse(u.getId(), u.getUsername(), u.getDisplayName(), u.getPhoneNumber(), u.getRole()))
                .toList();
    }

    @PostMapping("/officers")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOfficerResponse createOfficer(@RequestBody CreateOfficerRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
        }
        String username = request.username().trim();
        String password = request.password().trim();
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password must be at least 8 characters");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
        }
        String displayName = isBlank(request.displayName()) ? username : request.displayName().trim();
        String phone = isBlank(request.phoneNumber()) ? null : request.phoneNumber().trim();
        AppUser officer = new AppUser(username, passwordEncoder.encode(password), displayName, phone, Role.OFFICER);
        userRepository.save(officer);
        return new CreateOfficerResponse(officer.getId(), officer.getUsername(), password);
    }

    @PutMapping("/officers/{username}")
    public CreateOfficerResponse updateOfficer(@PathVariable String username,
                                               @RequestBody UpdateOfficerRequest request) {
        if (isBlank(username) || request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and update body are required");
        }
        AppUser officer = userRepository.findByUsername(username.trim())
                .filter(u -> u.getRole() == Role.OFFICER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));

        if (!isBlank(request.newUsername()) && !request.newUsername().trim().equals(officer.getUsername())) {
            if (userRepository.existsByUsername(request.newUsername().trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
            }
            officer.setUsername(request.newUsername().trim());
        }
        if (!isBlank(request.displayName())) officer.setDisplayName(request.displayName().trim());
        if (!isBlank(request.phoneNumber())) officer.setPhoneNumber(request.phoneNumber().trim());
        if (!isBlank(request.newPassword())) {
            if (request.newPassword().trim().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password must be at least 8 characters");
            }
            officer.setPassword(passwordEncoder.encode(request.newPassword().trim()));
        }
        userRepository.save(officer);
        return new CreateOfficerResponse(officer.getId(), officer.getUsername(), null);
    }

    @DeleteMapping("/officers/{username}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOfficer(@PathVariable String username) {
        AppUser officer = userRepository.findByUsername(username.trim())
                .filter(u -> u.getRole() == Role.OFFICER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));
        userRepository.delete(officer);
    }

    // ── Drivers ─────────────────────────────────────────────────────────────────

    @GetMapping("/drivers")
    public List<UserSummaryResponse> getDrivers() {
        return userRepository.findAllByRole(Role.DRIVER).stream()
                .map(u -> new UserSummaryResponse(u.getId(), u.getUsername(), u.getDisplayName(), u.getPhoneNumber(), u.getRole()))
                .toList();
    }

    // ── Fines ───────────────────────────────────────────────────────────────────

    @GetMapping("/fines")
    public List<FineResponse> getAllFines() {
        return fineRepository.findAll().stream()
                .map(FineResponse::from)
                .toList();
    }

    // ── Analytics ───────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics() {
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

        // District breakdown
        List<DistrictSummary> byDistrict = all.stream()
                .filter(f -> f.getDistrict() != null && !f.getDistrict().isBlank())
                .collect(Collectors.groupingBy(Fine::getDistrict))
                .entrySet().stream()
                .map(e -> {
                    List<Fine> fines = e.getValue();
                    long paid = fines.stream().filter(f -> f.getStatus() == FineStatus.PAID).count();
                    double rev = fines.stream().filter(f -> f.getStatus() == FineStatus.PAID).mapToDouble(Fine::getAmount).sum();
                    double pending = fines.stream().filter(f -> f.getStatus() == FineStatus.UNPAID).mapToDouble(Fine::getAmount).sum();
                    return new DistrictSummary(e.getKey(), fines.size(), paid, fines.size() - paid, rev, pending);
                })
                .sorted(Comparator.comparingDouble(DistrictSummary::totalRevenue).reversed())
                .toList();

        // Category breakdown
        List<CategorySummary> byCategory = all.stream()
                .filter(f -> f.getCategoryIdentifier() != null && !f.getCategoryIdentifier().isBlank())
                .collect(Collectors.groupingBy(Fine::getCategoryIdentifier))
                .entrySet().stream()
                .map(e -> {
                    List<Fine> fines = e.getValue();
                    long paid = fines.stream().filter(f -> f.getStatus() == FineStatus.PAID).count();
                    double rev = fines.stream().filter(f -> f.getStatus() == FineStatus.PAID).mapToDouble(Fine::getAmount).sum();
                    double pending = fines.stream().filter(f -> f.getStatus() == FineStatus.UNPAID).mapToDouble(Fine::getAmount).sum();
                    String catName = fines.stream().map(Fine::getCategoryName).filter(Objects::nonNull).findFirst().orElse(e.getKey());
                    return new CategorySummary(e.getKey(), catName, fines.size(), paid, fines.size() - paid, rev, pending);
                })
                .sorted(Comparator.comparingDouble(CategorySummary::totalRevenue).reversed())
                .toList();

        return new AnalyticsResponse(totalFines, paidFines, unpaidFines, totalRevenue, pendingRevenue, byDistrict, byCategory);
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
