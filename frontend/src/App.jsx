import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RiskMetrics from './pages/RiskMetrics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*burada navigation yönlendirme işi yaptık.*/}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="risk-metrikleri" element={<RiskMetrics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
