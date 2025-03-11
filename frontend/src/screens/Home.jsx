import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user.context.jsx";
import axios from "../config/axios.js";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault();
    console.log({ projectName, userId: user?._id });
    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        // console.log(res.data.projects);

        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <main className="p-4 bg-[#1e1e1e] min-h-screen text-gray-200 font-sans">
      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-none min-w-52 bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded-md m-auto text-xl transition-colors duration-200"
        >
          New Project
          <i className="ri-menu-add-line ml-3 text-[#e86c00]"></i>
        </button>

        {project.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              navigate(`/project/`, {
                state: { project },
              });
            }}
            className="project flex flex-col gap-2 p-4 cursor-pointer border border-none rounded-md min-w-52 bg-[#2d2d2d] hover:bg-[#3d3d3d] m-auto text-xl transition-colors duration-200"
          >
            <h2 className="font-semibold">{project.name}</h2>
            <div className="flex gap-2 text-gray-400">
              <p>
                <small>
                  <i className="ri-user-line text-[#e86c00]"></i> Collaborators:{" "}
                </small>
              </p>
              {project.users.length}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="w-full max-w-md p-6 bg-[#2d2d2d] rounded-lg shadow-lg border border-[#3d3d3d]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl text-center font-semibold text-gray-200">
                New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  className="w-full px-4 py-2 rounded-lg bg-[#3d3d3d] text-gray-200 placeholder-gray-400 outline-none border border-[#4d4d4d] focus:border-[#e86c00]"
                  placeholder="Enter project name"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-semibold text-gray-200 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg transition-colors duration-200"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
