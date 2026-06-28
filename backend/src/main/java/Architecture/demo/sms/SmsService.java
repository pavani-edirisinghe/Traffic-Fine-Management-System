package Architecture.demo.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    /**
     * Sends a payment confirmation SMS to the issuing traffic officer.
     * Replace the logger stub with a real SMS provider (e.g. Twilio, Dialog, Mobitel) in production.
     */
    public void sendPaymentConfirmation(String officerPhone,
                                        String officerUsername,
                                        String driverName,
                                        String referenceNumber,
                                        double amount) {
        String message = String.format(
                "Traffic Fine Paid | Ref: %s | Driver: %s | Amount: Rs. %.0f | License may be returned.",
                referenceNumber, driverName, amount
        );

        if (officerPhone != null && !officerPhone.isBlank()) {
            logger.info("SMS → Officer {} ({}): {}", officerUsername, officerPhone, message);
        } else {
            logger.info("SMS → Officer {} (no phone on file): {}", officerUsername, message);
        }

        // TODO: Integrate a real SMS gateway, e.g.:
        // twilioClient.messages.create(
        //     MessageCreator(PhoneNumber(officerPhone), PhoneNumber(FROM_NUMBER), message)
        // );
    }
}
