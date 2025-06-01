import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductInput } from './pages/ProductInput';
import { IncidentReview } from './pages/IncidentReview';
import { FeedbackLoop } from './pages/FeedbackLoop';
import { CoAnalysisPage } from './pages/CoAnalysisPage';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductInput />} />
          <Route path="/products/:productId/incidents" element={<IncidentReview />} />
          <Route path="/feedback" element={<FeedbackLoop />} />
          <Route path="/co-analysis" element={<CoAnalysisPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 