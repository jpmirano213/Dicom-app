import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      {/* Fixed Header at the top */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar + Main Content Wrapper */}
      <Box sx={{ display: "flex", flexGrow: 1, marginTop: "64px" }}>
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            ml: sidebarOpen ? "240px" : "60px",
            transition: "margin 0.3s",
            width: "100%", // Ensures responsiveness
            mx: "auto", // Centers the content horizontally
            height: "calc(100vh - 64px)", // Adjust height to account for the header
            overflowY: "auto", // Enables scrolling if content overflows
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
