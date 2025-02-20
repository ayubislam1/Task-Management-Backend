require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ds3da.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const UserCollection = client.db("Task_Users").collection("all-users");
		const TaskCollection = client.db("Task_Users").collection("tasks");
		app.post("/all-users", async (req, res) => {
			const users = req.body;
			const query = { email: users.email };

			const existingUser = await UserCollection.findOne(query);

			if (existingUser) {
				return res.send({ message: "User already exist" });
			}

			const result = await UserCollection.insertOne(users);
			res.send(result);
		});

		app.post("/tasks", async (req, res) => {
			const task = req.body;
			const result = await TaskCollection.insertOne(task);
			res.send(result);
		});
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
