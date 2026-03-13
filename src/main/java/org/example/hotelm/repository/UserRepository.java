package org.example.hotelm.repository;

import org.example.hotelm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// extends JpaRepository để không phải tự viết Query chay
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User> findByEmail(String Email);
    boolean existsByEmail(String Email);

}
