import { useEffect, useState } from "react";
import CloudShader from "./components/ui/cloud-shader";

type Task = {
  id: number;
  text: string;
  completed: boolean;
  day: "today" | "tomorrow";
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("focus-sky-tasks");

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [selectedDay, setSelectedDay] =
    useState<"today" | "tomorrow">("today");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("focus-sky-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const text = input.trim();

    if (!text) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text,
        completed: false,
        day: selectedDay,
      },
    ]);

    setInput("");
  };

  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );

    if (editingId === id) {
      setEditingId(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: number) => {
    const text = editText.trim();

    if (!text) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, text }
          : task
      )
    );

    setEditingId(null);
    setEditText("");
  };

  const clearCompleted = () => {
    setTasks((current) =>
      current.filter(
        (task) =>
          task.day !== selectedDay || !task.completed
      )
    );
  };

  const visibleTasks = tasks.filter(
    (task) => task.day === selectedDay
  );

  const completed = visibleTasks.filter(
    (task) => task.completed
  ).length;

  const progress =
    visibleTasks.length === 0
      ? 0
      : Math.round(
          (completed / visibleTasks.length) * 100
        );

  const now = new Date();

  const todayText = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const tomorrowText = tomorrow.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const hour = now.getHours();
  const isNight = hour >= 19 || hour < 6;

  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white">

      {/* Animated sky */}
      <div className="absolute inset-0">
        <CloudShader
          className="h-full w-full"
          skyTopColor={
            isNight ? "#10182f" : "#3876ba"
          }
          skyBottomColor={
            isNight ? "#35446f" : "#8cbfe8"
          }
          cloudColor={
            isNight ? "#d9def0" : "#fbf8f2"
          }
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* App */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-10">

        {/* Header */}
        <header className="mb-7 text-center">

          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-white/70">
            {isNight ? "Good evening" : "Good day"}
          </p>

          <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg">
            FocusSky
          </h1>

          <p className="mt-3 text-white/80">
            Plan your day. Clear your mind.
          </p>

        </header>

        {/* Main card */}
        <section className="rounded-3xl border border-white/20 bg-white/15 p-5 shadow-2xl backdrop-blur-xl">

          {/* Day selector */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-black/10 p-1">

            <button
              onClick={() => setSelectedDay("today")}
              className={`rounded-xl px-4 py-3 transition ${
                selectedDay === "today"
                  ? "bg-white text-sky-700 shadow"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="font-semibold">
                Today
              </div>

              <div className="text-xs opacity-60">
                {todayText}
              </div>
            </button>

            <button
              onClick={() => setSelectedDay("tomorrow")}
              className={`rounded-xl px-4 py-3 transition ${
                selectedDay === "tomorrow"
                  ? "bg-white text-sky-700 shadow"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="font-semibold">
                Tomorrow
              </div>

              <div className="text-xs opacity-60">
                {tomorrowText}
              </div>
            </button>

          </div>

          {/* Progress */}
          <div className="mb-6">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-white/70">
                {selectedDay === "today"
                  ? "Today's progress"
                  : "Tomorrow's plan"}
              </span>

              <span className="font-semibold">
                {completed}/{visibleTasks.length}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/20">

              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* Add task */}
          <div className="mb-5 flex gap-2">

            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask();
                }
              }}
              placeholder={
                selectedDay === "today"
                  ? "What needs to be done today?"
                  : "Plan something for tomorrow..."
              }
              className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white outline-none placeholder:text-white/50 focus:border-white/50"
            />

            <button
              onClick={addTask}
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-sky-700 transition hover:scale-105 active:scale-95"
            >
              Add
            </button>

          </div>

          {/* Task actions */}
          {visibleTasks.some(
            (task) => task.completed
          ) && (
            <div className="mb-4 flex justify-end">

              <button
                onClick={clearCompleted}
                className="text-xs text-white/60 transition hover:text-white"
              >
                Clear completed
              </button>

            </div>
          )}

          {/* Tasks */}
          <div className="space-y-2">

            {visibleTasks.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-white/25 px-5 py-10 text-center">

                <div className="mb-3 text-4xl">
                  {selectedDay === "today"
                    ? "☁️"
                    : "🌤️"}
                </div>

                <p className="font-medium">
                  {selectedDay === "today"
                    ? "Your day is clear."
                    : "Nothing planned yet."}
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Add a task above to get started.
                </p>

              </div>

            ) : (

              visibleTasks.map((task) => (

                <div
                  key={task.id}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md transition hover:bg-white/20"
                >

                  {editingId === task.id ? (

                    <div className="flex gap-2">

                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) =>
                          setEditText(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEdit(task.id);
                          }

                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/15 px-3 py-2 outline-none"
                      />

                      <button
                        onClick={() =>
                          saveEdit(task.id)
                        }
                        className="rounded-xl bg-white px-3 text-sm font-semibold text-sky-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          setEditingId(null)
                        }
                        className="rounded-xl bg-white/10 px-3 text-sm"
                      >
                        Cancel
                      </button>

                    </div>

                  ) : (

                    <div className="flex items-center gap-3">

                      {/* Complete */}
                      <button
                        onClick={() =>
                          toggleTask(task.id)
                        }
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          task.completed
                            ? "border-white bg-white text-sky-600"
                            : "border-white/50"
                        }`}
                      >
                        {task.completed && "✓"}
                      </button>

                      {/* Text */}
                      <span
                        className={`min-w-0 flex-1 break-words ${
                          task.completed
                            ? "text-white/50 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.text}
                      </span>

                      {/* Edit */}
                      <button
                        onClick={() =>
                          startEditing(task)
                        }
                        className="rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          deleteTask(task.id)
                        }
                        className="rounded-lg px-2 py-1 text-white/50 transition hover:bg-white/10 hover:text-white"
                      >
                        ×
                      </button>

                    </div>

                  )}

                </div>

              ))

            )}

          </div>

          {/* Completion */}
          {visibleTasks.length > 0 &&
            completed === visibleTasks.length && (
              <div className="mt-5 rounded-2xl bg-white/20 p-4 text-center">

                <div className="text-2xl">
                  ☀️
                </div>

                <p className="mt-1 font-semibold">
                  {selectedDay === "today"
                    ? "Clear sky!"
                    : "Tomorrow is ready!"}
                </p>

                <p className="text-sm text-white/70">
                  Everything is organized.
                </p>

              </div>
            )}

        </section>

        <p className="mt-auto pt-8 text-center text-xs text-white/50">
          Your tasks are saved automatically on this device.
        </p>

      </div>
    </main>
  );
}

export default App;