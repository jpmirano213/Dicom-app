import React from "react";
import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // Import Account Balance Icon

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left Side: Menu Icon + Account Balance */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Menu Icon */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{
              background: "transparent",
              "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
              "&:focus": { outline: "none" }
            }}
            disableRipple
          >
            <MenuIcon />
          </IconButton>

          {/* Account Balance Icon */}
          <IconButton color="inherit">
            <AccountBalanceIcon />
          </IconButton>
        </Box>

        {/* Right Side: Notifications */}
        <Box>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
