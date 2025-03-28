import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input placeholder="Username" required onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" required onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
