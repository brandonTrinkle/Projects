import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', { username, password });
      navigate('/login');
    } catch (err) {
      alert('Registration failed!');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input placeholder="Username" required onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" required onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
