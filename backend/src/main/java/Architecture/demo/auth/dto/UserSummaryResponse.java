package Architecture.demo.auth.dto;

import Architecture.demo.auth.Role;


public record UserSummaryResponse(
    Long id,
    String username,
    String displayName,
    String phoneNumber,
    String fullName,
    String badgeId,
    String district,
    Role role
) {}
