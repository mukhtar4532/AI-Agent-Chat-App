import { useLocation } from "react-router-dom";

const Project = () => {
  const location = useLocation();
  console.log(location.state);

  return (
    <main className=" h-screen w-screen flex">
      <section className="left flex flex-col h-full min-w-96 bg-slate-300">
        <header className="flex justify-end p-4 w-full bg-slate-100 ">
          <button className=" p-2 px-4 text-black text-xl">
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          <div className="message-box p-2 flex-grow flex flex-col text-black gap-2">
            <div className=" message max-w-72 flex flex-col  p-2 bg-slate-50 w-fit rounded-md">
              <small className=" opacity-65 text-base">exmple@gmail.com</small>
              <p className=" text-lg">Lorem ipsum dolor sit amet.</p>
            </div>

            <div className=" message max-w-72 ml-auto flex flex-col justify-end  p-2 bg-slate-50 w-fit rounded-md">
              <small className=" opacity-65 text-base">exmple@gmail.com</small>
              <p className=" text-lg">Lorem ipsum dolor sit amet.</p>
            </div>
          </div>

          <div className="inputField w-full flex">
            <input
              className=" p-2 px-4 w-full border-none outline-none"
              type="text"
              placeholder="Enter message"
            />
            <button className=" flex-grow p-2 px-4 text-black text-xl ">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Project;
