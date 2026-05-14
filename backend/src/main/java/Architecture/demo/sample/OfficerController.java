package Architecture.demo.sample;

import java.util.Map;
import java.util.UUID;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.Role;
import Architecture.demo.auth.UserRepository;
import Architecture.demo.auth.dto.DriverTokenRequest;
import Architecture.demo.auth.dto.LoginResponse;
import Architecture.demo.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/officer")
public class OfficerController {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public OfficerController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@GetMapping("/ping")
	public String ping() {
		return "officer-ok";
	}

	@PostMapping("/driver-token")
	@ResponseStatus(HttpStatus.CREATED)
	public LoginResponse issueDriverToken(@RequestBody DriverTokenRequest request) {
		if (request == null || isBlank(request.referenceNumber()) || isBlank(request.categoryIdentifier())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"referenceNumber and categoryIdentifier are required");
		}

		String driverUsername = "driver:" + request.referenceNumber().trim();
		AppUser driver = userRepository.findByUsername(driverUsername)
				.orElseGet(() -> userRepository.save(new AppUser(
					driverUsername,
					passwordEncoder.encode(UUID.randomUUID().toString()),
					Role.DRIVER
				)));

		Map<String, Object> claims = Map.of(
				"role", Role.DRIVER.name(),
				"referenceNumber", request.referenceNumber().trim(),
				"categoryIdentifier", request.categoryIdentifier().trim()
		);
		String token = jwtService.generateToken(driver.getUsername(), claims);
		return new LoginResponse(token, "Bearer", driver.getUsername(), driver.getRole(), jwtService.getExpirationSeconds());
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
