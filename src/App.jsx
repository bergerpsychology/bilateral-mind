import { useEffect, useMemo, useRef, useState } from "react";

const TECHNIQUES = [
  {
    id: "standard",
    name: "Standard EMDR",
    description: "Structured EMDR protocol using bilateral stimulation.",
    passesPerSet: 24,
  },
  {
    id: "floatback",
    name: "Floatback",
    description: "Trace current distress back to earlier related memories.",
    passesPerSet: 16,
  },
  {
    id: "container",
    name: "Container",
    description: "Temporarily contain distressing material.",
    passesPerSet: 10,
  },
  {
    id: "safe-calm",
    name: "Safe / Calm Place",
    description: "Establish a stabilizing internal image.",
    passesPerSet: 16,
  },
  {
    id: "presenting-memory",
    name: "Presenting Memory",
    description: "Open the presenting-memory clinical setup sequence.",
    passesPerSet: 24,
  },
];

const ASSESSMENT_STEPS = [
  {
    title: "Presenting Memory",
    prompt:
      "What picture represents the worst part of this incident? If no picture comes up, what do you notice when you think of it?",
  },
  {
    title: "Negative Cognition",
    prompt: "What negative belief about yourself goes with that memory?",
  },
  {
    title: "Positive Cognition",
    prompt: "What would you prefer to believe about yourself now?",
  },
  {
    title: "VOC Rating",
    prompt: "When you think about that picture or incident, how true do those words (repeat PC) feel to you now on a scale from 1 to 7, where 1 is completely false and 7 is completely true?",
  },
  {
    title: "Emotions",
    prompt: "What emotions do you notice when you bring up the memory?",
  },
  {
    title: "SUD Rating",
    prompt: "How disturbing does it feel now, from 0 to 10?",
  },
  {
    title: "Begin Bilateral Stimulation",
    prompt: "Begin a short set. Pause if distress becomes overwhelming.",
  },
];

const INITIAL_USERS = [
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
];

export default function App() {
  const [page, setPage] = useState("home");
  const [mode, setMode] = useState("self");
  const [techniqueId, setTechniqueId] = useState(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [passCount, setPassCount] = useState(0);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(2);

  const [users, setUsers] = useState(INITIAL_USERS);
  useEffect(() => {
  const savedUsers = localStorage.getItem("bilateral-users");

  if (savedUsers) {
    setUsers(JSON.parse(savedUsers));
  }
}, []);

useEffect(() => {
  localStorage.setItem("bilateral-users", JSON.stringify(users));
}, [users]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "patient",
  });

  const audioContextRef = useRef(null);

  const selectedTechnique = useMemo(
    () => TECHNIQUES.find((technique) => technique.id === techniqueId),
    [techniqueId]
  );

  const selectedPatient = useMemo(
    () => users.find((user) => user.id === Number(selectedPatientId)),
    [users, selectedPatientId]
  );

  const passesPerSet = selectedTechnique?.passesPerSet ?? 24;
  const progress = Math.min(100, Math.round((passCount / passesPerSet) * 100));
  const animationDuration = Math.max(0.45, 6 - speed * 0.25);

  useEffect(() => {
    if (!running) return;

    const intervalId = window.setInterval(() => {
      setSessionSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running]);

  function playTone(frequency = 540) {
    if (!audioEnabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
  }

  function handlePassComplete() {
    setPassCount((previousCount) => {
      const nextCount = previousCount + 1;

      playTone(nextCount % 2 === 0 ? 520 : 660);

      if (nextCount >= passesPerSet) {
        setRunning(false);
        return passesPerSet;
      }

      return nextCount;
    });
  }

  function addUser() {
    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim();

    if (!trimmedName || !trimmedEmail) return;

    const createdUser = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      role: newUser.role,
    };

    setUsers((currentUsers) => [...currentUsers, createdUser]);

    if (createdUser.role === "patient") {
      setSelectedPatientId(createdUser.id);
    }

    setNewUser({
      name: "",
      email: "",
      role: "patient",
    });
  }

  function deleteUser(userId) {
    setUsers((currentUsers) => {
      const updatedUsers = currentUsers.filter((user) => user.id !== userId);
      const patientStillExists = updatedUsers.some(
        (user) => user.id === Number(selectedPatientId)
      );

      if (!patientStillExists) {
        const firstPatient = updatedUsers.find((user) => user.role === "patient");
        setSelectedPatientId(firstPatient?.id ?? "");
      }

      return updatedUsers;
    });
  }

  function openSession(selectedMode, selectedTechniqueId) {
    setMode(selectedMode);
    setTechniqueId(selectedTechniqueId);
    setRunning(false);
    setPassCount(0);
    setSessionSeconds(0);
    setAssessmentStep(0);
    setPage("session");
  }

  function resetSet() {
    setRunning(false);
    setPassCount(0);
    setSessionSeconds(0);
  }

  function goBackHome() {
    setRunning(false);
    setTechniqueId(null);
    setPage("home");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-8">
      <style>{`
        @keyframes bilateralMove {
          0% { left: 0%; }
          50% { left: calc(100% - 48px); }
          100% { left: 0%; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Bilateral Mind
          </h1>
          <p className="text-blue-200 mt-3">
            EMDR bilateral stimulation platform
          </p>
          <p className="text-xs text-slate-400 mt-3 max-w-2xl mx-auto">
            This prototype is not a medical device. Clinical EMDR should be
            conducted by qualified professionals.
          </p>
        </header>

        {page === "home" && (
          <HomePage
            mode={mode}
            setMode={setMode}
            users={users}
            newUser={newUser}
            setNewUser={setNewUser}
            addUser={addUser}
            deleteUser={deleteUser}
            selectedPatientId={selectedPatientId}
            setSelectedPatientId={setSelectedPatientId}
            openSession={openSession}
          />
        )}

        {page === "session" && selectedTechnique && (
          <SessionPage
            mode={mode}
            selectedTechnique={selectedTechnique}
            selectedPatient={selectedPatient}
            running={running}
            setRunning={setRunning}
            speed={speed}
            setSpeed={setSpeed}
            passCount={passCount}
            passesPerSet={passesPerSet}
            progress={progress}
            animationDuration={animationDuration}
            handlePassComplete={handlePassComplete}
            assessmentStep={assessmentStep}
            setAssessmentStep={setAssessmentStep}
            sessionSeconds={sessionSeconds}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            resetSet={resetSet}
            goBackHome={goBackHome}
          />
        )}
      </div>
    </div>
  );
}

function HomePage({
  mode,
  setMode,
  users,
  newUser,
  setNewUser,
  addUser,
  deleteUser,
  selectedPatientId,
  setSelectedPatientId,
  openSession,
}) {
  const patients = users.filter((user) => user.role === "patient");

  return (
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
        <button
  onClick={() => setMode("presenter")}
  className={`px-6 py-3 rounded-xl font-medium transition ${
    mode === "presenter"
      ? "bg-purple-500 shadow-lg shadow-purple-500/30"
      : "bg-slate-800 hover:bg-slate-700"
  }`}
>
  Presenter Mode
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
          <UserManagement
            users={users}
            newUser={newUser}
            setNewUser={setNewUser}
            addUser={addUser}
            deleteUser={deleteUser}
          />

          <div className="max-w-4xl mx-auto mb-8 bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
            <h2 className="text-2xl font-semibold mb-4">Select Patient</h2>

            <select
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} — {patient.email}
                </option>
              ))}
            </select>
          </div>

          <TechniqueSelector
            disabled={patients.length === 0}
            onSelect={(techniqueId) => openSession("clinical", techniqueId)}
          />
        </>
      )}
    </div>
  );
}

function UserManagement({
  users,
  newUser,
  setNewUser,
  addUser,
  deleteUser,
}) {
  return (
    <div className="max-w-4xl mx-auto mb-8 bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
      <h2 className="text-2xl font-semibold mb-4">
        Patient / User Management
      </h2>

      <div className="grid md:grid-cols-[1fr_1fr_160px_auto] gap-3 mb-6">
        <input
          type="text"
          placeholder="Full name"
          value={newUser.name}
          onChange={(event) =>
            setNewUser({ ...newUser, name: event.target.value })
          }
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(event) =>
            setNewUser({ ...newUser, email: event.target.value })
          }
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <select
          value={newUser.role}
          onChange={(event) =>
            setNewUser({ ...newUser, role: event.target.value })
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
          Add
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center gap-4 bg-slate-800 rounded-xl px-4 py-3"
          >
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-blue-200">{user.email}</div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full">
                {user.role}
              </span>

              <button
                onClick={() => deleteUser(user.id)}
                className="text-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-1 rounded-full"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechniqueSelector({ disabled, onSelect }) {
  return (
    <div className="max-w-4xl mx-auto bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
      <h2 className="text-2xl font-semibold mb-4">
        Select Clinical Technique
      </h2>

      {disabled ? (
        <p className="text-slate-300">Add at least one patient first.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {TECHNIQUES.map((technique) => (
            <button
              key={technique.id}
              onClick={() => onSelect(technique.id)}
              className="text-left p-4 rounded-xl border bg-slate-800 border-slate-700 hover:border-blue-400/60 transition"
            >
              <div className="font-semibold">{technique.name}</div>
              <div className="text-sm text-blue-200 mt-1">
                {technique.description}
              </div>
              <div className="text-xs text-slate-400 mt-3">
                {technique.passesPerSet} passes per set
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionPage({
  mode,
  selectedTechnique,
  selectedPatient,
  running,
  setRunning,
  speed,
  setSpeed,
  passCount,
  passesPerSet,
  progress,
  animationDuration,
  handlePassComplete,
  assessmentStep,
  setAssessmentStep,
  sessionSeconds,
  audioEnabled,
  setAudioEnabled,
  resetSet,
  goBackHome,
}) {
  return (
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

        <h2 className="text-3xl font-semibold">{selectedTechnique.name}</h2>

        <p className="text-blue-200 mt-2">{selectedTechnique.description}</p>

        {mode === "clinical" && selectedPatient && (
          <p className="text-sm text-slate-300 mt-3">
            Patient: <span className="font-semibold">{selectedPatient.name}</span>
          </p>
        )}
      </div>

      {mode === "clinical" &&
 selectedTechnique?.id === "presenting-memory" && (
        <AssessmentPanel
          assessmentStep={assessmentStep}
          setAssessmentStep={setAssessmentStep}
        />
      )}

      <StimulationControls
        running={running}
        setRunning={setRunning}
        speed={speed}
        setSpeed={setSpeed}
        passCount={passCount}
        passesPerSet={passesPerSet}
        progress={progress}
        animationDuration={animationDuration}
        handlePassComplete={handlePassComplete}
        sessionSeconds={sessionSeconds}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        resetSet={resetSet}
      />
    </div>
  );
}

function AssessmentPanel({ assessmentStep, setAssessmentStep }) {
  const step = ASSESSMENT_STEPS[assessmentStep];

  return (
    <div className="max-w-3xl mx-auto mb-10 bg-slate-900/70 border border-blue-400/20 rounded-2xl p-5">
      <div className="text-center mb-5">
        <div className="text-sm text-blue-300 mb-2">
          Assessment Step {assessmentStep + 1} of {ASSESSMENT_STEPS.length}
        </div>

        <div className="text-2xl font-semibold">{step.title}</div>

        <p className="text-slate-300 mt-4">{step.prompt}</p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() =>
            setAssessmentStep((currentStep) => Math.max(0, currentStep - 1))
          }
          className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl"
        >
          Back
        </button>

        <button
          onClick={() =>
            setAssessmentStep((currentStep) =>
              Math.min(ASSESSMENT_STEPS.length - 1, currentStep + 1)
            )
          }
          className="bg-blue-500 hover:bg-blue-400 px-6 py-3 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StimulationControls({
  running,
  setRunning,
  speed,
  setSpeed,
  passCount,
  passesPerSet,
  progress,
  animationDuration,
  handlePassComplete,
  sessionSeconds,
  audioEnabled,
  setAudioEnabled,
  resetSet,
}) {
  const minutes = String(Math.floor(sessionSeconds / 60)).padStart(2, "0");
  const seconds = String(sessionSeconds % 60).padStart(2, "0");

  return (
    <>
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
          onChange={(event) => setSpeed(Number(event.target.value))}
          className="w-full accent-blue-400"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => setRunning(true)}
          disabled={passCount >= passesPerSet}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold"
        >
          Start
        </button>

        <button
          onClick={() => setRunning(false)}
          className="bg-rose-500 hover:bg-rose-400 px-8 py-3 rounded-xl font-semibold"
        >
          Pause
        </button>

        <button
          onClick={resetSet}
          className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-semibold"
        >
          Reset
        </button>

        <button
          onClick={() => setAudioEnabled((enabled) => !enabled)}
          className="bg-indigo-500 hover:bg-indigo-400 px-8 py-3 rounded-xl font-semibold"
        >
          Audio: {audioEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between text-sm text-blue-200 mb-2">
          <span>
            Passes: {passCount} / {passesPerSet}
          </span>
          <span>Timer: {minutes}:{seconds}</span>
        </div>

        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all"
            style={{ width: `${progress}%` }}
          />
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

      {passCount >= passesPerSet && (
        <div className="text-center text-emerald-300 mt-6 font-semibold">
          Set complete ✔️
        </div>
      )}
    </>
  );
}