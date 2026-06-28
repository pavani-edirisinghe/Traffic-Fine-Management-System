package Architecture.demo.driver;

import Architecture.demo.auth.AppUser;
import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineResponse;
import Architecture.demo.fines.FineService;
import Architecture.demo.payments.Payment;
import Architecture.demo.payments.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/driver")
public class DriverController {
    private final FineService fineService;
    private final PaymentService paymentService;

    public DriverController(FineService fineService, PaymentService paymentService) {
        this.fineService = fineService;
        this.paymentService = paymentService;
    }

    @GetMapping("/fines")
    public List<FineResponse> getMyFines(@AuthenticationPrincipal AppUser driver) {
        return fineService.getFinesForDriver(driver).stream()
                .map(FineResponse::from)
                .toList();
    }

    @GetMapping("/fines/{fineId}")
    public FineResponse getFine(@PathVariable Long fineId, @AuthenticationPrincipal AppUser driver) {
        return fineService.getFinesForDriver(driver).stream()
                .filter(f -> f.getId().equals(fineId))
                .findFirst()
                .map(FineResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "fine not found"));
    }

    @PostMapping("/pay/{fineId}")
    public FineResponse payFine(@PathVariable Long fineId,
                                @RequestParam(defaultValue = "ONLINE") String method,
                                @AuthenticationPrincipal AppUser driver) {
        List<Fine> driverFines = fineService.getFinesForDriver(driver);
        boolean owns = driverFines.stream().anyMatch(f -> f.getId().equals(fineId));
        if (!owns) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "fine does not belong to this driver");
        }
        Payment payment = paymentService.processPayment(fineId, method);
        return FineResponse.from(payment.getFine());
    }
}
