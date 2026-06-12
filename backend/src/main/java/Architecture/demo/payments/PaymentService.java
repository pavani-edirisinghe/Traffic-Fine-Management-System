package Architecture.demo.payments;

import Architecture.demo.fines.Fine;
import Architecture.demo.fines.FineRepository;
import Architecture.demo.fines.FineStatus;
import Architecture.demo.notifications.Notification;
import Architecture.demo.notifications.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    public PaymentService(FineRepository fineRepository, 
                          PaymentRepository paymentRepository, 
                          NotificationRepository notificationRepository) {
        this.fineRepository = fineRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Payment processPayment(Long fineId, Double amount, String method) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if (fine.getStatus() == FineStatus.PAID) {
            throw new RuntimeException("Fine is already paid");
        }

        Payment payment = new Payment();
        payment.setFine(fine);
        payment.setAmountPaid(amount);
        payment.setPaymentMethod(method);
        paymentRepository.save(payment);

        fine.setStatus(FineStatus.PAID);
        fineRepository.save(fine);

        Notification notification = new Notification();
        notification.setRecipient(fine.getOfficer());
        notification.setMessage("Fine ID: " + fine.getId() + " has been successfully paid by the driver.");
        notificationRepository.save(notification);

        return payment;
    }
}