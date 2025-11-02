import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder, useCycle } from "framer-motion";
import "@fontsource/poppins";
import axios from "axios";

function App() {
  // 🌟 Default tasks
  const defaultTasks = [
    {
      id: "1",
      title: "Calculus Class",
      description: "Attend Calculus at K.106",
      day: "Monday",
      deadlineDate: "2025-10-27",
      deadlineTime: "10:00",
      status: "Active",
      completed: false,
    },
    {
      id: "2",
      title: "Physics Class",
      description: "Attend Physics at K.202",
      day: "Tuesday",
      deadlineDate: "2025-10-28",
      deadlineTime: "13:00",
      status: "Active",
      completed: false,
    },
  ];

  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks_v3");
    return stored ? JSON.parse(stored) : defaultTasks;
  });

  const [filter, setFilter] = useState("All");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isDarkMode, toggleDarkMode] = useCycle(true, false);
  const [toast, setToast] = useState(null);
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  // 2. Tambahkan state untuk loading API
  const [isLoading, setIsLoading] = useState(false);

  // 🔊 SOUND SYSTEM
  const playSound = useCallback((type = "add") => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "add") osc.frequency.value = 880;
    else if (type === "remove") osc.frequency.value = 220;
    else if (type === "deadline") osc.frequency.value = 660;

    gain.gain.value = 0.2;
    osc.type = "sine";
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  // 💬 Toast System
  const showToast = useCallback(
    (message, type = "info") => {
      setToast({ message, type });
      playSound(
        type === "add" ? "add" : type === "remove" ? "remove" : "deadline"
      );
      setTimeout(() => setToast(null), 3000);
    },
    [playSound]
  );

  // 📆 Save tasks
  useEffect(() => {
    localStorage.setItem("tasks_v3", JSON.stringify(tasks));
  }, [tasks]);

  // ✨ 3. Modifikasi handleAddTask untuk memanggil Gemini API (VERSI DEBUGGING)
  const handleAddTask = useCallback(async () => {
    if (newTitle.trim() === "") return;
    setIsLoading(true);

    // --- LANGKAH DEBUGGING 1: Cek API Key ---
    console.log("Mencoba menggunakan API Key:", process.env.REACT_APP_GEMINI_API_KEY);
    // ----------------------------------------

    // Tugas manual sebagai fallback
    const manualTask = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription || "-",
      day: newDay || "Unspecified",
      deadlineDate: newDate || new Date().toISOString().split("T")[0],
      deadlineTime: newTime || "00:00",
      status: "Active",
      completed: false,
    };

    try {
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

      if (!API_KEY) {
        console.warn("Gemini API key not found. Skipping AI processing.");
        throw new Error("Missing API Key");
      }

      const prompt = `
        You are a to-do list assistant. Your job is to parse user input into a structured JSON object.
        The user's main input is: "${newTitle}"
        Parse this input to find:
        1. A cleaner, main title (e.g., "Calculus Class").
        2. A short description (e.g., "at K.106").
        3. The day of the week (e.g., "Monday").
        4. The date (in YYYY-MM-DD format).
        5. The time (in HH:MM 24-hour format).
        Respond ONLY with a single JSON object. Use null for any fields you can't find.
        Example Input: "Meeting with team at K.101 on Friday at 3pm"
        Example Output: 
        {
          "title": "Meeting with team",
          "description": "at K.101",
          "day": "Friday",
          "date": null,
          "time": "15:00"
        }
        User Input: "${newTitle}"
      `;

      const response = await axios.post(
        API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY,
          },
        }
      );

      const aiResponseText =
        response.data.candidates[0].content.parts[0].text.trim();
      
      // --- LANGKAH DEBUGGING 2: Cek Respon Mentah AI ---
      console.log("Respon mentah dari AI:", aiResponseText);
      // ---------------------------------------------
      
      // Ekstrak JSON dari respons AI 
      const aiData = JSON.parse(aiResponseText.match(/\{.*\}/s)[0]); 

      const newTask = {
        id: Date.now().toString(),
        title: aiData.title || newTitle,
        description: aiData.description || newDescription || "-",
        day: aiData.day || newDay || "Unspecified",
        deadlineDate:
          aiData.date || newDate || new Date().toISOString().split("T")[0],
        deadlineTime: aiData.time || newTime || "00:00",
        status: "Active",
        completed: false,
      };

      setTasks((prev) => [...prev, newTask]);
      showToast("🤖 AI structured your task!", "add");
    } catch (error) {
      // --- LANGKAH DEBUGGING 3: Cek Error Detail ---
      console.error("DETAIL ERROR AI:", error.response ? error.response.data : error.message);
      // -------------------------------------------
      
      console.error("Gemini API error or manual fallback:", error);
      // Jika AI gagal, tambahkan tugas secara manual
      setTasks((prev) => [...prev, manualTask]);
      showToast("🤖 AI failed. Task added manually.", "remove");
    } finally {
      setIsLoading(false);
      setNewTitle("");
      setNewDescription("");
      setNewDay("");
      setNewDate("");
      setNewTime("");
    }
  }, [newTitle, newDescription, newDay, newDate, newTime, showToast]);

  // ✅ Toggle Completed + Toast + Sound
  const handleToggleCompleted = (index) => {
    setTasks((prev) =>
      prev.map((t, i) => {
        if (i === index) {
          const updated = { ...t, completed: !t.completed };
          showToast(
            updated.completed ? "✅ Task completed!" : "↩️ Task undone",
            updated.completed ? "add" : "remove"
          );
          return updated;
        }
        return t;
      })
    );
  };

  // 🗑️ Delete Task
  const handleRemoveTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    showToast("🗑️ Task removed", "remove");
  };

  // 🎹 Keyboard Shortcuts
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Enter" && !showShortcutModal && !isLoading) handleAddTask(); // Jangan tambah jika sedang loading
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleDarkMode();
      }
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        setShowShortcutModal((v) => !v);
      }
      if (e.key === "Escape") setShowShortcutModal(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [handleAddTask, toggleDarkMode, showShortcutModal, isLoading]); // Tambahkan isLoading

  // 🧮 Deadline Countdown
  const getTimeLeft = useCallback((date, time) => {
    const target = new Date(`${date}T${time}`);
    const diff = target - new Date();
    if (diff <= 0) return { text: "⏰ Deadline passed!", urgent: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return {
      text: `${hours}h ${minutes}m left`,
      urgent: diff <60 * 60 * 1000,
    };
  }, []);

  // ⏰ Auto warning
  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach((t) => {
        const { urgent } = getTimeLeft(t.deadlineDate, t.deadlineTime);
        if (urgent && !t.completed) {
          showToast(`⚠️ Deadline soon: ${t.title}`, "deadline");
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks, getTimeLeft, showToast]);

  // 🎨 Themes
  const theme = isDarkMode
    ? {
        bg: "bg-[#0a0a1a]",
        card: "bg-white/10 border-white/20 text-white",
        text: "text-white",
        accent: "from-cyan-400 via-blue-400 to-purple-500",
      }
    : {
        bg: "bg-gradient-to-br from-pink-100 via-white to-blue-100",
        card: "bg-white border-gray-300 text-gray-800",
        text: "text-gray-800",
        accent: "from-pink-400 via-purple-400 to-blue-400",
      };

  return (
    <div
      className={`relative flex flex-col items-center min-h-screen transition-colors duration-700 ${theme.bg}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* 🌈 Header */}
      <header className="w-full text-center py-6">
        <motion.h1
          className={`text-6xl font-extrabold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent animate-gradient`}
          style={{
            backgroundSize: "300% 300%",
            animation: "gradientMove 6s ease infinite",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          To-Do The List App
        </motion.h1>

        <motion.button
          onClick={() => toggleDarkMode()}
          whileHover={{ scale: 1.1 }}
          className="relative mt-4 text-sm font-semibold uppercase tracking-widest group"
        >
          <span
            className={`${
              isDarkMode ? "text-cyan-300" : "text-blue-600"
            } group-hover:opacity-80 transition`}
          >
            Toggle {isDarkMode ? "Light" : "Dark"} Mode
          </span>
        </motion.button>
      </header>

      {/* 🧭 Quick Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-6 mb-6 mt-2">
        {["All", "Active", "Completed"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative text-sm font-semibold ${
              filter === tab
                ? "text-cyan-400"
                : isDarkMode
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {tab}
            {filter === tab && (
              <motion.div
                layoutId="filter-underline"
                className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.accent}`}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ✍️ Input Fields */}
      <motion.div
        className="flex flex-col items-center gap-3 mb-12 mt-4 w-full max-w-xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          className={`w-full p-4 rounded-2xl ${theme.card} placeholder-gray-400 focus:ring-2 focus:ring-cyan-400`}
          placeholder="Task Title (e.g., 'Rapat tim besok jam 10 pagi')"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isLoading} // Nonaktifkan saat loading
        />
        <textarea
          rows="2"
          className={`w-full p-4 rounded-2xl ${theme.card} placeholder-gray-400 focus:ring-2 focus:ring-blue-400`}
          placeholder="Description (Opsional, AI bisa bantu isi)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isLoading}
        />
        <div className="grid grid-cols-3 gap-3 w-full">
          <input
            type="text"
            placeholder="Day (Opsional)"
            className={`p-3 rounded-2xl ${theme.card} placeholder-gray-400`}
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="date"
            className={`p-3 rounded-2xl ${theme.card}`}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="time"
            className={`p-3 rounded-2xl ${theme.card}`}
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {/* 4. Modifikasi Tombol Add Task */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddTask}
          disabled={isLoading}
          className={`px-6 py-3 rounded-full text-white font-semibold shadow-lg bg-gradient-to-r ${
            theme.accent
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "🤖 Processing..." : "+ Add Task"}
        </motion.button>
      </motion.div>

      {/* 📋 Task List */}
      <main className="w-full max-w-3xl px-6 pb-20">
        <Reorder.Group axis="y" values={tasks} onReorder={setTasks}>
          <AnimatePresence>
            {tasks
              .filter((t) =>
                filter === "All"
                  ? true
                  : filter === "Active"
                  ? !t.completed
                  : t.completed
              )
              .map((task, index) => {
                const { text, urgent } = getTimeLeft(
                  task.deadlineDate,
                  task.deadlineTime
                );
                return (
                  <Reorder.Item
                    key={task.id}
                    value={task}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-5 mb-4 rounded-2xl ${theme.card} border backdrop-blur-md shadow-lg`}
                  >
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-2xl font-bold ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-xs ${
                          urgent ? "text-red-400" : "text-cyan-300"
                        }`}
                      >
                        {urgent ? "⚠️ Urgent" : task.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm opacity-80">
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {task.day} | {task.deadlineDate} | 🕒{" "}
                      {task.deadlineTime}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        urgent ? "text-red-400" : "text-cyan-400"
                      }`}
                    >
                      ⏰ {text}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleRemoveTask(index)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleToggleCompleted(index)}
                        className={`px-4 py-2 text-white rounded-lg ${
                          task.completed
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {task.completed ? "Undo" : "Done"}
                      </button>
                    </div>
                  </Reorder.Item>
                );
              })}
          </AnimatePresence>
        </Reorder.Group>
      </main>

      {/* 💬 Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
              toast.type === "add"
                ? "bg-green-600"
                : toast.type === "remove"
                ? "bg-red-600"
                : "bg-yellow-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎹 Shortcut Modal */}
      <AnimatePresence>
        {showShortcutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowShortcutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 border border-white/20 text-white rounded-2xl p-6 w-[340px] shadow-2xl"
            >
              <h2 className="text-lg font-semibold mb-4">🎹 Shortcut Keys</h2>
              <ul className="text-sm space-y-2 text-gray-200">
                <li>
                  <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd> →
                  Tambah Task
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + M</kbd> →
                  Toggle Dark Mode
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + /</kbd> →
                  Tampilkan Shortcut
                </li>
                <li>
                  <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> → Tutup
                  Modal
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 Footer */}
      <footer className="mt-auto mb-6 text-sm text-gray-500">
        Made with ⚡ by Alystio Steven Xiang
      </footer>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default App;