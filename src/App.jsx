import React, { useState, useEffect } from "react";

function App() {
  const task = [
    {
      title : 'Calculus Class',
      description : 'Attending the Calculus Class at K.106',
      date : '27 October 2025',
      time : '10.00 PM',
      status : 'Active',
    },
    {
      title : 'Physics Class',
      description : 'Attending the Physics Class at K.202',
      date : '27 October 2025',
      time : '13.00 AM',
      status : 'Active',
    },
    {
      title : 'Practical Class',
      description : 'Attending the Practical Class at Lab. I-CELL FL. 07D',
      date : '28 October 2025',
      time : '13.00 AM',
      status : 'Active',
    }
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

  // 🟩 Semua konten ditampilkan lewat return()
  return (
    <div className='flex justify-center w-full min-h-screen bg-gray-800 text-white'>
      <header className='absolute top-0 text-xl p-5 bg-gray-600 w-full text-center rounded-lg'>
        To-Do The List App
      </header>

      <main className='pt-36 w-3/4'>
        {/* User Prompt */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {/* Input Judul */}
            <input
              className="bg-slate-700 p-4 rounded-2xl w-3/4 shadow-md"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDownTitle}/>

            {/* Input Deskripsi */}
            <textarea
              className="bg-slate-700 p-4 rounded-2xl w-3/4 shadow-md resize-none"
              rows="2"
              placeholder="Task Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}>
            </textarea>

            {/* Tombol Tambah */}
            <button
              onClick={handleAddTask}
              className="bg-green-600 px-5 py-2 rounded-xl hover:bg-green-700 transition text-white">
              + Add Task
            </button>
          </div>

        {/* To-Do The List */}
        <div className='flex justify-center p-6'>
          <div className='w-[85%] flex flex-col gap-y-4'>
            <p className='font-semibold text-xl'>Your To-Do List</p>
            <hr/>

            {tasks.map((currentTask, index) => (
              <div key={index} className='bg-slate-700 p-4 rounded-2xl shadow-lg flex-col'>
                <p className={`font-semibold text-2xl ${currentTask.completed ? "line-through text-gray-400" : ""}`}>
                  {currentTask.title}
                </p>
                <details>
                  <summary>More Details</summary>
                  <p className='text-base'>{currentTask.description}</p>
                  <p className='text-base'>{currentTask.date}</p>
                  <p className='text-base'>{currentTask.time}</p>
                  <p className='text-base'>{currentTask.status}</p>
                  <input
                    type="checkbox"
                    checked={currentTask.completed}
                    onChange={() => handleToggleCompleted(index)}
                  />
                </details>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRemoveTask(index)}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition text-sm">
                    Delete
                  </button>

                  <button
                    onClick={() => handleToggleCompleted(index)}
                    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-700 transition text-sm">
                    {currentTask.completed ? "Undo" : "Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
