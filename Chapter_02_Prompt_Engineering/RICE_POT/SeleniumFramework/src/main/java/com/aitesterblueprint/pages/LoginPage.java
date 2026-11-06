package com.aitesterblueprint.pages;

import java.time.Duration;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(xpath = "//input[@type='email']")
    private WebElement username;

    @FindBy(xpath = "//input[@type='password']")
    private WebElement password;

    @FindBy(xpath = "//input[@type='submit']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@type='checkbox']")
    private WebElement rememberMe;

    @FindBy(xpath = "//*[@role='alert' or contains(@class,'error')]")
    private WebElement loginError;

    public LoginPage(WebDriver driver) {
        PageFactory.initElements(driver, this);
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public void login(String user, String pass, boolean shouldRemember) {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(username)).clear();
            username.sendKeys(user);
            setRememberMe(shouldRemember);
            if (isPasswordVisible(Duration.ofSeconds(2))) {
                enterPasswordAndSubmit(pass);
                return;
            }
            loginButton.click();
            if (isPasswordVisible(Duration.ofSeconds(10))) {
                enterPasswordAndSubmit(pass);
            }
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Unable to complete Salesforce login flow", exception);
        }
    }

    public boolean isLoginErrorDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(loginError)).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public boolean isInvalidSubmissionRejected() {
        return isLoginErrorDisplayed()
                || isLoginFormDisplayed()
                || driver.getCurrentUrl().contains("login.salesforce.com");
    }

    public boolean isRememberMeSelected() {
        try {
            return wait.until(ExpectedConditions.elementToBeClickable(rememberMe)).isSelected();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    private boolean isLoginFormDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(username)).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    public void setRememberMe(boolean shouldRemember) {
        WebElement checkbox = wait.until(ExpectedConditions.elementToBeClickable(rememberMe));
        if (checkbox.isSelected() != shouldRemember) {
            checkbox.click();
        }
    }

    private boolean isPasswordVisible(Duration timeout) {
        try {
            return new WebDriverWait(driver, timeout)
                    .until(ExpectedConditions.visibilityOf(password)).isDisplayed();
        } catch (TimeoutException exception) {
            return false;
        }
    }

    private void enterPasswordAndSubmit(String pass) {
        wait.until(ExpectedConditions.elementToBeClickable(password)).clear();
        password.sendKeys(pass);
        loginButton.click();
    }
}
