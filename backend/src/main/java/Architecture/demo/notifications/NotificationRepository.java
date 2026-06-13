package Architecture.demo.notifications;

import Architecture.demo.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(AppUser recipient);
    List<Notification> findAllByRecipientAndIsReadFalseOrderByCreatedAtDesc(AppUser recipient);
}
