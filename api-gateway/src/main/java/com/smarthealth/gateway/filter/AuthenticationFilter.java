package com.smarthealth.gateway.filter;

import com.smarthealth.gateway.util.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class AuthenticationFilter implements Filter {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private final List<String> whiteListedEndpoints = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        // Allow CORS preflight (OPTIONS) requests through without authentication
        // so that CorsConfig can add the proper Access-Control-Allow-* headers
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // Check if path is whitelisted (auth endpoints)
        if (whiteListedEndpoints.stream().anyMatch(path::contains)) {
            chain.doFilter(request, response);
            return;
        }

        // Check for Authorization header
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        try {
            // this part is important for the telemedicine service, extracts username and pw then 
            // sends it to the telemedicine service via headers
            if (jwtUtil.validateToken(token)) {
                // Extract claims
                String userName = jwtUtil.extractUsername(token);
                String userEmail = jwtUtil.extractClaim(token, claims -> claims.get("email", String.class));
                if (userEmail == null) {
                    userEmail = userName;
                }
                
                final String finalUserEmail = userEmail;

                // Create a mutable request wrapper to inject headers  
                HttpServletRequestWrapper wrappedRequest = new HttpServletRequestWrapper(httpRequest) {  
                    @Override  
                    public String getHeader(String name) {  
                        if ("X-User-Name".equalsIgnoreCase(name)) return userName;  
                        if ("X-User-Email".equalsIgnoreCase(name)) return finalUserEmail;  
                        return super.getHeader(name);  
                    }  
                };  

                // If valid, continue the filter chain
                chain.doFilter(wrappedRequest, response);
            } else {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Invalid or expired token");
            }
        } catch (Exception e) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Authentication failed: " + e.getMessage());
        }
    }
}
