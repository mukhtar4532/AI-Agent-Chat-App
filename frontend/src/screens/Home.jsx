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
          className="project p-4 border border-none min-w-52 bg-slate-200 hover:bg-slate-400 rounded-md m-auto text-xl">
          New Project
          <i className="ri-menu-add-line ml-3"></i>
        </button>

        {project.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              navigate(`/project/`, {
                state: { project },
              });
            }}
            className="project flex flex-col gap-2 p-4 cursor-pointer border border-none rounded-md min-w-52 bg-slate-200 hover:bg-slate-400 m-auto text-xl">
            <h2 className=" font-semibold">{project.name}</h2>
            <div className="flex gap-2">
              <p>
                <small>
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
        <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-550">
          <div className="w-full max-w-md p-6 bg-slate-400 rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl text-center font-semibold ">
                New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:text-gray-200">
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Project Name</label>
                <input
                  type="text"
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  className="w-full px-4 py-2  rounded-lg bg-slate-300 placeholder-black outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-semibold text-white bg-black rounded-lg ">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
