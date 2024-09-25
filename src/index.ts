import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Schema, model, connect } from "mongoose";

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { Socket } from "node:dgram";

dotenv.config();

interface userdb {
  username: string;
  email?: string;
}

const userSchema = new Schema<userdb>({
  username: { type: String, required: true },
  email: { type: String, required: false },
});

const User = model<userdb>("user", userSchema);

connectToDB().catch((err) => console.log(err));

async function connectToDB() {
  await connect("mongodb://127.0.0.1:27017/test");

  const user = new User({
    username: "test",
    email: "test@example.com",
  });
  await user.save();
  console.log(user);
}

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

app.get("/", (req: Request, res: Response) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  // console.log(socket);
  console.log(socket.id);
  console.log("a User is Connected");
  socket.on(socket.id, () => {
    io.emit(socket.id, socket.id);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("chat message", (msg, UserName) => {
    console.log(`${UserName} message : ${msg}`);
    io.emit("chat message", msg, UserName);
  });
});

server.listen(port, () => {
  console.log(`server : Server is running at localhost:${port}`);
});
