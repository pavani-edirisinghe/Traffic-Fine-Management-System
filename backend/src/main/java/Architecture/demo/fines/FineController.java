package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
<<<<<<< HEAD
import java.util.Map;
=======
import java.util.Optional;
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499

@RestController
@RequestMapping("/api/v1/fines")
public class FineController {

    private final FineRepository fineRepository;
    private final UserRepository userRepository;

    public FineController(
            FineRepository fineRepository,
            UserRepository userRepository
    ) {
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/issue")
<<<<<<< HEAD
    public ResponseEntity<?> issueFine(
            @RequestParam Long driverId,
            @RequestParam Long officerId,
            @RequestParam Double amount,
            @RequestParam String description
    ) {
        AppUser driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Driver not found"
                ));

        AppUser officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Officer not found"
                ));
=======
    public ResponseEntity<?> issueFine(@RequestParam Long driverId,
                                       @RequestParam Long officerId,
                                       @RequestParam Double amount,
                                       @RequestParam String description) {
        AppUser driver = userRepository.findById(driverId).orElseThrow(() -> new RuntimeException("Driver not found"));
        AppUser officer = userRepository.findById(officerId).orElseThrow(() -> new RuntimeException("Officer not found"));
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499

        Fine fine = new Fine();
        fine.setDriver(driver);
        fine.setOfficer(officer);
        fine.setAmount(amount);
        fine.setDescription(description);
        fine.setCategoryName(description);
        fine.setCategoryIdentifier("GENERAL");
        fine.setStatus(FineStatus.UNPAID);

        Fine savedFine = fineRepository.save(fine);

        return ResponseEntity.ok(toFineResponse(savedFine));
    }

    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<?> getFineByReferenceNumber(
            @PathVariable String referenceNumber
    ) {
        Fine fine = fineRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Fine not found"
                ));

        return ResponseEntity.ok(toFineResponse(fine));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Map<String, Object>>> getDriverFines(
            @PathVariable Long driverId
    ) {
        AppUser driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Driver not found"
                ));

        List<Map<String, Object>> fines = fineRepository
                .findAllByDriverOrderByIssuedAtDesc(driver)
                .stream()
                .map(this::toFineResponse)
                .toList();

        return ResponseEntity.ok(fines);
    }

<<<<<<< HEAD
    @GetMapping("/officer/{officerId}")
    public ResponseEntity<List<Map<String, Object>>> getOfficerFines(
            @PathVariable Long officerId
    ) {
        AppUser officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Officer not found"
                ));

        List<Map<String, Object>> fines = fineRepository
                .findAllByOfficerOrderByIssuedAtDesc(officer)
                .stream()
                .map(this::toFineResponse)
                .toList();

        return ResponseEntity.ok(fines);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFines() {
        List<Map<String, Object>> fines = fineRepository
                .findAll()
                .stream()
                .map(this::toFineResponse)
                .toList();

        return ResponseEntity.ok(fines);
    }

    @GetMapping("/officer/me")
    public ResponseEntity<List<Map<String, Object>>> getMyOfficerFines(Authentication authentication) {
        String username = authentication.getName();

        AppUser officer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Officer not found"
                ));

        List<Map<String, Object>> fines = fineRepository
                .findAllByOfficerOrderByIssuedAtDesc(officer)
                .stream()
                .map(this::toFineResponse)
                .toList();

        return ResponseEntity.ok(fines);
    }

    private Map<String, Object> toFineResponse(Fine fine) {
        Map<String, Object> response = new HashMap<>();

        response.put("id", fine.getId());
        response.put("referenceNumber", fine.getReferenceNumber());
        response.put("categoryIdentifier", fine.getCategoryIdentifier());
        response.put("categoryName", fine.getCategoryName());
        response.put("description", fine.getDescription());
        response.put("amount", fine.getAmount());
        response.put("vehicleNumber", fine.getVehicleNumber());
        response.put("driverLicense", fine.getDriverLicense());
        response.put("district", fine.getDistrict());

        response.put(
                "status",
                fine.getStatus() == FineStatus.PAID ? "PAID" : "PENDING"
        );

        response.put("issuedAt", fine.getIssuedAt());
        response.put("paidAt", fine.getPaidAt());
        response.put("datePaid", fine.getPaidAt());

        response.put("driverName", fine.getDriverName());
        response.put("phoneNumber", fine.getDriverPhone());
        response.put("driverPhone", fine.getDriverPhone());

        if (fine.getDriver() != null) {
            response.put("driverId", fine.getDriver().getId());

            if (response.get("driverName") == null) {
                response.put("driverName", fine.getDriver().getFullName());
            }

            if (response.get("phoneNumber") == null) {
                response.put("phoneNumber", fine.getDriver().getPhoneNumber());
                response.put("driverPhone", fine.getDriver().getPhoneNumber());
            }
        }

        if (fine.getOfficer() != null) {
            response.put("officerId", fine.getOfficer().getId());
            response.put("officerName", fine.getOfficer().getFullName());
            response.put("badgeId", fine.getOfficer().getBadgeId());
        }

        return response;
=======
    // --- THE BULLETPROOF VALIDATION ENDPOINT ---
    @GetMapping("/validate")
    public ResponseEntity<?> validateFine(@RequestParam String referenceNumber) {
        try {
            // Tell the database to search exactly for the string (e.g., TF-2026-3578C0)
            Optional<Fine> matchedFine = fineRepository.findByReferenceNumber(referenceNumber.trim());

            if (matchedFine.isPresent()) {
                return ResponseEntity.ok(matchedFine.get());
            } else {
                return ResponseEntity.status(404).body("{\"message\": \"Fine not found for Reference: " + referenceNumber + "\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"message\": \"Server error during validation\"}");
        }
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499
    }
}