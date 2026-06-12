package Architecture.demo.auth.dto;

import Architecture.demo.auth.Role;

public record UserSummaryResponse(
		String username,
		Role role
) {
}
