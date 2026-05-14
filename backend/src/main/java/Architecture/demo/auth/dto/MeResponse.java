package Architecture.demo.auth.dto;

import Architecture.demo.auth.Role;

public record MeResponse(
		String username,
		Role role
) {
}
