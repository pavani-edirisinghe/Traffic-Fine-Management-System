package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/fines")
public class FineController {

    private final FineRepository fineRepository;
    private final UserRepository userRepository;

    public FineController(FineRepository fineRepository, UserRepository userRepository) {
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueFine(@RequestParam Long driverId,
                                       @RequestParam Long officerId,
                                       @RequestParam Double amount,
                                       @RequestParam String description) {
        AppUser driver = userRepository.findById(driverId).orElseThrow(() -> new RuntimeException("Driver not found"));
        AppUser officer = userRepository.findById(officerId).orElseThrow(() -> new RuntimeException("Officer not found"));

        Fine fine = new Fine();
        fine.setDriver(driver);
        fine.setOfficer(officer);
        fine.setAmount(amount);
        fine.setDescription(description);
        fine.setStatus(FineStatus.UNPAID);

        fineRepository.save(fine);
        return ResponseEntity.ok(fine);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Fine>> getDriverFines(@PathVariable Long driverId) {
        List<Fine> fines = fineRepository.findAll().stream()
                .filter(f -> f.getDriver().getId().equals(driverId))
                .toList();
        return ResponseEntity.ok(fines);
    }

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
    }
}