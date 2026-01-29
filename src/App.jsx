import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Billing from './pages/Billing';
import Spaces from './pages/Spaces';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/newac" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/bookings" element={
            <PrivateRoute>
              <Layout>
                <Bookings />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/billing" element={
            <PrivateRoute>
              <Layout>
                <Billing />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/spaces" element={
            <PrivateRoute>
              <Layout>
                <Spaces />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/expenses" element={
            <PrivateRoute>
              <Layout>
                <Expenses />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
