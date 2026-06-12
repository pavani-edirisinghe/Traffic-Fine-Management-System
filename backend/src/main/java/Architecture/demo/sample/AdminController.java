package Architecture.demo.sample;

import java.util.List;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.Role;
import Architecture.demo.auth.UserRepository;
import Architecture.demo.auth.dto.CreateOfficerRequest;
import Architecture.demo.auth.dto.CreateOfficerResponse;
import Architecture.demo.auth.dto.UpdateOfficerRequest;
import Architecture.demo.auth.dto.UserSummaryResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
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

	@GetMapping("/officers")
	public List<UserSummaryResponse> getOfficers() {
		return userRepository.findAllByRole(Role.OFFICER).stream()
				.map(user -> new UserSummaryResponse(user.getUsername(), user.getRole()))
				.toList();
	}

	@GetMapping("/drivers")
	public List<UserSummaryResponse> getDrivers() {
		return userRepository.findAllByRole(Role.DRIVER).stream()
				.map(user -> new UserSummaryResponse(user.getUsername(), user.getRole()))
				.toList();
	}

	@PostMapping("/officers")
	@ResponseStatus(HttpStatus.CREATED)
	public CreateOfficerResponse createOfficer(@RequestBody CreateOfficerRequest request) {
		if (request == null || isBlank(request.username()) || isBlank(request.password())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		String username = request.username().trim();
		String temporaryPassword = request.password().trim();
		if (temporaryPassword.length() < 12) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password must be at least 12 characters");
		}
		if (userRepository.existsByUsername(username)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
		}

		AppUser officer = new AppUser(username, passwordEncoder.encode(temporaryPassword), Role.OFFICER);
		userRepository.save(officer);
		return new CreateOfficerResponse(officer.getUsername(), temporaryPassword);
	}

	@PutMapping("/officers/{username}")
	public CreateOfficerResponse updateOfficer(
			@PathVariable String username,
			@RequestBody UpdateOfficerRequest request
	) {
		if (isBlank(username) || request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and update data are required");
		}

		AppUser officer = userRepository.findByUsername(username.trim())
				.filter(user -> user.getRole() == Role.OFFICER)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));

		String updatedUsername = isBlank(request.newUsername()) ? officer.getUsername() : request.newUsername().trim();
		String updatedPassword = isBlank(request.newPassword()) ? null : request.newPassword().trim();

		if (!updatedUsername.equals(officer.getUsername()) && userRepository.existsByUsername(updatedUsername)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
		}

		officer.setUsername(updatedUsername);
		if (updatedPassword != null) {
			officer.setPassword(passwordEncoder.encode(updatedPassword));
		}
		userRepository.save(officer);

		return new CreateOfficerResponse(officer.getUsername(), updatedPassword);
	}

	@DeleteMapping("/officers/{username}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteOfficer(@PathVariable String username) {
		AppUser officer = userRepository.findByUsername(username.trim())
				.filter(user -> user.getRole() == Role.OFFICER)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "officer not found"));
		userRepository.delete(officer);
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
