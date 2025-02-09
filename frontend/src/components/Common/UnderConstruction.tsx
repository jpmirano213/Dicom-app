import { Box, Typography, Button } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import React from "react";

const UnderConstruction: React.FC = () => {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="grey.100">
        <Box textAlign="center" p={3}>
          <ConstructionIcon sx={{ fontSize: 80, color: "grey.700", animation: "bounce 1.5s infinite" }} />
          <Typography variant="h4" fontWeight="bold" mt={2}>Page Under Construction</Typography>
          <Typography variant="body1" mt={1} color="grey.600">
            We're working hard to bring you something amazing. Stay tuned!
          </Typography>
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => (window.location.href = "/")}>Return Home</Button>
        </Box>
      </Box>
    );
  };
  
  export default UnderConstruction;