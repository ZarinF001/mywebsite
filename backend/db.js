const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "mywebsite",
    port: 3306
});

db.connect((err) => {

    if (err) {
        console.log("Database connection failed:");
        console.log(err);
    } else {
        console.log("Database Connected");
    }

});

module.exports = db;