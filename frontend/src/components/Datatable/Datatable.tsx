import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, TablePagination, Box, Button
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import axios from "axios";
import { graphqlFetcher } from "../../utils/graphqlFetcher";
import { PatientData, FileData } from "../Common/GraphQLTypes"; // ✅ Correct imports

// ✅ Updated GraphQL Query
const GET_PATIENTS_QUERY = `
  query {
    getPatients {
      patientid
      name
      birthdate
      studies {
        studyid
        studyname
        series {
          seriesid
          seriesname
          seriesdescription
          files {
            fileid
            filepath
            filename  # ✅ Include the original filename
          }
        }
      }
    }
  }
`;

const DataTable: React.FC = () => {
  // ✅ Fetch GraphQL data using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["getPatients"],
    queryFn: () => graphqlFetcher(GET_PATIENTS_QUERY),
  });

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  const patients: PatientData[] = (data as { getPatients: PatientData[] })?.getPatients || [];

  // ✅ Flattened Data Structure
  const flattenedData = patients.flatMap((patient) =>
    patient.studies.flatMap((study) =>
      study.series.flatMap((series) =>
        series.files.length > 0
          ? series.files.map((file: FileData) => ({
              patientid: patient.patientid,
              name: patient.name,
              birthdate: patient.birthdate,
              seriesdescription: series.seriesdescription || "N/A",
              fileid: file.fileid ?? null,
              filepath: file.filepath ?? null,
              filename: file.filename ?? "Unnamed File", // ✅ Use original filename
            }))
          : [
              {
                patientid: patient.patientid,
                name: patient.name,
                birthdate: patient.birthdate,
                seriesdescription: series.seriesdescription || "N/A",
                fileid: null,
                filepath: null,
                filename: "No File Available",
              },
            ]
      )
    )
  );

  // ✅ Filter by search (Patient Name or Series Description)
  const filteredData = flattenedData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.seriesdescription.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Handle File Download
  const handleDownload = async (file: { filepath: string; filename: string }) => {
    try {
      const response = await axios.get(`http://localhost:3001/files/${file.filepath}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.filename || "download.dcm"); // ✅ Use original filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        label="Search by Name or Series Description"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Patient Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Birth Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Series Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.birthdate}</TableCell>
                <TableCell>{item.seriesdescription}</TableCell>
                <TableCell>
                  {item.filepath ? (
                    <Button
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleDownload(item)}
                      variant="contained"
                    >
                      {item.filename} {/* ✅ Show original filename */}
                    </Button>
                  ) : (
                    "No File"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Box>
  );
};

export default DataTable;
