import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import AdminPanel from './pages/AdminPanel';
import JumbleAnswer from './pages/JumbleAnswer';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/jumble/:word" element={<JumbleAnswer />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;