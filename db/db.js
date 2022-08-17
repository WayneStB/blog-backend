// #3 set up DB models
const Sequelize = require("sequelize");

let options = {};

let databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
    databaseURL = "postgres://wayneboyd@localhost:5432/blog";
    options = {
        logging: false,
    };
} else {
    // we're not on localhost
    options = {
        logging: false,
        dailectOptions: {
            ssl: {
                require: true,
                rejectYnauthorized: false,
            },
        },
    };
}

const db = new Sequelize(databaseURL, {});
const User = require("./User")(db);
const Post = require("./Post")(db);
// #5 connect and sync to DB
const connectToDB = async () => {
    try {
        await db.authenticate();
        console.log("Connected successfully");
        db.sync(); //#6 sync by creating the tables based off our models if they don't exist already
    } catch (error) {
        console.error(error);
        console.error("PANIC! DB PROBLEMS!");
    }
    Post.belongsTo(User, { foreignKey: "authorID" });
};

connectToDB();

module.exports = { db, User, Post }; //export db, user & model so
