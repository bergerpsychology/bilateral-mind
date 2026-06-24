import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("home");
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [mode, setMode] = useState("self");
  const [technique, setTechnique] = useState(null);
  const [assessmentStep, setAssessmentStep] = useState(1);
const [passCount, setPassCount] = useState(0);
const [passesPerSet, setPassesPerSet] = useState(24);
 const [users, setUsers] = useState([
  {
    id: 1,
    name: "Dr. Corinne Berger",
    email: "corinne@example.com",
    role: "therapist",
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    role: "patient",
  },
  {
    id: 3,
    name: "Jane Wilson",
    email: "jane@example.com",
    role: "patient",
  },
  {
    id: 4,
    name: "Robert Lee",
    email: "robert@example.com",
    role: "patient",
  },
]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "patient",
  });

  const techniques = [
    {
      id: "standard",
      name: "Standard EMDR",
      description: "Structured EMDR protocol using bilateral stimulation.",
    },
    {
      id: "floatback",
      name: "Floatback",
      description: "Trace current distress back to earlier related memories.",
    },
    {
      id: "container",
      name: "Container",
      description: "Temporarily contain distressing material.",
    },
    {
      id: "safe-calm",
      name: "Safe / Calm Place",
      description: "Establish a stabilizing internal image.",
    },
    {
      id: "presenting-memory",
      name: "Presenting Memory",
      description: "Open the presenting-memory clinical setup sequence.",
    },
  ];

  const steps = [
    "Presenting Memory",
    "Negative Cognition",
    "Positive Cognition",
    "VOC Rating",
    "Emotions",
    "SUD Rating",
    "Begin Bilateral Stimulation",
  ];

  const selectedTechnique = techniques.find((t) => t.id === technique);

  function addUser() {
    if (!newUser.name || !newUser.email) return;

    setUsers([
      ...users,
      {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    ]);

    setNewUser({
      name: "",
      email: "",
      role: "patient",
    });
  }

  function openSession(selectedMode, selectedTechniqueId) {
  setMode(selectedMode);
  setTechnique(selectedTechniqueId);
  setRunning(false);
  setAssessmentStep(1);
  setPassCount(0);

  switch (selectedTechniqueId) {
    case "standard":
      setPassesPerSet(24);
      break;

    case "floatback":
      setPassesPerSet(16);
      break;

    case "container":
      setPassesPerSet(10);
      break;

    case "safe-calm":
      setPassesPerSet(16);
      break;

    case "presenting-memory":
      setPassesPerSet(24);
      break;

    default:
      setPassesPerSet(24);
  }

  setPage("session");
}

  function goBackHome() {
    setRunning(false);
    setTechnique(null);
    setPage("home");
  }

  const animationDuration = Math.max(0.6, 6 - speed * 0.25);
const handlePassComplete = () => {
  setPassCount((prev) => {
    const next = prev + 1;

    if (next >= passesPerSet) {
      setRunning(false);
    }

    return next;
  });
};
  const StimulationControls = () => (
    <>
      <style>
        {`
          @keyframes bilateralMove {
            0% {
              left: 0%;
            }
            50% {
              left: calc(100% - 48px);
            }
            100% {
              left: 0%;
            }
          }
        `}
      </style>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex justify-between mb-2">
          <label className="text-blue-100">Speed</label>
          <span className="text-blue-300">{speed}</span>
        </div>

        <input
          type="range"
          min="1"
          max="20"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setRunning(true)}
          className="bg-emerald-500 hover:bg-emerald-400 px-8 py-3 rounded-xl font-semibold"
        >
          Start
        </button>

        <button
          onClick={() => setRunning(false)}
          className="bg-rose-500 hover:bg-rose-400 px-8 py-3 rounded-xl font-semibold"
        >
          Pause
        </button>
      </div>
<div className="text-center mb-4">
  <div className="text-blue-200 font-medium">
    Passes: {passCount} / {passesPerSet}
  </div>
</div>
<div className="relative h-48 w-full max-w-5xl mx-auto bg-slate-950/80 border border-blue-400/20 rounded-3xl overflow-hidden">
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-blue-400/30 rounded-full" />

        <div
          className="absolute top-1/2 w-12 h-12 bg-blue-400 rounded-full shadow-lg shadow-blue-400/60"
            onAnimationIteration={handlePassComplete}
          style={{
            transform: "translateY(-50%)",
            animation: `bilateralMove ${animationDuration}s linear infinite`,
            animationPlayState: running ? "running" : "paused",
          }}
        />
      </div>
    </>
  );

  const PresentingMemoryPanel = () => (
    <div className="max-w-3xl mx-auto mb-10 bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
      <div className="text-center mb-5">
        <div className="text-sm text-blue-300 mb-2">
          Presenting Memory Setup
        </div>

        <div className="text-2xl font-semibold">
          {steps[assessmentStep - 1]}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setAssessmentStep((step) => Math.max(1, step - 1))}
          className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl"
        >
          Back
        </button>

        <button
          onClick={() => setAssessmentStep((step) => Math.min(7, step + 1))}
          className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Bilateral Mind
          </h1>
          <p className="text-blue-200 mt-3">
            EMDR bilateral stimulation platform
          </p>
        </header>

        {page === "home" && (
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-center gap-4 mb-10">
              <button
                onClick={() => setMode("self")}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  mode === "self"
                    ? "bg-blue-500 shadow-lg shadow-blue-500/30"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                Self-Guided
              </button>

              <button
                onClick={() => setMode("clinical")}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  mode === "clinical"
                    ? "bg-indigo-500 shadow-lg shadow-indigo-500/30"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                Remote Clinical
              </button>
            </div>

            {mode === "self" ? (
              <div className="max-w-3xl mx-auto bg-slate-900/70 border border-blue-400/20 rounded-2xl p-6 text-center">
                <h2 className="text-2xl font-semibold mb-3">
                  Self-Guided Standard EMDR
                </h2>

                <p className="text-blue-200 mb-6">
                  Self-guided mode uses Standard EMDR only.
                </p>

                <button
                  onClick={() => openSession("self", "standard")}
                  className="bg-blue-500 hover:bg-blue-400 px-8 py-3 rounded-xl font-semibold"
                >
                  Open Standard EMDR
                </button>
              </div>
            ) : (
              <>
                <div className="max-w-3xl mx-auto mb-10 bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
                  <h2 className="text-2xl font-semibold mb-4">
                    Patient / User Management
                  </h2>

                  <div className="grid gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    />

                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                    >
                      <option value="patient">Patient</option>
                      <option value="therapist">Therapist</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      onClick={addUser}
                      className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-xl font-semibold"
                    >
                      Add User
                    </button>
                  </div>

                  <div className="space-y-3">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3"
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-sm text-blue-200">{u.email}</div>
                        </div>

                        <span className="text-sm bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-4xl mx-auto bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
                  <h2 className="text-2xl font-semibold mb-4">
                    Select Clinical Technique
                  </h2>

                  <div className="grid md:grid-cols-2 gap-3">
                    {techniques.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openSession("clinical", t.id)}
                        className="text-left p-4 rounded-xl border bg-slate-800 border-slate-700 hover:border-blue-400/60 transition"
                      >
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-blue-200 mt-1">
                          {t.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {page === "session" && (
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={goBackHome}
              className="mb-8 bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl"
            >
              Back
            </button>

            <div className="text-center mb-8">
              <div className="text-sm text-blue-300 mb-2">
                {mode === "self" ? "Self-Guided Mode" : "Remote Clinical Mode"}
              </div>

              <h2 className="text-3xl font-semibold">
                {selectedTechnique?.name}
              </h2>

              <p className="text-blue-200 mt-2">
                {selectedTechnique?.description}
              </p>
            </div>

            {mode === "clinical" && technique === "presenting-memory" && (
              <PresentingMemoryPanel />
            )}

            <StimulationControls />
          </div>
        )}
      </div>
    </div>
  );
}