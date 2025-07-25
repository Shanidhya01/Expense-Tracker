import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Home from './pages/Dashboard/Home';
import Income from './pages/Dashboard/Income';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Expense from './pages/Dashboard/Expense';
import Logout from './pages/Dashboard/Logout';
import UserProvider from './context/UserContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<Root />} />
            <Route path='/login' exact element={<Login />} />
            <Route path='/signUp' exact element={<SignUp />} />
            <Route path='/dashboard' exact element={<Home />} />
            <Route path='/income' exact element={<Income />} />
            <Route path='/expense' exact element={<Expense />} />
            <Route path='/logout' exact element={<Logout />} />
          </Routes>
        </Router>
      </div>
      <Toaster 
        toastOptions={{
          className: '',
          style: {
            fontSize: '14px',
          },
        }}
      />
    </UserProvider>
  )
}

export default App


const Root = () => {
  // check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // Redirect to dashboard if authenticated 
  return isAuthenticated ? (
    <Navigate to ="/dashboard" />
  ) : (
    <Navigate to = "/login" />
  );
};