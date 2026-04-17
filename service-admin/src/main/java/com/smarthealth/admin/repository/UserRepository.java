package com.smarthealth.admin.repository;

import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleAndApproved(Role role, Boolean approved);
    
    List<User> findByRole(Role role);

    Optional<User> findByIdAndRole(Long id, Role role);
}
