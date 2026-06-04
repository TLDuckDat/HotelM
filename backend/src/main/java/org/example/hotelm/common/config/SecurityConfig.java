package org.example.hotelm.common.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.common.security.JwtAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /** Tránh chạy JWT filter hai lần (Servlet container + Security chain). */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static UI & uploads (read)
                        .requestMatchers(
                                "/",
                                "/*.html",
                                "/script/**",
                                "/assets/**",
                                "/uploads/**",
                                "/ws/**",
                                "/error"
                        ).permitAll()

                        // Auth & OTP
                        .requestMatchers("/auth/**").permitAll()

                        // Public catalog & reviews (read-only)
                        .requestMatchers(HttpMethod.GET, "/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/room-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/branches/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/reviews/**").permitAll()

                        // Room management
                        .requestMatchers(HttpMethod.POST, "/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/rooms/**").hasAnyRole("ADMIN", "RECEPTIONIST")

                        // Room type management
                        .requestMatchers(HttpMethod.POST, "/room-types/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/room-types/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/room-types/**").hasRole("ADMIN")

                        // Branch management
                        .requestMatchers(HttpMethod.POST, "/branches/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/branches/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/branches/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/branches/**").hasRole("ADMIN")

                        // User management
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/users/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/users/**").authenticated()

                        // Reviews (write / moderate)
                        .requestMatchers(HttpMethod.POST, "/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/reviews/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/reviews/**").hasRole("ADMIN")

                        // Uploads
                        .requestMatchers(HttpMethod.POST, "/uploads/**").hasRole("ADMIN")

                        // Bookings
                        .requestMatchers("/bookings/user/**").authenticated()
                        .requestMatchers("/bookings/queue/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/bookings/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/bookings/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/bookings/**").hasRole("ADMIN")

                        // Invoices & refunds
                        .requestMatchers("/invoices/user/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/invoices/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/invoices/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/invoices/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/invoices/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/refunds/**").authenticated()
                        .requestMatchers("/refunds/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/refunds/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/refunds/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/refunds/**").hasRole("ADMIN")

                        // KPI, chat, notifications
                        .requestMatchers("/kpi/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/chat/**").authenticated()
                        .requestMatchers("/notifications/**").authenticated()

                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.getWriter().write("{\"message\":\"Unauthorized\"}");
                }))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
