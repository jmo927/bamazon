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
function loadBamazon() {
    connection.connect(function (err) {
        if (err) {
            throw err;
        }

        console.log("Success", connection.threadId);

        displayTable();
    });
} //end loadBamazon()

//Display the main table of products
function displayTable() {
    connection.query("SELECT * FROM products", function (err, result) {
        if (err) {
            throw err;
        }

        let newTable = [];

        result.forEach(function (index) {
            // console.log(index);
            let newObject = {
                id: index.item_id,
                product: index.product_name,
                price: "$ " + index.price
            }
            newTable.push(newObject);
        })
        console.log("\n");
        console.table(newTable);

        purchaseItem();
    }); //end connection.query()
}

function purchaseItem() {

    inquirer.prompt([
        {
            type: "input",
            message: "What would you like to purchase? (enter ID from above table)",
            name: "whichProduct",
        },
        // Here we create a basic password-protected text prompt.
        {
            type: "input",
            message: "How many would you like?",
            name: "quantity"
        }
    ])
        .then(function (response) {
            let cChoices = [];
            let cAnswers = response;
            connection.query("SELECT * FROM products", function (err, result) {
                if (err) {
                    throw err;
                }

                result.forEach(function (index) {
                    cChoices.push(index.item_id);
                });
                //checking for invalid entries
                console.log(parseInt(cAnswers.whichProduct));
                
                if (!parseInt(cAnswers.whichProduct)) {
                    console.log("\nPlease enter an ID from the following Table");
                    displayTable();
                } else if (cChoices.indexOf(cAnswers.whichProduct) < 0) {
                    console.log("\nPlease enter an ID from the following Table");
                    displayTable();
                } else { //finally getting to the maths
                    console.log("Whoo we did it");
                }

            }); //end connect.q

        }); //end inq.prompt
} //end purchaseItem()

loadBamazon();