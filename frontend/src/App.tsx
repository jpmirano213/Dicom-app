import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DataTable from "./components/Datatable/Datatable";
import FileUpload from "./components/FileUpload/FileUpload";
import FileViewer from "./components/FileViewer/FileViewer";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Settings from "./pages/Settings";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DataTable />} />
          <Route path="upload" element={<FileUpload />} />
          <Route path="view" element={<FileViewer />} />
          {/* <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
