package Architecture.demo.fines;

import java.time.LocalDateTime;

public record FineResponse(
        Long id,
        String referenceNumber,
        String categoryIdentifier,
        String categoryName,
        Double amount,
        String vehicleNumber,
        String driverLicense,
        String district,
        String driverName,
        String driverPhone,
        String description,
        FineStatus status,
        LocalDateTime issuedAt,
        LocalDateTime paidAt,
        Long officerId,
        String officerUsername
) {
    public static FineResponse from(Fine fine) {
        return new FineResponse(
                fine.getId(),
                fine.getReferenceNumber(),
                fine.getCategoryIdentifier(),
                fine.getCategoryName(),
                fine.getAmount(),
                fine.getVehicleNumber(),
                fine.getDriverLicense(),
                fine.getDistrict(),
                fine.getDriverName(),
                fine.getDriverPhone(),
                fine.getDescription(),
                fine.getStatus(),
                fine.getIssuedAt(),
                fine.getPaidAt(),
                fine.getOfficer() != null ? fine.getOfficer().getId() : null,
                fine.getOfficer() != null ? fine.getOfficer().getUsername() : null
        );
    }
}
