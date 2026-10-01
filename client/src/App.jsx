import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import IOCExplorer from "./pages/IOCExplorer";
import IOCDetails from "./pages/IOCDetails";
import Feeds from "./pages/Feeds";
import Investigations from "./pages/Investigations";
import InvestigationDetails from "./pages/InvestigationDetails";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/iocs"
          element={
            <ProtectedRoute>
              <IOCExplorer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/iocs/:id"
          element={
            <ProtectedRoute>
              <IOCDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feeds"
          element={
             <ProtectedRoute>
               <Feeds />
            </ProtectedRoute>
          }
        />
  <Route
  path="/investigations"
  element={
    <ProtectedRoute>
      <Investigations />
    </ProtectedRoute>
  }
/>
<Route
  path="/investigations/:id"
  element={
    <ProtectedRoute>
      <InvestigationDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/audit-logs"
  element={
    <ProtectedRoute>
      <AuditLogs />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;