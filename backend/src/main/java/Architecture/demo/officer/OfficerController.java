package Architecture.demo.officer;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.Role;
import Architecture.demo.auth.UserRepository;
import Architecture.demo.auth.dto.DriverTokenRequest;
import Architecture.demo.auth.dto.LoginResponse;
import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineResponse;
import Architecture.demo.fines.FineService;
import Architecture.demo.notifications.Notification;
import Architecture.demo.notifications.NotificationRepository;
import Architecture.demo.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/officer")
public class OfficerController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FineService fineService;
    private final NotificationRepository notificationRepository;

    public OfficerController(UserRepository userRepository,
                             PasswordEncoder passwordEncoder,
                             JwtService jwtService,
                             FineService fineService,
                             NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.fineService = fineService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Issues a traffic fine.
     * 1. Creates (or finds) a driver account keyed by phone number.
     * 2. Persists a Fine record in the database.
     * 3. Generates a JWT driver token embedding all fine details.
     * The officer hands this token to the driver who uses it to log in and pay.
     */
    @PostMapping("/driver-token")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueFineResponse issueFine(@AuthenticationPrincipal AppUser officer,
                                       @RequestBody DriverTokenRequest request) {
        requireOfficerRole(officer);
        validateRequest(request);

        // Create or find driver account using phone as unique key
        String safePhone = request.phoneNumber().replaceAll("[^0-9]", "").trim();
        String driverUsername = "driver:" + safePhone;
        AppUser driver = userRepository.findByUsername(driverUsername)
                .orElseGet(() -> userRepository.save(new AppUser(
                        driverUsername,
                        passwordEncoder.encode(UUID.randomUUID().toString()),
                        request.driverName().trim(),
                        request.phoneNumber().trim(),
                        Role.DRIVER
                )));

        // Persist Fine in database
        Fine fine = fineService.createFine(driver, officer, request);

        // Build JWT claims — all fine details embedded so driver can view without extra DB call
        Map<String, Object> claims = Map.ofEntries(
                Map.entry("role", Role.DRIVER.name()),
                Map.entry("fineId", fine.getId()),
                Map.entry("officerId", officer.getId()),
                Map.entry("officerUsername", officer.getUsername()),
                Map.entry("driverName", fine.getDriverName()),
                Map.entry("phoneNumber", fine.getDriverPhone()),
                Map.entry("referenceNumber", fine.getReferenceNumber()),
                Map.entry("categoryIdentifier", fine.getCategoryIdentifier()),
                Map.entry("wrongDid", fine.getCategoryName() != null ? fine.getCategoryName() : fine.getCategoryIdentifier()),
                Map.entry("amount", String.valueOf(fine.getAmount())),
                Map.entry("vehicleNumber", fine.getVehicleNumber() != null ? fine.getVehicleNumber() : ""),
                Map.entry("licenseNumber", fine.getDriverLicense() != null ? fine.getDriverLicense() : ""),
                Map.entry("district", fine.getDistrict() != null ? fine.getDistrict() : "")
        );

        String token = jwtService.generateToken(driver.getUsername(), claims);
        LoginResponse loginResponse = new LoginResponse(
                token, "Bearer", driver.getUsername(), driver.getRole(), jwtService.getExpirationSeconds()
        );

        return new IssueFineResponse(loginResponse, FineResponse.from(fine));
    }

    @GetMapping("/fines")
    public List<FineResponse> getMyFines(@AuthenticationPrincipal AppUser officer) {
        return fineService.getFinesForOfficer(officer).stream()
                .map(FineResponse::from)
                .toList();
    }

    @GetMapping("/notifications")
    public List<Notification> getMyNotifications(@AuthenticationPrincipal AppUser officer) {
        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(officer);
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markNotificationRead(@PathVariable Long id,
                                             @AuthenticationPrincipal AppUser officer) {
        return notificationRepository.findById(id)
                .filter(n -> n.getRecipient().getId().equals(officer.getId()))
                .map(n -> {
                    n.setRead(true);
                    return notificationRepository.save(n);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "notification not found"));
    }

    private void requireOfficerRole(AppUser officer) {
        if (officer == null || (officer.getRole() != Role.OFFICER && officer.getRole() != Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "officer access required");
        }
    }

    private void validateRequest(DriverTokenRequest request) {
        if (request == null || isBlank(request.driverName()) || isBlank(request.phoneNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverName and phoneNumber are required");
        }
        if (isBlank(request.wrongDid()) && isBlank(request.categoryIdentifier())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "violation (wrongDid or categoryIdentifier) is required");
        }
        if (isBlank(request.amount())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount is required");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
