// dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const divider = "\n------------------------------------------------------------------------------------------";
const idNumberArray = [];
let idChoiceArray = [];
let quantityInStockArray = [];

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "B!gRed1988",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    pushIdNumbers();
    managerOptions("Please select from the following:");
});

function managerOptions(message) {
    idChoiceArray = [];
    quantityInStockArray = [];
    inquirer.prompt([
        {
            type: "list",
            name: "managerChoice",
            message: message,
            choices: [
                "Products for Sale",
                "Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Quit"
            ]
        }]).then(answers => {
            switch (answers.managerChoice) {
                case "Products for Sale":
                    showAllProducts();
                    break;
                case "Low Inventory":
                    showLowInventory();
                    break;
                case "Add to Inventory":
                    itemChoice();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                case "Quit":
                    console.log("\nHave a great day!");
                    connection.end();
            }
        });
}

function pushIdNumbers() {
    connection.query("SELECT * from products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            idNumberArray.push(res[i].item_id);
        }
    });
}

function showAllProducts() {
    connection.query("SELECT * from products", function (err, res) {
        if (err) throw err;
        console.log(divider + "\nPRODUCTS IN STOCK\n" + divider);
        console.table(res);
        console.log(divider);
        managerOptions("What would like to do now?");
    });
};


function showLowInventory() {
    console.log(divider + "\nPRODUCTS WITH 5 ITEMS OR LESS IN STOCK\n" + divider);
    connection.query("SELECT * from products WHERE stock_quantity <= 5", function (err, res) {
        if (err) throw err;
        console.table(res);
        console.log(divider);
        managerOptions("What would you like to do now?");
    });
}

function itemChoice() {
    inquirer.prompt([
        {
            type: "input",
            name: "idQuery",
            message: "What is the ID of the product you would like to add quantity to?"
        }]).then(answers => {
            if (!isNaN(answers.idQuery)) {
                const idParsedValue = parseInt(answers.idQuery);
                const isInArray = idNumberArray.includes(idParsedValue);
                if (isInArray) {
                    connection.query("SELECT * from products WHERE item_id = " + answers.idQuery, function (err, res) {
                        if (err) throw err;
                        idChoiceArray.push(idParsedValue);
                        quantityInStockArray.push(res[0].stock_quantity);
                        addInventory();
                    });
                } else {
                    console.log("\n\n  That ID does not match a product in our system. Please try again.\n\n");
                    itemChoice();
                }
            } else {
                console.log("\n\n  Bamazon only uses numbers to identify their products. Please try again.\n\n");
                itemChoice();
            }
        });
}

function addInventory() {
    inquirer.prompt([
        {
            type: "input",
            name: "quantityQuery",
            message: "How much of this item would you like to add?"
        }]).then(answers => {
            let quantityParsedValue = parseInt(answers.quantityQuery);
            const newTotalStock = quantityInStockArray[0] + quantityParsedValue;
            console.log("\nUpdating stock quantity...");
            const query = connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newTotalStock
                    },
                    {
                        item_id: idChoiceArray[0]
                    }
                ],
                function (err, res) {
                    if (err) throw err;
                    console.log(divider + `\nProduct #${idChoiceArray[0]} updated successfully!\nYour new quantity total is ${newTotalStock}!\n`);
                    managerOptions("What would you like to do now?");
                });
        });

}

function addNewProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the product?"
        },
        {
            type: "input",
            name: "department_name",
            message: "What is the department name of the product?"
        },
        {
            type: "input",
            name: "price",
            message: "How much does this item cost per unit?"
        },
        {
            type: "input",
            name: "quantity",
            message: "How much of this item would you like to add?"
        }
    ]).then(answers => {
        const value1 = answers.name;
        const value2 = answers.department_name;
        const value3 = answers.price;
        const value4 = answers.quantity;
        connection.query(`INSERT INTO products (product_name, department_name, item_price, stock_quantity) VALUES ("${value1}", "${value2}", "${value3}", "${value4}")`, function (err, res) {
            if (err) throw err;
            console.log(`\n${value1} was added successfully!\n`);
            managerOptions("What would you like to do now?");
        });
    });
};
