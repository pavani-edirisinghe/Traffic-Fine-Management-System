package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import Architecture.demo.auth.dto.DriverTokenRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FineService {

    private final FineRepository fineRepository;

    public FineService(FineRepository fineRepository) {
        this.fineRepository = fineRepository;
    }

    public Fine createFine(AppUser driver, AppUser officer, DriverTokenRequest request) {
        Fine fine = new Fine();

        String refNum = isBlank(request.referenceNumber())
                ? Fine.generateReferenceNumber()
                : request.referenceNumber().trim();
        fine.setReferenceNumber(refNum);

        String catId = isBlank(request.categoryIdentifier())
                ? slugify(request.wrongDid())
                : request.categoryIdentifier().trim();
        fine.setCategoryIdentifier(catId);

        fine.setCategoryName(isBlank(request.wrongDid()) ? catId : request.wrongDid().trim());

        fine.setDriver(driver);
        fine.setOfficer(officer);
        fine.setAmount(parseAmount(request.amount()));
        fine.setVehicleNumber(isBlank(request.vehicleNumber()) ? null : request.vehicleNumber().trim());
        fine.setDriverLicense(isBlank(request.licenseNumber()) ? null : request.licenseNumber().trim());
        fine.setDriverName(request.driverName().trim());
        fine.setDriverPhone(request.phoneNumber().trim());
        fine.setDistrict(isBlank(officer.getDistrict()) ? null : officer.getDistrict());
        fine.setStatus(FineStatus.UNPAID);

        return fineRepository.save(fine);
    }

    public List<Fine> getFinesForOfficer(AppUser officer) {
        return fineRepository.findAllByOfficerOrderByIssuedAtDesc(officer);
    }

    public List<Fine> getFinesForDriver(AppUser driver) {
        return fineRepository.findAllByDriverOrderByIssuedAtDesc(driver);
    }

    private static double parseAmount(String amount) {
        if (isBlank(amount)) return 0.0;
        try {
            return Double.parseDouble(amount.trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private static String slugify(String value) {
        if (isBlank(value)) return "GENERAL";
        return value.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
