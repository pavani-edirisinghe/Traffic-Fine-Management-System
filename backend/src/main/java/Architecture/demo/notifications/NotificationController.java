package Architecture.demo.notifications;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/officer/{officerId}")
    public ResponseEntity<List<Notification>> getOfficerNotifications(@PathVariable Long officerId) {
        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient().getId().equals(officerId))
                .toList();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long notificationId) {
        return notificationRepository.findById(notificationId).map(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok(notification);
        }).orElse(ResponseEntity.notFound().build());
    }
}