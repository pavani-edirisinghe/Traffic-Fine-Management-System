package Architecture.demo.admin;

import java.util.List;

public record AnalyticsResponse(
        long totalFines,
        long paidFines,
        long unpaidFines,
        double totalRevenue,
        double pendingRevenue,
        List<DistrictSummary> byDistrict,
        List<CategorySummary> byCategory
) {
}
