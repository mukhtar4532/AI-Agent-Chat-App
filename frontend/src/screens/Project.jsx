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
import PropTypes from "prop-types";

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

// Add prop validation
SyntaxHighlightedCode.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

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
  const [removeUser, setRemoveUser] = useState(null);

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

  function removeCollaborator(userId) {
    axios
      .put("/projects/remove-user", {
        projectId: location.state.project._id,
        users: [userId], // Send only the user to be removed
      })
      .then((res) => {
        console.log("User removed successfully:", res.data);

        // Update state locally to remove user
        setProject((prevProject) => ({
          ...prevProject,
          users: prevProject.users.filter((user) => user._id !== userId),
        }));
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
      <div className="overflow-auto p-2 bg-[#1e1e1e] text-white rounded-sm">
        <Markdown
          options={{
            overrides: {
              code: {
                component: SyntaxHighlightedCode,
              },
            },
          }}
        >
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
      console.log(data);

      if (data.sender._id == "ai") {
        const message = JSON.parse(data.message);
        webContainer?.mount(message.fileTree);

        if (message.fileTree) {
          setFileTree(message.fileTree || {});
        }
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
      scrollToBottom();
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree);
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

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  return (
    <main className="h-screen w-screen flex font-sans bg-[#1e1e1e]">
      <section className="left flex flex-col relative h-screen min-w-96 bg-[#2d2d2d]">
        {/* header section in which collaborator and sidePanel */}

        <header className="flex justify-between items-center p-2 w-full bg-[#3d3d3d] absolute top-0 z-10 text-gray-200">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-2 text-lg font-semibold cursor-pointer hover:text-gray-100 transition-colors"
          >
            <i className="ri-add-fill mr-1 text-[#e86c00]"></i>
            <p>Add collaborator</p>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 px-4 text-xl hover:text-gray-100 transition-colors"
          >
            <i className="ri-group-fill text-[#e86c00]"></i>
          </button>
        </header>

        {/* conversation area in which message-box, message and input field */}

        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai" ? "max-w-80" : "max-w-60"
                } ${
                  msg.sender._id == user._id.toString() && "ml-auto"
                } message flex flex-col p-2 bg-[#3d3d3d] w-fit rounded-md text-gray-200 shadow-md`}
              >
                <small className="opacity-65 text-gray-400">
                  {msg.sender.email}
                </small>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevents new line (if multiline input)
                  send(); // Calls send function
                }
              }}
              className="p-2 px-3 w-full border-none outline-none bg-[#3d3d3d] text-gray-200 placeholder-gray-400
               overflow-x-auto whitespace-nowrap"
              type="text"
              placeholder="Enter message"
            />
            <button
              onClick={send}
              className="p-2 px-3 bg-[#4d4d4d] text-2xl text-gray-200 hover:bg-[#5d5d5d] transition-colors"
            >
              <i className="ri-send-plane-fill text-[#e86c00]"></i>
            </button>
          </div>
        </div>

        {/* sidePanel section */}

        <div
          className={`sidePanel flex flex-col gap-2 w-full h-full bg-[#2d2d2d] absolute transition-all ${
            isSidePanelOpen ? " translate-x-0" : "-translate-x-full"
          } top-0 text-gray-200`}
        >
          <header className="flex justify-between items-center p-2 px-3.5 bg-[#3d3d3d]">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              className="p-2 text-xl hover:text-gray-100 transition-colors"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 p-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    className="user cursor-pointer hover:bg-[#3d3d3d] flex gap-2 items-center p-2 rounded-md transition-colors"
                    key={user._id}
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-2 bg-[#4d4d4d]">
                      <i className="ri-user-fill text-[#e86c00]"></i>
                    </div>

                    <button
                      onClick={() =>
                        setRemoveUser(removeUser === user._id ? null : user._id)
                      }
                      className="font-semibold text-lg"
                    >
                      {user.email}
                    </button>

                    {/* Remove Button - Only visible when removeUser matches user._id */}
                    {removeUser === user._id && (
                      <button
                        onClick={() => removeCollaborator(user._id)}
                        className="bg-red-600 hover:bg-red-700 mr-4 ml-auto px-2 py-1 text-white font-semibold rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right flex-grow h-full flex bg-[#1e1e1e]">
        <div className="explorer h-full max-w-64 min-w-60 bg-[#2d2d2d] border-l border-[#3d3d3d]">
          <div className="file-tree w-full flex flex-col">
            <p className="font-semibold text-lg bg-[#1e1e1e] text-gray-200 p-2 px-4 border-b border-[#3d3d3d] text-center">
              Code Editor
            </p>

            {Object.keys(fileTree || {}).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-2 px-4 bg-[#3d3d3d] w-full border-b border-[#4d4d4d] text-gray-200 hover:bg-[#4d4d4d] transition-colors text-left"
              >
                <p className="font-semibold text-lg text-start">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full bg-[#1e1e1e]">
          <div className="top flex justify-between w-full bg-[#2d2d2d]">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 w-fit flex items-center gap-2 bg-[#3d3d3d] border-r border-[#4d4d4d] text-gray-200 ${
                    currentFile === file ? "bg-[#4d4d4d]" : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent button click

                      // Filter out the closed file
                      const updatedFiles = openFiles.filter((f) => f !== file);

                      // Update open files
                      setOpenFiles(updatedFiles);

                      // If the closed file was the current file, update currentFile
                      if (file === currentFile) {
                        setCurrentFile(
                          updatedFiles.length > 0 ? updatedFiles[0] : null
                        );
                      }
                    }}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    ✕
                  </button>
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
                className="p-2 px-4 bg-[#e86c00] hover:bg-[#ff7b00] mr-4 mt-1 mb-1 rounded-md text-white font-semibold transition-colors"
              >
                Run
              </button>
            </div>
          </div>

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {currentFile === null || !fileTree[currentFile] ? (
              ""
            ) : (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-[#2d2d2d] text-gray-200">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updateContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updateContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
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
          <div className="flex flex-col min-w-96 h-full border-l border-[#3d3d3d]">
            <div className="address-bar">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 px-4 bg-[#3d3d3d] text-gray-200 border-b border-[#4d4d4d] outline-none"
              />
            </div>
            <iframe
              src={iframeUrl}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="w-full h-full bg-white"
            ></iframe>
          </div>
        )}
      </section>

      {/* Modal Section start here */}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-lg w-80 border border-[#3d3d3d] text-gray-200">
            <h2 className="text-lg font-semibold mb-4">Select a User</h2>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 cursor-pointer rounded-md flex items-center justify-between ${
                    selectedUserId.includes(user._id)
                      ? "bg-[#4d4d4d]"
                      : "bg-[#3d3d3d]"
                  } hover:bg-[#4d4d4d] transition-colors`}
                  onClick={() => handleUserSelection(user._id)}
                >
                  {user.email}
                  {selectedUserId.includes(user._id) && (
                    <i className="ri-check-line text-[#e86c00]"></i>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-md text-gray-200 font-semibold transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#e86c00] hover:bg-[#ff7b00] rounded-md text-white font-semibold transition-colors"
                onClick={addCollaborators}
              >
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
