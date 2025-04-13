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
        await this.driver.manage().window().setRect({ width: 1209, height: 830 });
    }

    async tearDown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async goToHomePage() {
        await this.driver.get(this.baseURL);
    }

    async login(account) {
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).sendKeys(account.username);
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).sendKeys(account.password);
        await this.driver.findElement(By.css("*[data-test=\"login-button\"]")).click();
    }
}

describe('Login Tests', function() {
    this.timeout(30000);
    const testBase = new TestBase();
    const user = new AccountData("standard_user", "secret_sauce");

    beforeEach(async function() {
        await testBase.setUp();
        await testBase.goToHomePage();
    });

    afterEach(async function() {
        await testBase.tearDown();
    });

    it('should login successfully', async function() {
        await testBase.login(user);
        const currentUrl = await testBase.driver.getCurrentUrl();
        assert.ok(currentUrl.includes("/inventory.html"), "Login failed");
    });
});

describe('Cart Tests', function() {
    this.timeout(30000);
    const testBase = new TestBase();
    const user = new AccountData("standard_user", "secret_sauce");

    beforeEach(async function() {
        await testBase.setUp();
        await testBase.goToHomePage();
        await testBase.login(user);
    });

    afterEach(async function() {
        await testBase.tearDown();
    });

    it('should add items to cart', async function() {
        await testBase.driver.findElement(By.css("*[data-test=\"add-to-cart-sauce-labs-backpack\"]")).click();
        await testBase.driver.findElement(By.css("*[data-test=\"add-to-cart-sauce-labs-bike-light\"]")).click();
        
        await testBase.driver.findElement(By.css("*[data-test=\"shopping-cart-link\"]")).click();
        
        const cartItems = await testBase.driver.findElements(By.css('.cart_item'));
        assert.strictEqual(cartItems.length, 2, "Should be 2 items in cart");
    });
});