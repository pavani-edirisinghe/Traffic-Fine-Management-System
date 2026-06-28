package Architecture.demo.admin;

public record CategorySummary(
        String categoryIdentifier,
        String categoryName,
        long totalFines,
        long paidFines,
        long unpaidFines,
        double totalRevenue,
        double pendingRevenue
) {
}
