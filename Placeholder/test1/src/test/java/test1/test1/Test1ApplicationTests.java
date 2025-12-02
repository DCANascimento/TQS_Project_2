package test1.test1;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.profiles.active=test")
class Test1ApplicationTests {

	@Test
	void contextLoads() {
	}

}
