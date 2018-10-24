var db = require('../db/db.js');

module.exports = class User {

    static db() {
        return db
    }

    static getUsers(callback) {
        return db.query("SELECT * FROM users ", callback);
    }

    static getUserById(id, callback) {
        return db.query("SELECT * FROM users WHERE id=?", [id], callback);
    }

    static getUserBygoogleId(id, callback) {
        return db.query("SELECT * FROM users WHERE googleid=?", [id], callback);
    }

    static getUserByname(name, callback) {
        return db.query("SELECT * FROM users WHERE username=?", [name], callback);
    }

    static addUser(user, callback) {

        return db.query("INSERT INTO users (username,password,email,googleId) VALUES(?,?,?,?)",
            [user.username, user.password, user.email, user.googleid], callback);
    }

    static delUserByID(id, callback) {
        return db.query("DELETE FROM users WHERE id=?", [id], callback);
    }

    static editProd(user, callback) {
        return db.query("UPDATE users SET username=?, password=? WHERE  id=?",
            [user.username, user.password, user.id], callback);
    }


};
