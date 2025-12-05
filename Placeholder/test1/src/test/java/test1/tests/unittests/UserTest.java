package test1.tests.unittests;

import test1.test1.model.User;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class UserTest {

    @Test
    void testUserConstructorAndGetters() {
        User user = new User("Tiago");

        assertEquals("Tiago", user.getUsername());
    }

    @Test
    void testUserSetters() {
        User user = new User("Tiago");

        user.setUsername("José");
        user.setUserId(10);

        assertEquals("José", user.getUsername());
        assertEquals(10, user.getUserId());
    }
}
