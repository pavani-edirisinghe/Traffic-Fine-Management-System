package Architecture.demo.payments;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{fineId}")
    public ResponseEntity<?> payFine(@PathVariable Long fineId,
                                     @RequestParam(defaultValue = "ONLINE") String method) {
        try {
            Payment payment = paymentService.processPayment(fineId, method);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
