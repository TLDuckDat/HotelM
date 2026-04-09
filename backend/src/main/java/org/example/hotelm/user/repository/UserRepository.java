package org.example.hotelm.user.repository;

import org.example.hotelm.user.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
// extends JpaRepository để không phải tự viết Query chay
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User> findByEmail(String Email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String Email);

    @Query("""
            select u
            from User u
            where (u.status is null or u.status = :activeStatus)
              and u.role in :staffRoles
              and (
                  :keyword is null
                  or :keyword = ''
                  or lower(u.email) like lower(concat('%', :keyword, '%'))
                  or lower(u.fullName) like lower(concat('%', :keyword, '%'))
              )
            order by u.fullName asc
            """)
    List<User> searchChatStaff(@Param("keyword") String keyword,
                               @Param("activeStatus") User.UserStatus activeStatus,
                               @Param("staffRoles") List<User.Role> staffRoles);
    List<User> findByRoleInAndStatus(List<User.Role> roles, User.UserStatus status);

}