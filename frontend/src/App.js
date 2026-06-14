import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";
import Chatbot from "./components/Chatbot";

import Home      from "./pages/Home";
import About     from "./pages/About";
import Volunteer from "./pages/Volunteer";
import Donate    from "./pages/Donate";

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate"    element={<Donate />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </Router>
  );
}

export default App;
