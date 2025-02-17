import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Box, Button, Typography, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; uploadedAt: string }[]>([]);

  // ✅ Drag & Drop Handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0]; // Get the first file
    console.log("🟢 Selected File:", file.name);

    const formData = new FormData();
    formData.append("dicomFile", file);

    try {
      setUploading(true);
      setModalMessage(null);
      setIsError(false);

      // ✅ Upload File
      const response = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload Response:", response.data);
      setModalMessage("File uploaded successfully!");
      setModalOpen(true);

      // ✅ Add file to uploaded list
      setUploadedFiles(prevFiles => [
        ...prevFiles,
        {
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toLocaleString(),
        },
      ]);
    } catch (err) {
      console.error("❌ Upload Failed:", err);
      setModalMessage("Failed to upload file.");
      setIsError(true);
      setModalOpen(true);
    } finally {
      setUploading(false);
    }
  }, []);

  // ✅ Drag & Drop Area
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/dicom": [".dcm"],
    },
  });

  return (
    <>
      {/* ✅ Drag & Drop Box */}
      <Box sx={{ textAlign: "center", p: 3, border: "2px dashed gray", borderRadius: 2, cursor: "pointer" }} {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant="h6">Drop the DICOM file here...</Typography>
        ) : (
          <Typography variant="h6">Drag & drop a DICOM file here, or click to select one</Typography>
        )}
        <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={uploading}>
          {uploading ? "Uploading..." : "Browse File"}
        </Button>
      </Box>

      {/* ✅ Uploaded Files Table */}
      {uploadedFiles.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Size (KB)</TableCell>
                <TableCell>Uploaded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uploadedFiles.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{(file.size / 1024).toFixed(2)}</TableCell>
                  <TableCell>{file.uploadedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ✅ Modal Popup */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: 3,
            textAlign: "center",
            minWidth: 300,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: isError ? "red" : "green" }}>
            {modalMessage}
          </Typography>
          <Button variant="contained" onClick={() => setModalOpen(false)} sx={{ mt: 2 }}>
            OK
          </Button>
        </Paper>
      </Modal>
    </>
  );
};

export default FileUpload;
