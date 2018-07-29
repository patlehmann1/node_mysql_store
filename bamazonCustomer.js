const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const divider = "\n--------------------------------------------------------------------------------------------";

const idNumberArray = [];
const idChoiceArray = [];
const quantityInStockArray = [];
const quantityRequestedArray = [];
const selectedItemPriceArray = [];

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
    readAllProducts();
});

function readAllProducts() {
    console.log(divider + "\nWELCOME TO BAMAZON!\n" + divider);
    connection.query("SELECT * from products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            idNumberArray.push(res[i].item_id);
        }
        console.table(res);
        console.log(divider);
        singleItemChoice();
    });
}

function singleItemChoice() {
    inquirer.prompt([
        {
            type: "input",
            name: "idQuery",
            message: "What is the ID of the product you would like to buy?"
        }]).then(answers => {
            if (!isNaN(answers.idQuery)) {
                const numberValue = parseInt(answers.idQuery);
                const isInArray = idNumberArray.includes(numberValue);
                if (isInArray) {
                    console.log("\n\nHere is your item!" + divider);
                    connection.query("SELECT * from products WHERE item_id = " + answers.idQuery, function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        console.log(divider);
                        idChoiceArray.push(numberValue);
                        selectedItemPriceArray.push(res[0].item_price);
                        quantityChoice();
                    });
                } else {
                    console.log("\n\n  That ID does not match a product in our system. Please try again.\n\n");
                    singleItemChoice();
                }
            } else {
                console.log("\n\n  Bamazon only uses numbers to identify their products. Please try again.\n\n");
                singleItemChoice();
            }
        });
}

function quantityChoice() {
    inquirer.prompt([
        {
            type: "input",
            name: "quantityQuery",
            message: "How many of this item would you like?"
        }
    ]).then(answers => {
        console.log(divider);
        const quanParseInt = parseInt(answers.quantityQuery);
        connection.query("SELECT stock_quantity from products WHERE item_id = " + idChoiceArray[0], function (err, res) {
            if (err) throw err;
            if (!isNaN(answers.quantityQuery)) {
                if (quanParseInt <= res[0].stock_quantity) {
                    quantityInStockArray.push(res[0].stock_quantity);
                    quantityRequestedArray.push(answers.quantityQuery);
                    updateProduct();
                } else {
                    console.log("I'm sorry, we do not have that many of your requested item in stock! Please try again!\n");
                    quantityChoice();
                }
            } else {
                console.log("\n\n  Bamazon only uses numbers to identify their quantities. Please try again.\n\n");
                quantityChoice();
            }
        });
    });
};

function updateProduct() {
    console.log("Thank you for your purchase!");
    const query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: quantityInStockArray[0] - quantityRequestedArray[0]
            },
            {
                item_id: idChoiceArray[0]
            }
        ],
        function (err, res) {
            const totalPrice = selectedItemPriceArray[0] * quantityRequestedArray[0];
            const result = Math.round(totalPrice * 100) / 100;
            console.log(divider + "\nThe total price of your purchase is $" + result + "!\nHave a fantastic day!");
            connection.end();
        });
}
