import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/register";
import AppLayout from "./layouts/AppLayout";
import Exercises from "./pages/exercises";
import Me from "./pages/me";
import Routines from "./pages/routines/routines";
import RoutineDetail from "./pages/routines/routineDetail";
import RoutineForm from "./pages/routines/routineForm";
import RoutineDaysDetail from "./pages/routines/routinesDays/routineDaysDetail";
import RoutineDaysForm from "./pages/routines/routinesDays/routineDaysForm";
import RoutineExerciseForm from "./pages/routines/routinesDays/routinesExercises.tsx/routineExerciseForm";
import RoutineExerciseDetail from "./pages/routines/routinesDays/routinesExercises.tsx/routineExerciseDetail";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/me" element={<Me />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/routines/:id" element={<RoutineDetail />} />
        <Route path="/routines/new" element={<RoutineForm />} />
        <Route path="/routines/update/:id" element={<RoutineForm />} />
        <Route
          path="/routines/:id/days/:dayId"
          element={<RoutineDaysDetail />}
        />
        <Route path="/routines/:id/days/new" element={<RoutineDaysForm />} />
        <Route
          path="/routines/:id/days/:dayId/update"
          element={<RoutineDaysForm />}
        />
        <Route
          path="/routines/:id/days/:dayId/exercises/new"
          element={<RoutineExerciseForm />}
        />
        <Route
          path="/routines/:id/days/:dayId/exercises/:exerciseId"
          element={<RoutineExerciseDetail />}
        />
        <Route
          path="/routines/:id/days/:dayId/exercises/:exerciseId/update"
          element={<RoutineExerciseForm />}
        />
      </Route>
    </Routes>
  );
}

export default App;
