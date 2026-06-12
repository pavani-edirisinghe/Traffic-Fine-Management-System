package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
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
}