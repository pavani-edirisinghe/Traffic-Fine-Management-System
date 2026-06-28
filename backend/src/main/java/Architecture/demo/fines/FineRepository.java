package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Long> {

    Optional<Fine> findByReferenceNumber(String referenceNumber);

    Optional<Fine> findByReferenceNumberAndCategoryIdentifier(String referenceNumber, String categoryIdentifier);

    List<Fine> findAllByDriver(AppUser driver);

    List<Fine> findAllByOfficer(AppUser officer);

    List<Fine> findAllByDistrict(String district);

    List<Fine> findAllByStatus(FineStatus status);

    List<Fine> findAllByDriverOrderByIssuedAtDesc(AppUser driver);

    List<Fine> findAllByOfficerOrderByIssuedAtDesc(AppUser officer);
}
