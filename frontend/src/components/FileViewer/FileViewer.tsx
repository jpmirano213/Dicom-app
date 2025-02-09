import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneMath from "cornerstone-math";
import * as dicomParser from "dicom-parser";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from "@mui/material";

// ✅ Assign external dependencies to `cornerstoneWADOImageLoader`
(cornerstoneWADOImageLoader as any).external.cornerstone = cornerstone;
(cornerstoneWADOImageLoader as any).external.dicomParser = dicomParser;
(cornerstoneWADOImageLoader as any).external.cornerstoneMath = cornerstoneMath;

const FileViewer: React.FC = () => {
  const [files, setFiles] = useState<
    { fileid: number; filepath: string; filename: string; patientName: string; birthdate: string; seriesName: string }[]
  >([]);
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string | null }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dicomViewerRef = useRef<HTMLDivElement | null>(null);
  const [viewerSize, setViewerSize] = useState<number>(512);

  // ✅ Handle resizing dynamically
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth * 0.7; // Make the viewer 70% of screen width
      const size = Math.max(300, Math.min(width, 800)); // Clamp between 300px and 800px
      setViewerSize(size);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ✅ Fetch all files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.post("http://localhost:3001/graphql", {
          query: `
            {
              getFilesWithDetails {
                fileid
                filepath
                filename
                patientName
                birthdate
                seriesName
              }
            }
          `,
        });

        setFiles(response.data.data.getFilesWithDetails);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  // ✅ Generate thumbnails for each DICOM file
  useEffect(() => {
    const generateThumbnails = async () => {
      const newThumbnails: { [key: string]: string | null } = {};

      for (const file of files) {
        try {
          const imageId = `wadouri:http://localhost:3001/files/${file.filepath}`;
          const image = await cornerstone.loadImage(imageId);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = 128;
            canvas.height = 128;
            cornerstone.renderToCanvas(canvas, image);
            newThumbnails[file.filepath] = canvas.toDataURL();
          }
        } catch (error) {
          console.error(`Error generating thumbnail for ${file.filename}:`, error);
          newThumbnails[file.filepath] = null;
        }
      }

      setThumbnails(newThumbnails);
    };

    if (files.length > 0) {
      generateThumbnails();
    }
  }, [files]);

  // ✅ Load the selected DICOM image
  const loadDicomImage = async (filePath: string) => {
    try {
      setLoading(true);
      setSelectedFile(filePath);

      const imageId = `wadouri:http://localhost:3001/files/${filePath}`;
      const element = dicomViewerRef.current;
      if (!element) return;

      cornerstone.enable(element);
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(element, image);

      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading DICOM image:", error);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar - List of Files with Thumbnails */}
      <Paper elevation={3} sx={{ width: "25%", p: 2, overflowY: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          DICOM Files
        </Typography>
        <List>
          {files.map((file) => (
            <React.Fragment key={file.fileid}>
              <ListItem button onClick={() => loadDicomImage(file.filepath)} sx={{ display: "flex", alignItems: "center" }}>
                {/* Thumbnail */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 2,
                    border: "1px solid gray",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ddd",
                  }}
                >
                  {thumbnails[file.filepath] ? (
                    <img src={thumbnails[file.filepath]!} alt="Thumbnail" width="64" height="64" />
                  ) : (
                    <Typography variant="body2">No Image</Typography>
                  )}
                </Box>

                {/* File Info */}
                <ListItemText
                  primary={file.filename}
                  secondary={`Patient: ${file.patientName} • ${file.birthdate} • ${file.seriesName}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* DICOM Viewer */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          ref={dicomViewerRef}
          sx={{
            width: viewerSize,
            height: viewerSize,
            border: "2px solid black",
            background: "black",
          }}
        />
        {loading && <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%" }} />}
      </Box>
    </Box>
  );
};

export default FileViewer;
