import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import NewsList from './components/NewsList';
import Subscription from './components/Subscription';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} /> {/* 登录路由 */}
          <Route path="/register" element={<Register />} /> {/* 注册路由 */}
          <Route path="/news" element={<NewsList />} /> {/* 资讯路由 */}
          <Route path="/subscribe" element={<Subscription />} /> {/* 订阅路由 */}
          <Route path="/" element={<Login />} /> {/* 默认路由 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;