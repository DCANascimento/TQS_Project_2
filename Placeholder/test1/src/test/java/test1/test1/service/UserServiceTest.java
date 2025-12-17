package test1.test1.service;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.User;
import test1.test1.repository.UserRepository;
import test1.test1.util.PasswordUtil;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordUtil passwordUtil;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserWithUsernamePasswordBioRole_encodesPasswordAndSaves() {
        when(passwordUtil.encode("password123")).thenReturn("encoded123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(1);
            return u;
        });

        User result = userService.createUser("alice", "password123", "My bio", "renter");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1);
        assertThat(result.getUsername()).isEqualTo("alice");
        assertThat(result.getPassword()).isEqualTo("encoded123");
        verify(passwordUtil).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUserWithUsernamePasswordBio_encodesPasswordAndSaves() {
        when(passwordUtil.encode("password456")).thenReturn("encoded456");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(2);
            return u;
        });

        User result = userService.createUser("bob", "password456", "Bob bio");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(2);
        assertThat(result.getUsername()).isEqualTo("bob");
        assertThat(result.getPassword()).isEqualTo("encoded456");
        verify(passwordUtil).encode("password456");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUserWithUsername_savesAndReturnsUser() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(3);
            return u;
        });

        User result = userService.createUser("charlie");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(3);
        assertThat(result.getUsername()).isEqualTo("charlie");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(new User("a"), new User("b")));

        List<User> list = userService.getAllUsers();

        assertThat(list).isNotNull();
        assertThat(list).hasSize(2);
        verify(userRepository).findAll();
    }

    @Test
    void getUserById_returnsOptional() {
        User u = new User("bob");
        u.setUserId(5);
        when(userRepository.findById(5)).thenReturn(Optional.of(u));

        Optional<User> opt = userService.getUserById(5);

        assertThat(opt).isPresent();
        assertThat(opt.get().getUsername()).isEqualTo("bob");
        verify(userRepository).findById(5);
    }

    @Test
    void getUserById_returnsEmptyWhenNotFound() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        Optional<User> opt = userService.getUserById(999);

        assertThat(opt).isEmpty();
        verify(userRepository).findById(999);
    }

    @Test
    void findByUsername_returnsOptionalWithUser() {
        User u = new User("alice");
        u.setUserId(1);
        when(userRepository.findByUsername("alice")).thenReturn(u);

        Optional<User> result = userService.findByUsername("alice");

        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo("alice");
        verify(userRepository).findByUsername("alice");
    }

    @Test
    void findByUsername_returnsEmptyWhenNotFound() {
        when(userRepository.findByUsername(anyString())).thenReturn(null);

        Optional<User> result = userService.findByUsername("unknown");

        assertThat(result).isEmpty();
        verify(userRepository).findByUsername("unknown");
    }

    @Test
    void validatePassword_returnsTrueWhenPasswordMatches() {
        User u = new User("alice");
        u.setPassword("encoded_password");
        when(passwordUtil.matches("raw_password", "encoded_password")).thenReturn(true);

        boolean result = userService.validatePassword(u, "raw_password");

        assertThat(result).isTrue();
        verify(passwordUtil).matches("raw_password", "encoded_password");
    }

    @Test
    void validatePassword_returnsFalseWhenUserIsNull() {
        boolean result = userService.validatePassword(null, "password");

        assertThat(result).isFalse();
    }

    @Test
    void validatePassword_returnsFalseWhenUserPasswordIsNull() {
        User u = new User("alice");
        u.setPassword(null);

        boolean result = userService.validatePassword(u, "password");

        assertThat(result).isFalse();
    }

    @Test
    void validatePassword_returnsFalseWhenRawPasswordIsNull() {
        User u = new User("alice");
        u.setPassword("encoded_password");

        boolean result = userService.validatePassword(u, null);

        assertThat(result).isFalse();
        verify(passwordUtil, times(0)).matches(anyString(), anyString());
    }
}
