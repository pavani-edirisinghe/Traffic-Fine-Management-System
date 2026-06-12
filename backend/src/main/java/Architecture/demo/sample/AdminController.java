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
            .map(u -> new UserSummaryResponse(
                u.getId(), 
                u.getUsername(), 
                u.getDisplayName(), 
                u.getPhoneNumber(), 
                u.getFullName() != null ? u.getFullName() : "", // Fallback
                u.getBadgeId() != null ? u.getBadgeId() : "", 
                u.getDistrict() != null ? u.getDistrict() : "", 
                u.getRole()
            ))
            .toList();
}

	@GetMapping("/drivers")
public List<UserSummaryResponse> getDrivers() {
    return userRepository.findAllByRole(Role.DRIVER).stream()
            .map(u -> new UserSummaryResponse(
                u.getId(), 
                u.getUsername(), 
                u.getDisplayName(), 
                u.getPhoneNumber(), 
                u.getFullName(),  // Added
                u.getBadgeId(),   // Added
                u.getDistrict(),  // Added
                u.getRole()
            ))
            .toList();
}

@PostMapping("/officers")
@ResponseStatus(HttpStatus.CREATED)
public CreateOfficerResponse createOfficer(@RequestBody CreateOfficerRequest request) {

    // Validate request
    if (request == null) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Request body is required");
    }

    if (isBlank(request.username())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Username is required");
    }

    if (isBlank(request.password())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Password is required");
    }

    if (isBlank(request.fullName())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Full Name is required");
    }

    if (isBlank(request.badgeId())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Badge ID is required");
    }

    if (isBlank(request.phoneNumber())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Phone Number is required");
    }

    if (isBlank(request.district())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "District is required");
    }

    String username = request.username().trim();
    String temporaryPassword = request.password().trim();

    // Password validation
    if (temporaryPassword.length() < 8) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Password must be at least 8 characters");
    }

    // Username already exists
    if (userRepository.existsByUsername(username)) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Username already exists");
    }

    // Create officer
    AppUser officer = new AppUser(
            username,
            passwordEncoder.encode(temporaryPassword),
            request.fullName().trim(),
            request.badgeId().trim(),
            request.phoneNumber().trim(),
            request.district().trim(),
            Role.OFFICER
    );

    userRepository.save(officer);

    return new CreateOfficerResponse(
            officer.getId(),
            officer.getUsername(),
            temporaryPassword
    );
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
		if (!isBlank(request.displayName())) {
			officer.setDisplayName(request.displayName().trim());
		}
		if (!isBlank(request.phoneNumber())) {
			officer.setPhoneNumber(request.phoneNumber().trim());
		}
		if (updatedPassword != null) {
			officer.setPassword(passwordEncoder.encode(updatedPassword));
		}
		userRepository.save(officer);

		return new CreateOfficerResponse(officer.getId(), officer.getUsername(), updatedPassword);
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
