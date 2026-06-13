package Architecture.demo.admin;

public record DistrictSummary(
        String district,
        long totalFines,
        long paidFines,
        long unpaidFines,
        double totalRevenue,
        double pendingRevenue
) {
}
