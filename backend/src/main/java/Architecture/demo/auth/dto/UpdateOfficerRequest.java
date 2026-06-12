package Architecture.demo.auth.dto;

public record UpdateOfficerRequest(
		String newUsername,
		String newPassword
) {
}
