//NPM's and Dependencies
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

//load the Bamazon
const loadBamazon = () => {
    connection.connect( (err) => {
        if (err) {
            throw err;
        }

        console.log("Success", connection.threadId);

        displayTable();
    });
} //end loadBamazon()

//Display the main table of products
const displayTable = () => {
    connection.query("SELECT item_id, product_name, price FROM products", (err, result) => {
        if (err) {
            throw err;
        }

        let idArray = []

        result.forEach(function (index) {
            idArray.push(index.item_id);
        })

        console.log("\n");
        console.table(result);

        inputValidation(idArray);
        // connection.end();
    }); //end connection.query()
}

//Initial input and data validation
const inputValidation = (array) => {

    inquirer.prompt([
        {
            type: "input",
            message: "What would you like to purchase? (enter ID from above table)",
            name: "whichProduct",
        },
        {
            type: "input",
            message: "How many would you like?",
            name: "quantity"
        }
    ])
        .then((inqRes) => {
            if (!array.includes(parseInt(inqRes.whichProduct))) {
                console.log("Play nice: enter a valid product ID.");
                displayTable();
            } else if (!parseInt(inqRes.quantity)) {
                console.log("Play nice: enter a valid quantity.");
                displayTable();
            } else {
                inventoryManagement(inqRes);
            }
        }); //end inq.prompt
} //end inputValidation()

//Misnomer.  Really handling inventory workflow. So maybe not that much of a misnomer.
const inventoryManagement = (inqRes) => {
    const quantity = parseInt(inqRes.quantity);

    connection.query(`SELECT * FROM products WHERE item_id = ${inqRes.whichProduct}`,
        (err, result) => {

            console.log(`\nYou want ${quantity} ${result[0].product_name}`);

            const productInventory = parseInt(result[0].product_stock);
            if (err) {
                throw err;
            }

            if (quantity > productInventory) {
                console.log(`You entered too many of those.  We have ${productInventory} left.`);

                inquirer.prompt([
                    {
                        type: "confirm",
                        message: "Would you like to purchase them all?",
                        name: "answer",
                    }
                ]).then(function (confirm) {
                    console.log(confirm.answer);
                    if (confirm.answer == true) {
                        console.log("The remainder is yours.");
                        updateInventory(inqRes.whichProduct, productInventory, productInventory);
                    } else {
                        displayTable();
                    }
                }); //end Inquirer

            } else {
                console.log(`\nThat will be $${quantity * result[0].price}. \n`);

                updateInventory(inqRes.whichProduct, productInventory, quantity);
            }
            // console.log(result);
        }); //end connect.q
} //end inventoryManagement()

//Handle the actual inventory update.
const updateInventory = (productId, inventory, quantity) => {
    const updateQuant = inventory - quantity;

    connection.query(`UPDATE products SET ? WHERE ?`,
        [ {product_stock: updateQuant}, {item_id: productId} ],
        (err, result) => {
            if (err) {
                throw err;
            }

            inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to keep shopping?",
                    name: "answer",
                }
            ]).then(function (confirm) {
                if (confirm.answer == true) {
                    displayTable();
                } else {
                    console.log("\nThanks for shopping with Bamazon.  Please come again soon.")
                    connection.end();
                }
            }); //end Inquirer

        }); //end connect.q
}

loadBamazon();