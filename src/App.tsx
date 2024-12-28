import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import AdminPanel from './pages/AdminPanel';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>// ... keep existing code (home page content)</div>} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/jumble/:word" element={<JumbleAnswer />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;