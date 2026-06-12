package Architecture.demo.sample;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.Role;
import Architecture.demo.auth.UserRepository;
import Architecture.demo.auth.dto.CreateOfficerRequest;
import Architecture.demo.auth.dto.UserSummaryResponse;

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
@RequestMapping("/api/v1/admin")
public class AdminController {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@GetMapping("/ping")
	public String ping() {
		return "admin-ok";
	}

	@PostMapping("/officers")
	@ResponseStatus(HttpStatus.CREATED)
	public UserSummaryResponse createOfficer(@RequestBody CreateOfficerRequest request) {
		if (request == null || isBlank(request.username()) || isBlank(request.password())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		String username = request.username().trim();
		if (userRepository.existsByUsername(username)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
		}

		AppUser officer = new AppUser(username, passwordEncoder.encode(request.password()), Role.OFFICER);
		userRepository.save(officer);
		return new UserSummaryResponse(officer.getUsername(), officer.getRole());
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
