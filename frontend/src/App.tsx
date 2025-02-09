import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DataTable from "./components/Datatable/Datatable";
import FileUpload from "./components/FileUpload/FileUpload";
import FileViewer from "./components/FileViewer/FileViewer";
import UnderConstruction from "./components/Common/UnderConstruction";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DataTable />} />
          <Route path="upload" element={<FileUpload />} />
          <Route path="view" element={<FileViewer />} />
          <Route path="arview" element={<UnderConstruction />} />
          <Route path="grid" element={<UnderConstruction />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
