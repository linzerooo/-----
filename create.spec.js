const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

// Классы данных (Model)
class AccountData {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

class ProductData {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
}

// Базовый класс для помощников
class HelperBase {
    constructor(manager) {
        this.manager = manager;
        this.driver = manager.driver;
    }

    async isElementPresent(locator) {
        try {
            await this.driver.findElement(locator);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Классы помощников
class NavigationHelper extends HelperBase {
    constructor(manager) {
        super(manager);
        this.baseURL = "https://www.saucedemo.com/";
    }

    async openHomePage() {
        await this.driver.get(this.baseURL);
        await this.driver.manage().window().setRect({ width: 1209, height: 830 });
    }

    async openCartPage() {
        await this.driver.findElement(By.css("*[data-test=\"shopping-cart-link\"]")).click();
    }
}

class LoginHelper extends HelperBase {
    constructor(manager) {
        super(manager);
    }

    async login(account) {
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"username\"]")).sendKeys(account.username);
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).click();
        await this.driver.findElement(By.css("*[data-test=\"password\"]")).sendKeys(account.password);
        await this.driver.findElement(By.css("*[data-test=\"login-button\"]")).click();
    }
}

class ProductHelper extends HelperBase {
    constructor(manager) {
        super(manager);
    }

    async addProductToCart(productLocator) {
        await this.driver.findElement(productLocator).click();
    }
}

// Менеджер приложения
class ApplicationManager {
    constructor() {
        this.driver = null;
        this.navigation = null;
        this.login = null;
        this.product = null;
    }

    async start() {
        this.driver = await new Builder().forBrowser('firefox').build();
        this.navigation = new NavigationHelper(this);
        this.login = new LoginHelper(this);
        this.product = new ProductHelper(this);
    }

    async stop() {
        if (this.driver) {
            await this.driver.quit();
        }
    }
}

// Базовый класс для тестов
class TestBase {
    constructor() {
        this.app = new ApplicationManager();
    }

    async setUp() {
        await this.app.start();
    }

    async tearDown() {
        await this.app.stop();
    }
}

// Тесты
class LoginTests {
    constructor(app) {
        this.app = app;
    }

    async testSuccessfulLogin() {
        try {
            await this.app.navigation.openHomePage();
            
            const user = new AccountData("standard_user", "secret_sauce");
            await this.app.login.login(user);
            
            const currentUrl = await this.app.driver.getCurrentUrl();
            assert.ok(currentUrl.includes("/inventory.html"), "Login failed");
            
            console.log("Login test passed successfully");
        } catch (error) {
            console.error("Login test failed:", error);
        }
    }
}

class CartTests {
    constructor(app) {
        this.app = app;
    }

    async testAddProductsToCart() {
        try {
            await this.app.navigation.openHomePage();
            
            const user = new AccountData("standard_user", "secret_sauce");
            await this.app.login.login(user);
            
            await this.app.product.addProductToCart(By.css("*[data-test=\"add-to-cart-sauce-labs-backpack\"]"));
            await this.app.product.addProductToCart(By.css("*[data-test=\"add-to-cart-sauce-labs-bike-light\"]"));
            
            await this.app.navigation.openCartPage();
            
            const cartItems = await this.app.driver.findElements(By.css('.cart_item'));
            assert.strictEqual(cartItems.length, 2, "Should be 2 items in cart");
            
            console.log("Cart test passed successfully");
        } catch (error) {
            console.error("Cart test failed:", error);
        }
    }
}


class DeleteTests {
    constructor(app) {
        this.app = app;
    }

    async testDeleteProductsFromCart() {
        try {
            await this.app.navigation.openHomePage();

            const user = new AccountData("standard_user", "secret_sauce");
            await this.app.login.login(user);

            await this.app.product.addProductToCart(By.css("*[data-test=\"add-to-cart-sauce-labs-backpack\"]"));
            await this.app.product.addProductToCart(By.css("*[data-test=\"add-to-cart-sauce-labs-bike-light\"]"));

            await this.app.navigation.openCartPage();

            await this.app.driver.findElement(By.css("*[data-test=\"remove-sauce-labs-backpack\"]")).click();
            await this.app.driver.findElement(By.css("*[data-test=\"remove-sauce-labs-bike-light\"]")).click();

            // Проверяем, что корзина пустая
            const cartItems = await this.app.driver.findElements(By.css('.cart_item'));
            assert.strictEqual(cartItems.length, 0, "Cart should be empty after removing products");

            console.log("Delete test passed successfully");
        } catch (error) {
            console.error("Delete test failed:", error);
        }
    }
}

// Запуск тестов
(async function runAllTests() {
    const app = new ApplicationManager();
    try {
        await app.start();

        const loginTest = new LoginTests(app);
        const cartTest = new CartTests(app);
        const deleteTest = new DeleteTests(app);

        console.log("Running login test...");
        await loginTest.testSuccessfulLogin();

        console.log("\nRunning delete test...");
        await deleteTest.testDeleteProductsFromCart();

        console.log("\nRunning cart test...");
        await cartTest.testAddProductsToCart();
        
    } catch (error) {
        console.error("Unexpected error during test run:", error);
    } finally {
        await app.stop();
    }
})();
