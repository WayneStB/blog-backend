// #3 set up DB models
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");

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
                rejectUnauthorized: false,
            },
        },
    };
}

const db = new Sequelize(databaseURL, options);
const User = require("./User")(db);
const Post = require("./Post")(db);

//#10 seeding the database
const createFirstUser = async () => {
    const users = await User.findAll();
    if (users.length === 0) {
        User.create({
            username: "wayne",
            password: bcrypt.hashSync("wonderful", 10),
        });
    }
};

const creatSecondUser = async () => {
    const sencondUser = await User.findOne({
        where: { username: "tesla" },
    });
    if (!sencondUser) {
        User.create({
            username: "tesla",
            password: bcrypt.hashSync("models", 10),
        });
    }
};

// #5 connect and sync to DB
const connectToDB = async () => {
    try {
        await db.authenticate();
        console.log("Connected successfully");
        await db.sync(); //#6 sync by creating the tables based off our models if they don't exist already
        await createFirstUser();
        await creatSecondUser();
    } catch (error) {
        console.error(error);
        console.error("PANIC! DB PROBLEMS!");
    }
    Post.belongsTo(User, { foreignKey: "authorID" });
};

connectToDB();

module.exports = { db, User, Post }; //export db, user & model so
