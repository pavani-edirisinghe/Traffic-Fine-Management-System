package Architecture.demo.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

<<<<<<< HEAD
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth APIs
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/auth/me").authenticated()

                        // Driver can check fine by reference number
                        .requestMatchers(HttpMethod.GET, "/api/fines/reference/**")
                        .hasAnyRole("DRIVER", "OFFICER", "ADMIN")

                        // Officer can view own issued fines
                        .requestMatchers(HttpMethod.GET, "/api/fines/officer/me")
                        .hasAnyRole("OFFICER", "ADMIN")

                        // Officer/Admin can view officer fines by id
                        .requestMatchers(HttpMethod.GET, "/api/fines/officer/**")
                        .hasAnyRole("OFFICER", "ADMIN")

                        // Driver can pay fine
                        .requestMatchers(HttpMethod.POST, "/api/payments/**")
                        .hasAnyRole("DRIVER", "OFFICER", "ADMIN")

                        // Admin APIs
                        .requestMatchers("/api/v1/admin/**")
                        .hasRole("ADMIN")

                        // Officer APIs
                        .requestMatchers("/api/v1/officer/**")
                        .hasAnyRole("OFFICER", "ADMIN")

                        // Driver APIs
                        .requestMatchers("/api/v1/driver/**")
                        .hasRole("DRIVER")

                        // Other fine APIs
                        .requestMatchers("/api/fines/**")
                        .hasAnyRole("OFFICER", "ADMIN")

                        // Notifications
                        .requestMatchers("/api/notifications/**")
                        .hasAnyRole("OFFICER", "ADMIN")

                        // This must always be LAST
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

=======
    // --- THE NUCLEAR BYPASS ---
    // This entirely ignores the JwtAuthenticationFilter for the specified routes.
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/api/v1/fines/**", "/api/v1/payments/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/officer/**").hasAnyRole("OFFICER", "ADMIN")
                        .requestMatchers("/api/v1/driver/**").hasRole("DRIVER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

>>>>>>> 08adce43f956666516f11b7cadb684be7a707499
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins
    ) {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        CorsConfiguration config = new CorsConfiguration();
<<<<<<< HEAD

        config.setAllowedOrigins(origins);

=======
        config.setAllowedOrigins(origins);
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499
        config.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));
<<<<<<< HEAD

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

=======
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
>>>>>>> 08adce43f956666516f11b7cadb684be7a707499
        return source;
    }
}