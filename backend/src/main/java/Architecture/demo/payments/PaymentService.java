package Architecture.demo.payments;

import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineRepository;
import Architecture.demo.fines.FineStatus;
import Architecture.demo.notifications.Notification;
import Architecture.demo.notifications.NotificationRepository;
import Architecture.demo.sms.SmsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final SmsService smsService;

    public PaymentService(FineRepository fineRepository,
                          PaymentRepository paymentRepository,
                          NotificationRepository notificationRepository,
                          SmsService smsService) {
        this.fineRepository = fineRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.smsService = smsService;
    }

    @Transactional
    public Payment processPayment(Long fineId, String paymentMethod) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new RuntimeException("Fine is already paid");
        }

        Payment payment = new Payment();
        payment.setFine(fine);
        payment.setAmountPaid(fine.getAmount());
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "ONLINE");
        paymentRepository.save(payment);

        fine.setStatus(FineStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());
        fineRepository.save(fine);

        String driverName = fine.getDriverName() != null
                ? fine.getDriverName()
                : (fine.getDriver().getDisplayName() != null ? fine.getDriver().getDisplayName() : fine.getDriver().getUsername());

        String message = String.format(
                "Fine %s has been paid by %s (Rs. %.0f). You may return the driver's license.",
                fine.getReferenceNumber(), driverName, fine.getAmount()
        );
        Notification notification = new Notification();
        notification.setRecipient(fine.getOfficer());
        notification.setMessage(message);
        notificationRepository.save(notification);

        smsService.sendPaymentConfirmation(
                fine.getOfficer().getPhoneNumber(),
                fine.getOfficer().getUsername(),
                driverName,
                fine.getReferenceNumber(),
                fine.getAmount()
        );

        return payment;
    }
}
