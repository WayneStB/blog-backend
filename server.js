// express setup include (CORS, body-parser, bcrypt, sessions)
const express = require("express");
const server = express();
const cors = require("cors");
server.use(
    cors({
        credentials: true,
        origin: "https://waynestb-blog-frontend.herokuapp.com",
    })
);
const bodyParser = require("body-parser");
server.use(bodyParser.json());
const bcrypt = require("bcrypt");

const sessions = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(sessions.Store);
const { db, User, Post } = require("./db/db.js");
{
    /* #2 DB setup  #8 */
}
const oneMonth = 1000 * 60 * 24 * 30;
server.use(
    sessions({
        secret: "mysecretkey",
        store: new SequelizeStore({ db }),
        cookie: { maxAge: oneMonth },
    })
);

server.get("/", (req, res) => {
    res.send({ hello: "world" });
});

server.post("/login", async (req, res) => {
    const user = await User.findOne(
        { where: { username: req.body.username } },
        { raw: true }
    );
    if (!user) {
        res.send({ error: "username not found" });
    } else {
        const matchingPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (matchingPassword) {
            req.session.user = user;
            res.send({ success: true, message: "open sesame" });
        } else {
            res.send({ error: "no go. passwords no match." });
        }
    }
});

server.get("/loginStatus", (req, res) => {
    if (req.session.user) {
        res.send({ isLoggedIn: true });
    } else {
        res.send({ isLoggedIn: false });
    }
});

server.get("/logout", (req, res) => {
    req.session.destroy();
    res.send({ isLoggedIn: false });
});
const authRequired = (req, res, next) => {
    if (!req.session.user) {
        res.send({ error: "You're not signed in. No Posting for you" });
    } else {
        next();
    }
};

server.post("/post", authRequired, async (req, res) => {
    await Post.create({
        title: req.body.title,
        content: req.body.content,
        authorID: req.session.user?.id,
    });
    res.send({ post: "created" });
});

server.patch("/post/:id", authRequired, async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    post.content = req.body.content;
    post.title = req.body.title;
    await post.save();
    res.send({ success: true, message: "its been edited" });
});

server.delete("/post/:id", authRequired, async (req, res) => {
    await Post.destroy({ where: { id: req.params.id } });
    res.send({ success: true, message: "That post is deleted" });
});

server.get("/posts", async (req, res) => {
    res.send({
        posts: await Post.findAll({
            order: [["id", "DESC"]],
            include: [{ model: User, attributes: ["username"] }],
        }),
    });
});

server.get("/post/:id", async (req, res) => {
    res.send({ post: await Post.findByPk(req.params.id) });
});

server.get("/authors", async (req, res) => {
    res.send({
        authors: await User.findAll({ attributes: ["id", "username"] }),
    });
});

server.get("/author/:id", async (req, res) => {
    res.send({
        posts: await Post.findAll({ where: { authorID: req.params.id } }),
        user: await User.findByPk(req.params.id, {
            attributes: ["username"],
        }),
    });
});

//#9 run express API server in background for incoming request
server.listen(3001, () => {
    console.log("Server running.");
});

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

createFirstUser();

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

creatSecondUser();
