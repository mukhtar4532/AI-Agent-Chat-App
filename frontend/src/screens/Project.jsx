import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket.js";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer.js";

// import "highlight.js/styles/github-dark.css"; // Choose a theme

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

// function SyntaxHighlightedCode({ children, className }) {
//   const ref = useRef(null);

//   useEffect(() => {
//     if (ref.current && className?.includes("lang-")) {
//       hljs.highlightElement(ref.current);
//     }
//   }, [children, className]); // Re-highlight when content changes

//   return (
//     <code ref={ref} className={className}>
//       {children}
//     </code>
//   );
// }

// function SyntaxHighlightedCode({ className, children }) {
//   const ref = useRef(null);

//   useEffect(() => {
//     if (ref.current && className?.includes("lang-") && window.hljs) {
//       ref.current.removeAttribute("data-highlighted"); // Ensure hljs can re-highlight
//       window.hljs.highlightElement(ref.current);
//     }
//   }, [className, children]);

//   return (
//     <code ref={ref} className={className}>
//       {children}
//     </code>
//   );
// }

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
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

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
        // users: selectedUserId,
        users: Array.from(selectedUserId),
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
    console.log(user);

    sendMessage(
      "project-message",
      JSON.stringify({
        message,
        sender: user,
      })
    );

    // appendOutgoingMessage(message);
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);

    setMessage("");
    scrollToBottom();
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="overflow-auto p-2 bg-slate-950 text-white rounded-sm">
        <Markdown
          options={{
            overrides: {
              code: {
                component: SyntaxHighlightedCode,
              },
            },
          }}>
          {messageObject.text}
        </Markdown>
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);
    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("Container Started");
      });
    }

    receiveMessage("project-message", (data) => {
      console.log(JSON.parse(data.message));
      // appendIncomingMessage(data);
      const message = JSON.parse(data.message);
      webContainer?.mount(message.fileTree);

      if (message.fileTree) {
        setFileTree(message.fileTree);
      }
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    // receiveMessage("project-message", (data) => {
    //   try {
    //     const message =
    //       typeof data.message === "string"
    //         ? JSON.parse(data.message)
    //         : data.message;

    //     console.log("Received message:", message);

    //     if (message.fileTree) {
    //       webContainer?.mount(message.fileTree);
    //       setFileTree(message.fileTree);
    //     }

    //     setMessages((prevMessages) => [...prevMessages, message]);
    //     scrollToBottom();
    //   } catch (error) {
    //     console.error("Error parsing received message:", error, data);
    //   }
    // });

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

  // function appendIncomingMessage(messageObject) {
  //   const messageBox = document.querySelector(".message-box");

  //   const message = document.createElement("div");
  //   message.classList.add(
  //     "message",
  //     "max-w-56",
  //     // "self-start",
  //     "flex",
  //     "flex-col",
  //     "p-2",
  //     "bg-slate-50",
  //     "w-fit",
  //     "rounded-md"
  //   );

  //   if (messageObject.sender._id === "ai") {
  //     const markDown = <Markdown>{messageObject.message}</Markdown>;

  //     message.innerHTML = `<small class='opacity-65'>${messageObject.sender.email}</small>
  //     <p >${markDown}</p>
  //     `;
  //   } else {
  //     message.innerHTML = `<small class='opacity-65'>${messageObject.sender.email}</small>
  //     <p >${messageObject.message}</p>
  //     `;
  //   }

  //   messageBox.appendChild(message);
  //   scrollToBottom();
  // }

  // function appendOutgoingMessage(message) {
  //   const messageBox = document.querySelector(".message-box");

  //   const newMessage = document.createElement("div");
  //   newMessage.classList.add(
  //     "message",
  //     "max-w-56",
  //     "ml-auto",
  //     // "self-end",
  //     "flex",
  //     "flex-col",
  //     "justify-end",
  //     "p-2",
  //     "bg-slate-50",
  //     "w-fit",
  //     "rounded-md"
  //   );
  //   newMessage.innerHTML = `<small class='opacity-65'>${user.email}</small>
  //   <p >${message}</p>
  //   `;
  //   messageBox.appendChild(newMessage);
  //   scrollToBottom();
  // }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  return (
    <main className=" h-screen w-screen flex">
      <section className="left flex flex-col relative h-screen min-w-96 bg-amber-300">
        {/* header section in which collaborator and sidePanel */}

        <header className="flex justify-between items-center p-2 w-full bg-amber-400 absolute top-0 z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 text-lg font-semibold cursor-pointer">
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 px-4 text-xl">
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* conversation area in which message-box, message and input field */}

        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai" ? "max-w-80" : "max-w-60"
                } ${
                  msg.sender._id == user._id.toString() && "ml-auto"
                } message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                <small className="opacity-65">{msg.sender.email}</small>
                <p>
                  {msg.sender._id === "ai"
                    ? WriteAiMessage(msg.message)
                    : msg.message}
                </p>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-3 w-full border-none outline-none placeholder-black bg-amber-200"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="p-2 px-3 bg-amber-400 text-xl ">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* sidePanel section */}

        <div
          className={`sidePanel flex flex-col gap-2 w-full h-full bg-amber-200 absolute transition-all ${
            isSidePanelOpen ? " translate-x-0" : "-translate-x-full"
          } top-0`}>
          <header className="flex justify-between items-center p-2 px-3.5 bg-slate-400 text-black">
            <h1 className=" font-semibold text-lg">Collaborators</h1>
            <button
              className="p-2 text-xl"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div className="user cursor-pointer hover:bg-amber-300 flex gap-2 items-center">
                    <div className=" aspect-square rounded-full w-fit h-fit flex items-center justify-center p-2 bg-amber-600">
                      <i className="ri-user-fill"></i>
                    </div>

                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right bg-red-50 flex-grow h-full flex ">
        <div className="explorer h-full max-w-64 min-w-60 bg-amber-400 bg-opacity-65">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-2 px-4 flex flex-col  gap-2 bg-amber-500 w-full">
                <p className="font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full">
          <div className="top flex  justify-between w-full">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 w-fit flex items-center gap-2 bg-amber-300`}>
                  <p className="font-semibold text-lg">{file}</p>
                </button>
              ))}
            </div>

            {/* webContainer Logic here */}
            <div className="actions flex gap-2">
              <button
                onClick={async () => {
                  await webContainer.mount(fileTree);
                  const installProcess = await webContainer.spawn("npm", [
                    "install",
                  ]);
                  installProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );
                  if (runProcess) {
                    runProcess.kill();
                  }
                  let tempProcess = await webContainer.spawn("npm", ["start"]);
                  tempProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );

                  setRunProcess(tempProcess);
                  webContainer.on("server-ready", (port, url) => {
                    console.log(port, url);
                    setIframeUrl(url);
                  });
                }}
                className="p-2 px-4 bg-amber-500">
                Run
              </button>
            </div>
          </div>
          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-amber-200">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updateContent = e.target.innerText;
                      setFileTree((prevFileTree) => ({
                        ...prevFileTree,
                        [currentFile]: {
                          ...prevFileTree[currentFile],
                          file: {
                            ...prevFileTree[currentFile].file,
                            contents: updateContent,
                          },
                        },
                      }));
                    }}
                    dangerouslySetInnerHTML={{
                      __html: fileTree[currentFile]?.file.contents
                        ? hljs.highlight(fileTree[currentFile].file.contents, {
                            language: "javascript",
                          }).value
                        : "No content available",
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex flex-col min-w-96 h-full text-black">
            <div className="address-bar">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 px-4 bg-amber-300"
              />
            </div>
            <iframe
              src={iframeUrl}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full h-full"></iframe>
          </div>
        )}
      </section>

      {/* Modal Section start here */}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-amber-500 bg-opacity-65 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Select a User</h2>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 cursor-pointer rounded-md flex items-center justify-between ${
                    selectedUserId.includes(user._id)
                      ? "bg-amber-400"
                      : "bg-amber-200"
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
                className="px-4 py-2 bg-amber-300 rounded-md"
                onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-amber-600 rounded-md"
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
