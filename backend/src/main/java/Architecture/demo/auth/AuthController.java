package Architecture.demo.auth;

import Architecture.demo.auth.dto.LoginRequest;
import Architecture.demo.auth.dto.LoginResponse;
import Architecture.demo.auth.dto.MeResponse;
import Architecture.demo.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(
			AuthenticationManager authenticationManager,
			JwtService jwtService
	) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
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
