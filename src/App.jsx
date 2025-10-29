import React, { useState, useEffect } from "react";

function App() {
  const task = [
    {
      title: "Calculus Class",
      description: "Attending the Calculus Class at K.106",
      date: "27 October 2025",
      time: "10.00 PM",
      status: "Active",
    },
    {
      title: "Physics Class",
      description: "Attending the Physics Class at K.202",
      date: "27 October 2025",
      time: "13.00 AM",
      status: "Active",
    },
    {
      title: "Practical Class",
      description: "Attending the Practical Class at Lab. I-CELL FL. 07D",
      date: "28 October 2025",
      time: "13.00 AM",
      status: "Active",
    },
  ];

  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("tasks_v1");
      return stored ? JSON.parse(stored) : task;
    } catch {
      return task;
    }
  });

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("tasks_v1", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage:", e);
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (newTitle.trim() === "") return;

    const now = new Date();
    const taskToAdd = {
      title: newTitle,
      description: newDescription || "-",
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Active",
      completed: false,
    };

    setTasks((prev) => [...prev, taskToAdd]);
    setNewTitle("");
    setNewDescription("");
  };

  const handleKeyDownTitle = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleToggleCompleted = (index) => {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleRemoveTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  //  UI Theme
  return (
    <div className="relative flex flex-col items-center w-full min-h-screen overflow-visible text-white">
      {/*  Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/*  Overlay Transparan */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm -z-10" />

      {/*  Header */}
      <header className="w-full text-center py-6 bg-gradient-to-r from-indigo-900/70 via-purple-800/60 to-indigo-900/70 backdrop-blur-md shadow-lg">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-lg tracking-wide">
          To-Do The List App
        </h1>
      </header>

      {/*  Main Content */}
      <main className="pt-20 w-full max-w-3xl px-6">
        {/* Input Form */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <input
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-lg backdrop-blur-sm"
            placeholder="Task Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDownTitle}
          />

          <textarea
            rows="2"
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-lg backdrop-blur-sm resize-none"
            placeholder="Task Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />

          <button
            onClick={handleAddTask}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:scale-105 hover:shadow-emerald-400/40 transition-all duration-300"
          >
            + Add Task
          </button>
        </div>

        {/*  Task List */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-2 text-cyan-300 drop-shadow-md">
            Your To-Do List
          </h2>
          <hr className="border-gray-500/40 mb-2" />

          {tasks.map((currentTask, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg hover:shadow-cyan-400/20 transition-all"
            >
              <p
                className={`text-2xl font-bold mb-2 ${
                  currentTask.completed
                    ? "line-through text-gray-400"
                    : "text-white"
                }`}
              >
                {currentTask.title}
              </p>

              <details className="cursor-pointer text-gray-300">
                <summary className="mb-1">More Details</summary>
                <div className="pl-4 text-sm text-gray-200">
                  <p>{currentTask.description}</p>
                  <p>{currentTask.date}</p>
                  <p>{currentTask.time}</p>
                  <p>{currentTask.status}</p>
                </div>
              </details>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleRemoveTask(index)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleToggleCompleted(index)}
                  className={`px-4 py-2 rounded-lg shadow-md transition ${
                    currentTask.completed
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {currentTask.completed ? "Undo" : "Done"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/*  Footer */}
      <footer className="mt-12 mb-4 text-gray-400 text-sm">
        Made with ❤️ in the Galaxy
      </footer>
    </div>
  );
}

export default App;
