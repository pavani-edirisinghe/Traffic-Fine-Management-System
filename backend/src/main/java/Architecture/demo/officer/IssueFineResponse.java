package Architecture.demo.officer;

import Architecture.demo.auth.dto.LoginResponse;
import Architecture.demo.fines.FineResponse;

public record IssueFineResponse(
        LoginResponse driverToken,
        FineResponse fine
) {
}
