package Architecture.demo.auth;

import java.util.Collection;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
public class AppUser implements UserDetails {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String password;

	@Column
	private String displayName;

	@Column
	private String phoneNumber;
	@Column
private String fullName;

@Column
private String badgeId;

@Column
private String district;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;

	protected AppUser() {
	}

	public AppUser(String username, String password, Role role) {
		this.username = username;
		this.password = password;
		this.role = role;
	}
public AppUser(String username, String password, String fullName, String badgeId, String phoneNumber, String district, Role role) {
    this.username = username;
    this.password = password;
    this.fullName = fullName;
    this.badgeId = badgeId;
    this.phoneNumber = phoneNumber;
    this.district = district;
    this.role = role;
}
// In AppUser.java
public AppUser(String username, String password, String displayName, String phoneNumber, Role role) {
    this.username = username;
    this.password = password;
    this.displayName = displayName;
    this.phoneNumber = phoneNumber;
    this.role = role;
}
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Override
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Override
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
public String getFullName() { return fullName; }
public void setFullName(String fullName) { this.fullName = fullName; }

public String getBadgeId() { return badgeId; }
public void setBadgeId(String badgeId) { this.badgeId = badgeId; }

public String getDistrict() { return district; }
public void setDistrict(String district) { this.district = district; }
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
