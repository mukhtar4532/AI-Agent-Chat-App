import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import "dotenv/config";
import http from "http";
import app from "./app.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { generateResult } from "./services/ai.service.js";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication Error"));
    }

    socket.user = decoded;
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

  // socket.on("project-message", async (data) => {
  //   // console.log(data);

  //   // const message = data.message;

  //   console.log("Received Data:", data);

  //   if (!data || typeof data !== "object") {
  //     console.error("Invalid data format:", data);
  //     return;
  //   }

  //   const message = data?.message || ""; // Ensure message is always a string
  //   console.log("Extracted Message:", message); // Debugging log

  //   if (!message) {
  //     console.error("Message is missing in data:", data);
  //     return;
  //   }
  //   const aiIsPresentInMessage = message.includes("@ai");

  //   // Broadcast message to all users except sender
  //   socket.broadcast.to(socket.roomId).emit("project-message", data);

  //   if (aiIsPresentInMessage) {
  //     const prompt = message.replace("@ai", "");
  //     const result = await generateResult(prompt);

  //     io.to(socket.roomId).emit("project-message", {
  //       message: result,
  //       sender: {
  //         _id: "ai",
  //         email: "AI",
  //       },
  //     });

  //     return;
  //   }
  // });

  socket.on("project-message", async (rawData) => {
    console.log("Received Raw Data:", rawData);

    let data;
    try {
      data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    console.log("Parsed Data:", data);

    if (!data || typeof data !== "object") {
      console.error("Invalid data format:", data);
      return;
    }

    const message = data?.message || ""; // Ensure message is always a string
    console.log("Extracted Message:", message);

    if (!message) {
      console.error("Message is missing in data:", data);
      return;
    }

    const aiIsPresentInMessage = message.includes("@ai");

    // Broadcast message to all users except sender
    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiIsPresentInMessage) {
      const prompt = message.replace("@ai", "").trim();
      console.log("AI Prompt:", prompt);

      try {
        const result = await generateResult(prompt);

        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: {
            _id: "ai",
            email: "AI",
          },
        });
      } catch (error) {
        console.error("Error generating AI response:", error);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
