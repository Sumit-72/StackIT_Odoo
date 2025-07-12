import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Ask from './pages/Ask';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionDetail from './pages/QuestionDetail';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 