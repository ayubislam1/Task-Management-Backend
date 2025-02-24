require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const http = require("http");
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());

const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Create WebSocket server

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
			console.log(task);
			const result = await TaskCollection.insertOne(task);
			res.send(result);
		});

		app.delete("/task-delete/:id", async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const filter = { _id: new ObjectId(id) };
			const result = await TaskCollection.deleteOne(filter);
			res.send(result);
		});

		app.get("/all-users", async (req, res) => {
			const result = await UserCollection.find().toArray();
			res.send(result);
		});
		app.get("/all-users/:id", async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const query = { _id: new ObjectId(id) };
			const result = await UserCollection.find(query).toArray();
			res.send(result);
		});
		app.get("/tasks", async (req, res) => {
			const result = await TaskCollection.find().toArray();
			res.send(result);
		});

		app.get("/tasks/:id", async (req, res) => {
			const id = req.params.id;

			const filter = { _id: new ObjectId(id) };
			const result = await TaskCollection.find(filter).toArray();
			console.log(result);

			res.send(result);
		});
		app.patch("/update-profile/:id", async (req, res) => {
			const user = req.body;
			const id = req.params.id;
			console.log(id);
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					name: user.name,
					email: user.email,
					photoURL: user.photo,
				},
			};

			const result = await UserCollection.updateOne(filter, updateDoc);
			res.send(result);
		});
		await client.connect();

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}

io.on("connection", (socket) => {
	socket.on("chat message", (msg) => {
		console.log("message: " + msg);
	});
});
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
