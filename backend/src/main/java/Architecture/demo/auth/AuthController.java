package Architecture.demo.auth;

import Architecture.demo.auth.dto.LoginRequest;
import Architecture.demo.auth.dto.LoginResponse;
import Architecture.demo.auth.dto.MeResponse;
import Architecture.demo.auth.dto.SignupRequest;
import Architecture.demo.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager,
			JwtService jwtService
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	@PostMapping("/signup")
	@ResponseStatus(HttpStatus.CREATED)
	public LoginResponse signup(@RequestBody SignupRequest request) {
		if (request == null || isBlank(request.username()) || isBlank(request.password())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		if (userRepository.existsByUsername(request.username())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
		}

		Role role = request.role() == null ? Role.DRIVER : request.role();
		AppUser user = new AppUser(request.username(), passwordEncoder.encode(request.password()), role);
		userRepository.save(user);

		String token = jwtService.generateToken(user);
		return new LoginResponse(token, "Bearer", user.getUsername(), user.getRole(), jwtService.getExpirationSeconds());
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody LoginRequest request) {
		if (request == null || isBlank(request.username()) || isBlank(request.password())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		Authentication auth = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.username(), request.password())
		);

		AppUser user = (AppUser) auth.getPrincipal();
		String token = jwtService.generateToken(user);
		return new LoginResponse(token, "Bearer", user.getUsername(), user.getRole(), jwtService.getExpirationSeconds());
	}

	@GetMapping("/me")
	public MeResponse me(@AuthenticationPrincipal AppUser user) {
		if (user == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}
		return new MeResponse(user.getUsername(), user.getRole());
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
