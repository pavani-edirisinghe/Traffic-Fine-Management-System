package Architecture.demo.auth.dto;

import Architecture.demo.auth.Role;

public record SignupRequest(
		String username,
		String password,
		Role role
) {
}
