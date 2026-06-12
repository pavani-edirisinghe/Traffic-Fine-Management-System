package Architecture.demo.payments;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PreAuthorize("hasRole('DRIVER')")
    @PostMapping("/{fineId}")
    public ResponseEntity<?> payFine(@PathVariable Long fineId, 
                                     @RequestParam Double amount, 
                                     @RequestParam String method) {
        try {
            Payment payment = paymentService.processPayment(fineId, amount, method);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}