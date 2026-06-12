package Architecture.demo.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapInitializer implements ApplicationRunner {
	private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapInitializer.class);

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String adminUsername;
	private final String adminPassword;

	public AdminBootstrapInitializer(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.bootstrap.admin.username:${ADMIN_USERNAME:}}") String adminUsername,
			@Value("${app.bootstrap.admin.password:${ADMIN_PASSWORD:}}") String adminPassword
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.adminUsername = adminUsername;
		this.adminPassword = adminPassword;
	}

	@Override
	public void run(ApplicationArguments args) {
		String username = trim(adminUsername);
		String password = trim(adminPassword);

		if (username.isEmpty() || password.isEmpty()) {
			logger.info("Admin bootstrap skipped: set app.bootstrap.admin.username/password or ADMIN_USERNAME/ADMIN_PASSWORD");
			return;
		}

		if (password.length() < 12) {
			logger.warn("Admin bootstrap skipped: admin password must be at least 12 characters");
			return;
		}

		if (userRepository.existsByUsername(username)) {
			logger.info("Admin bootstrap skipped: username '{}' already exists", username);
			return;
		}

		AppUser admin = new AppUser(username, passwordEncoder.encode(password), Role.ADMIN);
		userRepository.save(admin);
		logger.info("Bootstrap admin account created for username '{}'", username);
	}

	private static String trim(String value) {
		return value == null ? "" : value.trim();
	}
}
