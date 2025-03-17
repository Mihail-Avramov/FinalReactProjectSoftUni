// src/App.jsx
import React from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import './assets/styles/main.css';

function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

export default App;