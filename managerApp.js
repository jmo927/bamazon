const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "Squee!!!1",
    database: "bamazon_db"
});

const loadManagerBamazon = () => {
    connection.connect((err) => {
        if (err) {
            throw err;
        }

        console.log("Success", connection.threadId);

        managerView();
    });
} //end loadBamazon()

const managerView = () => {

    inquirer.prompt([
        {
            type: "rawlist",
            message: "What would you like to do?",
            name: "whichChoice",
            choices: ["View Products", "View Low Inventory", "Add Inventory", "Add Product"]
        }
    ]).then((res) => {
        switch (res.whichChoice) {
            case "View Products":
                return viewProducts();
            case "View Low Inventory":
                return viewLowInventory();
            case "Add Inventory":
                return addInventory();
            case "Add Product":
                return addProduct();
        }
    });

}; //end mangaerView()

const viewProducts = () => {
    console.log("\nView Inventory");
    connection.query("SELECT item_id, product_name, price, product_stock FROM products", (err, result) => {
        if (err) {
            throw err;
        }

        console.log("\n");
        console.table(result);

        continueManaging();
    }); //end connection.query()
} //end viewProducts()

const viewLowInventory = () => {
    console.log("\nView Low Inventory");

    connection.query("SELECT item_id, product_name, price, product_stock FROM products WHERE product_stock < 6", (err, result) => {
        if (err) {
            throw err;
        }

        console.log("\n");
        console.table(result);
        continueManaging();
    }); //end connection.query()
} //end viewLowInventory()

const addInventory = () => {
    console.log("\nAdd Inventory");

    connection.query("SELECT item_id, product_name, price, product_stock FROM products", (err, result) => {
        if (err) {
            throw err;
        }

        console.log("\n");
        console.table(result);

        inquirer.prompt([
            {
                type: "input",
                message: "Which product would you like to add inventory to? (enter ID from above table)",
                name: "whichProduct",
            },
            {
                type: "input",
                message: "How many would you like to add?",
                name: "quantity"
            }
        ]).then((res) => {

            connection.query(`UPDATE products SET product_stock=product_stock+${res.quantity} WHERE item_id=${res.whichProduct}`,
                (err, result) => {
                    if (err) {
                        throw err;
                    }
                
                    viewProducts();
                }); //end connect.query

        }); //end .then
    }); // connection.end();
} //end addInventory()

const addProduct = () => {
    console.log("\nAdd Products");

    inquirer.prompt([
        {
            type: "input",
            message: "Product Name:",
            name: "name",
        },
        {
            type: "input",
            message: "Department:",
            name: "department"
        },
        {
            type: "input",
            message: "Suggested Price:",
            name: "price"
        },
        {
            type: "input",
            message: "Quantity:",
            name: "quantity"
        }
    ])
        .then((res) => {

            connection.query(`INSERT INTO products (product_name, department_name, price, product_stock) VALUES ("${res.name}", "${res.department}", ${res.price}, ${res.quantity})`,
                (err, result) => {
                    if (err) {
                        throw err;
                    }
                
                    viewProducts();
                }); //end connect.query
        });
    // connection.end();
} //end addProduct()

const continueManaging = () => {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to keep managing?",
            name: "continue",

        }
    ]).then((res) => {
        if (res.continue) {
            managerView();
        } else {
            console.log("\nThanks for managing Bamazon.  Goodbye.");
            connection.end();
        }
    });
} //end continueManaging()

loadManagerBamazon();