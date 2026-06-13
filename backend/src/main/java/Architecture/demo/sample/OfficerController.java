package Architecture.demo.sample;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/officer")
public class OfficerController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FineService fineService;
    private final NotificationRepository notificationRepository;

    public OfficerController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                              JwtService jwtService, FineService fineService,
                              NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.fineService = fineService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/ping")
    public String ping() {
        return "officer-ok";
    }

    @PostMapping("/driver-token")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueFineResponse issueDriverToken(@AuthenticationPrincipal AppUser officer,
                                              @RequestBody DriverTokenRequest request) {
        if (officer == null || (officer.getRole() != Role.OFFICER && officer.getRole() != Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "officer access required");
        }
        if (isBlank(request.driverName()) || isBlank(request.phoneNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driverName and phoneNumber are required");
        }

        String safePhone = request.phoneNumber().replaceAll("[^0-9]", "").trim();
        String driverUsername = "driver:" + safePhone;
        AppUser driver = userRepository.findByUsername(driverUsername)
                .orElseGet(() -> userRepository.save(new AppUser(
                        driverUsername,
                        passwordEncoder.encode(UUID.randomUUID().toString()),
                        request.driverName().trim(),
                        null,
                        request.phoneNumber().trim(),
                        null,
                        Role.DRIVER
                )));

        Fine fine = fineService.createFine(driver, officer, request);

        Map<String, Object> claims = Map.ofEntries(
                Map.entry("role", Role.DRIVER.name()),
                Map.entry("fineId", fine.getId()),
                Map.entry("officerId", officer.getId()),
                Map.entry("officerUsername", officer.getUsername()),
                Map.entry("driverName", fine.getDriverName() != null ? fine.getDriverName() : ""),
                Map.entry("phoneNumber", fine.getDriverPhone() != null ? fine.getDriverPhone() : ""),
                Map.entry("referenceNumber", fine.getReferenceNumber()),
                Map.entry("categoryIdentifier", fine.getCategoryIdentifier()),
                Map.entry("wrongDid", fine.getCategoryName() != null ? fine.getCategoryName() : fine.getCategoryIdentifier()),
                Map.entry("amount", String.valueOf(fine.getAmount())),
                Map.entry("vehicleNumber", isBlank(request.vehicleNumber()) ? "" : request.vehicleNumber().trim()),
                Map.entry("licenseNumber", isBlank(request.licenseNumber()) ? "" : request.licenseNumber().trim())
        );
        String token = jwtService.generateToken(driver.getUsername(), claims);
        LoginResponse driverToken = new LoginResponse(token, "Bearer", driver.getUsername(),
                driver.getRole(), jwtService.getExpirationSeconds());

        return new IssueFineResponse(driverToken, FineResponse.from(fine));
    }

    @GetMapping("/fines")
    public List<FineResponse> getOfficerFines(@AuthenticationPrincipal AppUser officer) {
        return fineService.getFinesForOfficer(officer).stream()
                .map(FineResponse::from)
                .toList();
    }

    @GetMapping("/notifications")
    public List<Notification> getNotifications(@AuthenticationPrincipal AppUser officer) {
        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(officer);
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markNotificationRead(@PathVariable Long id,
                                             @AuthenticationPrincipal AppUser officer) {
        Notification n = notificationRepository.findById(id)
                .filter(notif -> notif.getRecipient().getId().equals(officer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "notification not found"));
        n.setRead(true);
        return notificationRepository.save(n);
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
