const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const divider = "\n------------------------------------------------------------------------------------------";

const idNumberArray = [];

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
                        quantityChoice();
                    });
                } else {
                    console.log("\n\nThat ID does not match a product in our system. Please try again.\n\n");
                    singleItemChoice();
                }
            } else {
                console.log("\n\nBamazon only uses numbers to identify their products. Please try again.\n\n");
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
        //obviously a joke, will add more later.. 
        console.log("\nI DONT CARE THAT YOU WANT " + answers.quantityQuery + " OF THIS PRODUCT!!!");
        connection.end();
    });
}
