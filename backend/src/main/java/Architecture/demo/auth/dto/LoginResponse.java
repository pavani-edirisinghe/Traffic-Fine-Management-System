package Architecture.demo.auth.dto;

import Architecture.demo.auth.Role;

public record LoginResponse(
		String accessToken,
		String tokenType,
		String username,
		Role role,
		long expiresInSeconds
) {
}
