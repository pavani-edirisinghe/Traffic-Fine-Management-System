package Architecture.demo.auth;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
	Optional<AppUser> findByUsername(String username);

	List<AppUser> findAllByRole(Role role);

	boolean existsByUsername(String username);
}
