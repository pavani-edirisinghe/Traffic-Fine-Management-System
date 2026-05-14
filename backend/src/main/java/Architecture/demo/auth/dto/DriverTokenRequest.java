package Architecture.demo.auth.dto;

public record DriverTokenRequest(
		String referenceNumber,
		String categoryIdentifier
) {
}
