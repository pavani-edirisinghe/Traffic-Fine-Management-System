package Architecture.demo.fines;

import Architecture.demo.auth.AppUser;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.UUID;

@Entity
@Table(name = "fines")
public class Fine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    @Column(nullable = false)
    private String categoryIdentifier;

    @Column
    private String categoryName;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private AppUser driver;

    @ManyToOne
    @JoinColumn(name = "officer_id", nullable = false)
    private AppUser officer;

    @Column(nullable = false)
    private Double amount;

    @Column
    private String vehicleNumber;

    @Column
    private String driverLicense;

    @Column
    private String district;

    @Column
    private String driverName;

    @Column
    private String driverPhone;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FineStatus status = FineStatus.UNPAID;

    @Column(nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column
    private LocalDateTime paidAt;

    @PrePersist
    void prePersist() {
        if (referenceNumber == null) referenceNumber = generateReferenceNumber();
        if (categoryIdentifier == null) categoryIdentifier = "GENERAL";
    }

    public static String generateReferenceNumber() {
        String year = String.valueOf(Year.now().getValue());
        String uid = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "TF-" + year + "-" + uid;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getCategoryIdentifier() { return categoryIdentifier; }
    public void setCategoryIdentifier(String categoryIdentifier) { this.categoryIdentifier = categoryIdentifier; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public AppUser getDriver() { return driver; }
    public void setDriver(AppUser driver) { this.driver = driver; }
    public AppUser getOfficer() { return officer; }
    public void setOfficer(AppUser officer) { this.officer = officer; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    public String getDriverLicense() { return driverLicense; }
    public void setDriverLicense(String driverLicense) { this.driverLicense = driverLicense; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FineStatus getStatus() { return status; }
    public void setStatus(FineStatus status) { this.status = status; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
