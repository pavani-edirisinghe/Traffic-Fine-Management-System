package Architecture.demo.auth.dto;

public record DriverTokenRequest(
        String driverName,
        String phoneNumber,
        String wrongDid,
        String vehicleNumber,
        String licenseNumber,
        String amount,
        String referenceNumber,
        String categoryIdentifier,
        String district
) {
}
