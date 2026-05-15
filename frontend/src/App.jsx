import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useContext } from "react"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import History from "./pages/History"
import AnalysisDetails from "./pages/AnalysisDetails"

import ProtectedRoute from "./routes/ProtectedRoute"
import { AuthContext } from "./context/AuthContext"

function App() {

  const { accessToken } = useContext(AuthContext)

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={accessToken ? <Navigate to="/dashboard" /> : <Login />} />

        <Route
          path="/register"
          element={accessToken ? <Navigate to="/dashboard" /> : <Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis/:id"
          element={
            <ProtectedRoute>
              <AnalysisDetails />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App