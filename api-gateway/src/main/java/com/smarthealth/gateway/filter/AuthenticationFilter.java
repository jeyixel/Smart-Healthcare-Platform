package com.smarthealth.gateway.filter;

import com.smarthealth.gateway.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class AuthenticationFilter implements Filter {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private static final List<String> WHITE_LISTED_PREFIXES = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/forgot-password/"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod()) || isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeUnauthorized(httpResponse, "Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty() || !isLikelyCompactJwt(token)) {
            writeUnauthorized(httpResponse, "Invalid token format");
            return;
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                writeUnauthorized(httpResponse, "Invalid or expired token");
                return;
            }

            String userName = jwtUtil.extractUsername(token);
            if (userName == null || userName.isBlank()) {
                writeUnauthorized(httpResponse, "Invalid token payload");
                return;
            }

            String userEmail = jwtUtil.extractClaim(token, claims -> claims.get("email", String.class));
            if (userEmail == null || userEmail.isBlank()) {
                userEmail = userName;
            }

            final String finalUserName = userName;
            final String finalUserEmail = userEmail;

            HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(httpRequest) {
                @Override
                public String getHeader(String name) {
                    if ("X-User-Name".equalsIgnoreCase(name)) return finalUserName;
                    if ("X-User-Email".equalsIgnoreCase(name)) return finalUserEmail;
                    return super.getHeader(name);
                }
            };

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userName,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            chain.doFilter(wrappedRequest, response);
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
            writeUnauthorized(httpResponse, "Invalid or expired token");
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            httpResponse.setContentType("text/plain");
            httpResponse.getWriter().write("Internal Gateway Error");
        }
    }

    private boolean isWhitelisted(String path) {
        return WHITE_LISTED_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private boolean isLikelyCompactJwt(String token) {
        return token.chars().filter(ch -> ch == '.').count() == 2;
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/plain");
        response.getWriter().write(message);
    }
}