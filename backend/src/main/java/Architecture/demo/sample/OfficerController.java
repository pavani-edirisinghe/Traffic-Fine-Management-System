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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
	public LoginResponse issueDriverToken(@AuthenticationPrincipal AppUser officer, @RequestBody DriverTokenRequest request) {
		if (officer == null || officer.getRole() == null || (officer.getRole() != Role.OFFICER && officer.getRole() != Role.ADMIN)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "officer access required");
		}

		if (request == null || isBlank(request.driverName()) || isBlank(request.phoneNumber())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"driverName and phoneNumber are required");
		}

		String safePhone = request.phoneNumber().replaceAll("[^0-9]", "").trim();
		String driverUsername = "driver:" + safePhone;
		AppUser driver = userRepository.findByUsername(driverUsername)
				.orElseGet(() -> userRepository.save(new AppUser(
					driverUsername,
					passwordEncoder.encode(UUID.randomUUID().toString()),
					request.driverName().trim(),
					request.phoneNumber().trim(),
					Role.DRIVER
				)));

		String referenceNumber = isBlank(request.referenceNumber())
				? "DRV-" + safePhone + "-" + driver.getId()
				: request.referenceNumber().trim();
		String categoryIdentifier = isBlank(request.categoryIdentifier())
				? slugify(request.wrongDid())
				: request.categoryIdentifier().trim();
		String amount = isBlank(request.amount()) ? "0" : request.amount().trim();

		Map<String, Object> claims = Map.ofEntries(
				Map.entry("role", Role.DRIVER.name()),
				Map.entry("officerId", officer.getId()),
				Map.entry("officerUsername", officer.getUsername()),
				Map.entry("driverName", request.driverName().trim()),
				Map.entry("phoneNumber", request.phoneNumber().trim()),
				Map.entry("referenceNumber", referenceNumber),
				Map.entry("categoryIdentifier", categoryIdentifier),
				Map.entry("wrongDid", isBlank(request.wrongDid()) ? categoryIdentifier : request.wrongDid().trim()),
				Map.entry("amount", amount),
				Map.entry("vehicleNumber", isBlank(request.vehicleNumber()) ? "" : request.vehicleNumber().trim()),
				Map.entry("licenseNumber", isBlank(request.licenseNumber()) ? "" : request.licenseNumber().trim())
		);
		String token = jwtService.generateToken(driver.getUsername(), claims);
		return new LoginResponse(token, "Bearer", driver.getUsername(), driver.getRole(), jwtService.getExpirationSeconds());
	}

	private static String slugify(String value) {
		if (isBlank(value)) {
			return "GENERAL";
		}
		return value.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
