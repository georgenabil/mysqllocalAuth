const connection = require('./db.js');


connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    connection.query("drop table  IF EXISTS users", function (err, result) {
        if (err) { console.log(err); }
        else {
            var sql = `CREATE TABLE users ( id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,username VARCHAR(30), password VARCHAR(60) ,email VARCHAR(30),UNIQUE(username,email) ); `
            connection.query(sql, function (err, result) {
                if (err) { console.log(err); }
                else connection.end();
            });
        }
    });
})