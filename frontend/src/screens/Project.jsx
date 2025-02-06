import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket.js";

const Project = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const messageBox = React.createRef();

  const { user } = useContext(UserContext);
  const location = useLocation();
  // console.log(location.state);
  const [project, setProject] = useState(location.state.project);

  const handleUserSelection = (userId) => {
    setSelectedUserId(
      (prevUserId) =>
        prevUserId.includes(userId)
          ? prevUserId.filter((id) => id !== userId) // Remove if already selected
          : [...prevUserId, userId] // Add if not selected
    );
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: selectedUserId,
      })
      .then((res) => {
        // console.log("Selected User ID:", selectedUserId);
        console.log(res.data);

        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    // console.log(user);

    sendMessage("project-message", {
      message,
      sender: user,
    });

    appendOutgoingMessage(message);

    setMessage("");
  };

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      console.log(data);
      appendIncomingMessage(data);
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);
        setProject(res.data.project);
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function appendIncomingMessage(messageObject) {
    const messageBox = document.querySelector(".message-box");

    const message = document.createElement("div");
    message.classList.add(
      "message",
      "max-w-56",
      "flex",
      "flex-col",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md"
    );
    message.innerHTML = `<small class='opacity-65'>${messageObject.sender.email}</small>
    <p >${messageObject.message}</p>
    `;
    messageBox.appendChild(message);
  }

  function appendOutgoingMessage(messageObject) {
    const messageBox = document.querySelector(".message-box");

    const message = document.createElement("div");
    message.classList.add(
      "message",
      "max-w-56",
      "ml-auto",
      "flex",
      "flex-col",
      "justify-end",
      "p-2",
      "bg-slate-50",
      "w-fit",
      "rounded-md"
    );
    message.innerHTML = `<small class='opacity-65'>${messageObject.sender}</small>
    <p >${messageObject.message}</p>
    `;
    messageBox.appendChild(message);
  }

  return (
    <main className=" h-screen w-screen flex">
      <section className="left flex flex-col relative h-full min-w-80 bg-slate-300">
        {/* header section in which collaborator and sidePanel */}

        <header className="flex justify-between items-center p-2 w-full bg-slate-100 text-black ">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 text-lg font-semibold                 ">
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className=" p-2 px-4 text-black text-xl">
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* conversation area in which message-box, message and input field */}

        <div className="conversation-area flex-grow flex flex-col">
          <div
            ref={messageBox}
            className="message-box p-2 flex-grow flex flex-col text-black gap-2">
            <div className="message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65">exmple@gmail.com</small>
              <p>Lorem ipsum dolor sit amet.</p>
            </div>

            <div className="message max-w-56 ml-auto flex flex-col justify-end p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65">exmple@gmail.com</small>
              <p>Lorem ipsum dolor sit amet.</p>
            </div>
          </div>

          <div className="inputField w-full flex">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-3 w-full border-none outline-none text-black"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="p-2 px-3 bg-slate-950 text-xl ">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* sidePanel section */}

        <div
          className={`sidePanel flex flex-col gap-2 w-full h-full bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? " translate-x-0" : "-translate-x-full"
          } top-0`}>
          <header className="flex justify-between items-center p-2 px-3.5 bg-slate-200 text-black">
            <h1 className=" font-semibold text-lg">Collaborators</h1>
            <button
              className=" text-black p-2 text-xl"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div className="user cursor-pointer hover:bg-slate-300 flex gap-2 items-center">
                    <div className=" aspect-square rounded-full w-fit h-fit flex items-center justify-center p-2 bg-slate-600">
                      <i className="ri-user-fill"></i>
                    </div>

                    <h1 className=" text-black font-semibold text-lg">
                      {user.email}
                    </h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Modal Section start here */}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Select a User</h2>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 cursor-pointer rounded-md flex items-center justify-between ${
                    selectedUserId.includes(user._id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => handleUserSelection(user._id)}>
                  {user.email}
                  {selectedUserId.includes(user._id) && (
                    <i className="ri-check-line"></i>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={addCollaborators}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
