const { DataTypes } = require("sequelize");

module.exports = (db) => {
    return db.define("post", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: DataTypes.STRING,
        content: DataTypes.STRING,
        authorID: DataTypes.INTEGER,
    });
};
