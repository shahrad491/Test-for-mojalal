var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import dotenv from "dotenv";
import { Schema, model, connect } from "mongoose";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
dotenv.config();
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: false },
});
const User = model("user", userSchema);
connectToDB().catch((err) => console.log(err));
function connectToDB() {
    return __awaiter(this, void 0, void 0, function* () {
        yield connect("mongodb://127.0.0.1:27017/test");
        const user = new User({
            username: "test",
            email: "test@example.com",
        });
        yield user.save();
        console.log(user);
    });
}
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
app.get("/", (req, res) => {
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
