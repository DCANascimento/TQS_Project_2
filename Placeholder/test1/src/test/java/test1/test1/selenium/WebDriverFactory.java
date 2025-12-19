package test1.test1.selenium;

import java.time.Duration;
import java.util.Optional;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import io.github.bonigarcia.wdm.WebDriverManager;

public final class WebDriverFactory {

    private WebDriverFactory() {}

    public static Optional<WebDriver> createRemoteHeadlessDriver() {
        try {
            ChromeOptions options = new ChromeOptions();
            
            // Use system chromium if available
            String chromiumPath = "/snap/bin/chromium";
            if (new java.io.File(chromiumPath).exists()) {
                options.setBinary(chromiumPath);
            }
            
            // Comment out --headless to see the browser! Uncomment for headless mode
            // options.addArguments("--headless=new");
            options.addArguments("--no-sandbox", "--disable-dev-shm-usage", 
                               "--disable-gpu", "--remote-debugging-port=9222");
            options.setAcceptInsecureCerts(true);

            // Setup ChromeDriver using WebDriverManager (cached after first run)
            WebDriverManager.chromedriver().setup();
            
            ChromeDriver driver = new ChromeDriver(options);
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(3));
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(10));
            return Optional.of(driver);
        } catch (Exception e) {
            // ChromeDriver setup failed; signal caller to skip
            System.err.println("Failed to create ChromeDriver: " + e.getMessage());
            return Optional.empty();
        }
    }
}
