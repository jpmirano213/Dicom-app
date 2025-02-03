import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneMath from "cornerstone-math";
import * as dicomParser from "dicom-parser";
import { Box, Typography, Select, MenuItem, CircularProgress } from "@mui/material";

// ✅ Assign external dependencies to `cornerstoneWADOImageLoader`
(cornerstoneWADOImageLoader as any).external.cornerstone = cornerstone;
(cornerstoneWADOImageLoader as any).external.dicomParser = dicomParser;
(cornerstoneWADOImageLoader as any).external.cornerstoneMath = cornerstoneMath;

const FileViewer: React.FC = () => {
  const [series, setSeries] = useState<{ seriesid: number; seriesdescription: string }[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [files, setFiles] = useState<{ fileid: number; filepath: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dicomViewerRef = useRef<HTMLDivElement | null>(null);
  const [viewerSize, setViewerSize] = useState<number>(512); // Default size

  // ✅ Handle resizing dynamically
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth * 0.8; // Make the viewer 80% of screen width
      const size = Math.max(300, Math.min(width, 800)); // Clamp between 300px and 800px
      setViewerSize(size);
    };

    updateSize(); // Initial size
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.post("http://localhost:3001/graphql", {
          query: `
            {
              getSeries {
                seriesid
                seriesdescription
              }
            }
          `,
        });

        setSeries(response.data.data.getSeries);
      } catch (error) {
        console.error("Error fetching series:", error);
      }
    };

    fetchSeries();
  }, []);

  useEffect(() => {
    if (!selectedSeries) return;

    const fetchFiles = async () => {
      try {
        const response = await axios.post("http://localhost:3001/graphql", {
          query: `
            query GetFiles($seriesid: Int!) {
              getFiles(seriesid: $seriesid) {
                fileid
                filepath
              }
            }
          `,
          variables: { seriesid: selectedSeries },
        });

        setFiles(response.data.data.getFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [selectedSeries]);

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
    <Box sx={{ textAlign: "center", p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        DICOM File Viewer
      </Typography>

      <Select
        value={selectedSeries || ""}
        onChange={(e) => setSelectedSeries(Number(e.target.value))}
        displayEmpty
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>Select a Series</MenuItem>
        {series.map((s) => (
          <MenuItem key={s.seriesid} value={s.seriesid}>
            {s.seriesdescription || `Series ${s.seriesid}`}
          </MenuItem>
        ))}
      </Select>

      {selectedSeries && (
        <Select
          value={selectedFile || ""}
          onChange={(e) => loadDicomImage(e.target.value)}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>Select a DICOM file</MenuItem>
          {files.map((file) => (
            <MenuItem key={file.fileid} value={file.filepath}>
              {file.filepath}
            </MenuItem>
          ))}
        </Select>
      )}

      {/* ✅ Responsive Viewer Box */}
      <Box
        ref={dicomViewerRef}
        sx={{
          width: viewerSize,
          height: viewerSize,
          margin: "auto",
          border: "2px solid black",
          background: "black",
        }}
      />

      {loading && <CircularProgress sx={{ mt: 2 }} />}
    </Box>
  );
};

export default FileViewer;
