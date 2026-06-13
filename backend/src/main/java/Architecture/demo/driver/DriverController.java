package Architecture.demo.driver;

import Architecture.demo.auth.AppUser;
import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineRepository;
import Architecture.demo.fines.FineResponse;
import Architecture.demo.fines.FineStatus;
import Architecture.demo.payments.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {

    private final FineRepository fineRepository;
    private final PaymentService paymentService;

    public DriverController(FineRepository fineRepository, PaymentService paymentService) {
        this.fineRepository = fineRepository;
        this.paymentService = paymentService;
    }

    /**
     * Returns all fines belonging to the authenticated driver.
     * The driver JWT embeds fineId, so the frontend can highlight the relevant fine.
     */
    @GetMapping("/fines")
    public List<FineResponse> getMyFines(@AuthenticationPrincipal AppUser driver) {
        return fineRepository.findAllByDriverOrderByIssuedAtDesc(driver).stream()
                .map(FineResponse::from)
                .toList();
    }

    /**
     * Returns a single fine by ID, verifying it belongs to the authenticated driver.
     */
    @GetMapping("/fines/{fineId}")
    public FineResponse getFine(@PathVariable Long fineId,
                                @AuthenticationPrincipal AppUser driver) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "fine not found"));
        requireOwnership(fine, driver);
        return FineResponse.from(fine);
    }

    /**
     * Processes payment for a fine.
     * Marks the fine PAID, saves a Payment record, sends an in-app notification
     * and an SMS to the issuing officer.
     */
    @PostMapping("/pay/{fineId}")
    public FineResponse payFine(@PathVariable Long fineId,
                                @RequestParam(defaultValue = "ONLINE") String method,
                                @AuthenticationPrincipal AppUser driver) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "fine not found"));
        requireOwnership(fine, driver);

        if (fine.getStatus() == FineStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "fine is already paid");
        }

        paymentService.processPayment(fineId, method);

        return FineResponse.from(fineRepository.findById(fineId).orElseThrow());
    }

    private void requireOwnership(Fine fine, AppUser driver) {
        if (!fine.getDriver().getId().equals(driver.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "access denied");
        }
    }
}
