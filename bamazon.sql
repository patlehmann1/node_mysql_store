SELECT * FROM bamazon.products;

CREATE TABLE products (
item_id integer auto_increment NOT NULL,
product_name VARCHAR(40) NOT NULL,
department_name VARCHAR(50),
item_price FLOAT NOT NULL,
stock_quantity INTEGER,
PRIMARY KEY (item_id) 
)

INSERT INTO products (product_name, department_name, item_price, stock_quantity)
VALUES ("Ghostbusters DVD", "Movies & TV", "7.88", "20")