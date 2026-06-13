package Architecture.demo.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    public void sendPaymentConfirmation(String officerPhone, String officerUsername,
                                        String driverName, String referenceNumber, double amount) {
        String message = String.format(
                "Traffic Fine Paid | Ref: %s | Driver: %s | Amount: Rs. %.0f | License may be returned.",
                referenceNumber, driverName, amount);
        if (officerPhone != null && !officerPhone.isBlank()) {
            logger.info("SMS → Officer {} ({}): {}", officerUsername, officerPhone, message);
        } else {
            logger.info("SMS → Officer {} (no phone on file): {}", officerUsername, message);
        }
        // TODO: Integrate Twilio or Dialog/Mobitel SMS API
    }
}
