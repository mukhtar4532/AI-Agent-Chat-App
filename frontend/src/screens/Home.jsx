import React, { useContext, useEffect, useState } from "react";
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
    console.log({ projectName });
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
    <main className=" p-4">
      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-500 min-w-52 hover:bg-slate-800 rounded-md m-auto text-xl">
          New Project
          <i className="ri-menu-add-line ml-3"></i>
        </button>

        {project.map((project) => (
          <div
            onClick={() => {
              navigate(`/project/`, {
                state: { project },
              });
            }}
            key={project.id}
            className="project flex flex-col gap-2 p-4 cursor-pointer border border-slate-500 rounded-md min-w-52 hover:bg-slate-800 m-auto text-xl">
            <h2 className=" font-semibold">{project.name}</h2>
            <div className="flex gap-2">
              <p>
                <small>
                  {" "}
                  <i className="ri-user-line"></i> Collaborators :{" "}
                </small>
              </p>
              {project.users.length}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200">
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  className="w-full px-4 py-2  rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
