import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!socket.project) {
      return next(new Error("Project not found"));
    }

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return next(new Error("Invalid token"));
      }
      socket.user = decoded;
    } catch (error) {
      return next(new Error("Authentication failed"));
    }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // if (!decoded) {
    //   return next(new Error("Authentication Error"));
    // }

    // socket.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("User connected to room:", socket.roomId);

  // console.log("a user connected");
  socket.join(socket.roomId);

  // socket.on("project-message", (data) => {
  //   console.log("Received message: ", data);

  //   socket.broadcast.to(socket.roomId).emit("project-message", data);
  // });

  socket.on("project-message", (data) => {
    if (!socket.user) {
      console.error("Sender is null because socket.user is not set");
      return;
    }

    const messageData = {
      message: data.message,
      sender: data.sender, // Attach sender ID
    };

    console.log("Sending message:", messageData);

    // Broadcast message to all users except sender
    socket.broadcast.to(socket.roomId).emit("project-message", messageData);
  });

  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
