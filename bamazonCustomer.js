const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');


const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "B!gRed1988",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts("SELECT * FROM products");
});

function readProducts(input) {
    console.log("WELCOME TO BAMAZON!\n");
    connection.query(input, function (err, res) {
        if (err) throw err;
        console.table(res);
        findItem();
    });
}

function findItem() {
    inquirer.prompt([
        {
            type: "input",
            name: "idQuery",
            message: "What is the ID of the product you would like to buy?"
        }]).then(answers => {
            if (isNaN(answers.idQuery)) {
                console.log("Please input a number!");
                findItem();
            } else if (answers.idQuery > 1000 && answers.idQuery < answers[answers.length - 1]) {
                console.log("I will come back and finish this at a later date");
                connection.end();
                // Will add function to select the ID and display just that ID's information...
            }
            // this code isn't working, need to figure this out in the morning...
            // if (answers.idQuery < 1000 && answers.idQuery > answers[answers.length - 1]) {
            //     console.log("That ID number does not match an item! Try again!");
            //     findItem();
            // }
        });
}