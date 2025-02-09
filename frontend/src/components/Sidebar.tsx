import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import DashboardIcon from "@mui/icons-material/Dashboard";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import WindowIcon from "@mui/icons-material/Window";


interface SidebarProps {
  open: boolean;
}

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Upload", icon: <FileUploadIcon />, path: "/upload" },
  { text: "AR View", icon: <ViewInArIcon />, path: "/arview" },
  { text: "View", icon: <OpenInFullIcon />, path: "/view" },
  { text: "Grid", icon: <WindowIcon />, path: "/grid" }
];
const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation(); // Get current path

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? 150 : 60,
        flexShrink: 0,
        transition: "width 0.3s",
        [`& .MuiDrawer-paper`]: {
          width: open ? 150 : 60,
          top: "64px",
          height: "calc(100vh - 64px)",
          overflowX: "hidden",
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <Tooltip title={!open ? item.text : ""} placement="right" key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  justifyContent: open ? "initial" : "center",
                  backgroundColor: location.pathname === item.path ? "rgba(0, 0, 0, 0.1)" : "transparent", // Grey background for active page
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.15)" }, // Slightly darker on hover
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, marginLeft: 2 }} />}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
