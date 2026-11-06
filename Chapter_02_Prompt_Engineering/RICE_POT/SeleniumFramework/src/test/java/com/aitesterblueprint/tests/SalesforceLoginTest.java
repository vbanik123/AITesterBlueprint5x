package com.aitesterblueprint.tests;

import com.aitesterblueprint.pages.LoginPage;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.testng.AllureTestNg;
import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

@Feature("Salesforce authentication")
@Listeners(AllureTestNg.class)
public class SalesforceLoginTest {
    private static final String LOGIN_URL = "https://login.salesforce.com/?locale=in";
    private final Dotenv environment = Dotenv.configure().ignoreIfMissing().load();
    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeMethod
    public void setUp() {
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--start-maximized");
            driver = new ChromeDriver(options);
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            driver.get(LOGIN_URL);
            loginPage = new LoginPage(driver);
        } catch (RuntimeException exception) {
            tearDown();
            throw new IllegalStateException("Unable to initialize headed Chrome test session", exception);
        }
    }

    @Test
    @Story("Valid login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Logs in with the valid credentials supplied in .env.")
    public void shouldLogInWithValidCredentials() {
        loginPage.setRememberMe(true);
        Assert.assertTrue(loginPage.isRememberMeSelected(), "Remember me must be selectable.");
        loginPage.login(required("VALID_USERNAME"), required("VALID_PASSWORD"), true);
        new WebDriverWait(driver, Duration.ofSeconds(20))
                .until(ExpectedConditions.not(ExpectedConditions.urlToBe(LOGIN_URL)));
        Assert.assertFalse(loginPage.isLoginErrorDisplayed(), "A valid login must not show an error.");
    }

    @Test
    @Story("Invalid login")
    @Severity(SeverityLevel.NORMAL)
    @Description("Rejects the invalid credentials supplied in .env.")
    public void shouldRejectInvalidCredentials() {
        loginPage.setRememberMe(false);
        Assert.assertFalse(loginPage.isRememberMeSelected(), "Remember me must be clearable.");
        loginPage.login(required("INVALID_USERNAME"), required("INVALID_PASSWORD"), false);
        Assert.assertTrue(loginPage.isInvalidSubmissionRejected(), "Invalid credentials must remain on the login flow or display an error.");
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }

    private String required(String key) {
        String value = environment.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required environment variable: " + key);
        }
        return value;
    }
}
