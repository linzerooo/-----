const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

class AccountData {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

class TestBase {
    constructor() {
        this.driver = null;
        this.baseURL = "https://www.saucedemo.com/";
    }

    async setUp() {
        this.driver = await new Builder().forBrowser('firefox').build();
    }

    async tearDown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async goToHomePage() {
        await this.driver.get(this.baseURL);
        await this.driver.manage().window().setRect({ width: 1209, height: 830 });
    }

    async login(account) {
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).sendKeys(account.username);
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).sendKeys(account.password);
        await this.driver.findElement(By.css("*[data-test=\"login-button\"]")).click();
    }

    async fillField(selector, value) {
        if (value) {
            const element = await this.driver.findElement(selector);
            await element.click();
            await element.clear();
            await element.sendKeys(value);
        }
    }
}

class LoginTests extends TestBase {
    constructor() {
        super();
    }

    async testLogin() {
        try {
            await this.setUp();
            await this.goToHomePage();
            
            const user = new AccountData("standard_user", "secret_sauce");
            await this.login(user);
            
            const currentUrl = await this.driver.getCurrentUrl();
            assert.ok(currentUrl.includes("/inventory.html"), "Login failed");
            
            console.log("Test passed successfully");
        } catch (error) {
            console.error("Test failed:", error);
        } finally {
            await this.tearDown();
        }
    }
}

(async function() {
  const test = new LoginTests();
  await test.testLogin();
})();