package Architecture.demo.auth.dto;

public record CreateOfficerResponse(
		Long id,
		String username,
		String temporaryPassword
) {
}
