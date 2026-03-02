import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './store';
import Login from './pages/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function ProtectedRoute() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <Header onUploadClick={() => {/* TODO: open upload modal */}} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Browse() {
  const { viewMode } = useStore();
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Files</h2>
      <p className="text-gray-500">
        {viewMode === 'grid' ? 'Grid' : 'List'} view — file browser coming in Phase 6
      </p>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Browse />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
