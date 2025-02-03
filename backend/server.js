const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const { sequelize, Patient, Study, Series, Modality, File } = require("./models");
const schema = require("./schema");
const root = require("./root");

const app = express();
const PORT = 3001;

// ✅ Allow CORS for frontend access
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST",
    credentials: true
}));

// ✅ Serve uploaded files as static resources
const uploadsDir = path.join(__dirname, "uploads");
app.use("/files", express.static(uploadsDir));

// ✅ Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

/**
 * ✅ File Upload & DICOM Processing Endpoint
 */
app.post("/upload", upload.single("dicomFile"), async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log(`🟢 Uploaded File Path: ${filePath}`);

        const pythonScript = path.join(__dirname, "process_dicom.py");

        execFile("python3", [pythonScript, filePath], { maxBuffer: 50 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Python script execution error:", error.message);
                console.error("🔴 STDERR:", stderr);
                return res.status(500).json({ error: "Failed to process DICOM file", details: stderr });
            }

            try {
                const dicomData = JSON.parse(stdout);
                console.log("✅ Extracted DICOM Data:", dicomData);

                // ✅ Extract Metadata Safely
                const {
                    width = null,
                    height = null,
                    minimum = null,
                    maximum = null,
                    Modality: modalityName = null,
                    PatientName = null,
                    PatientBirthDate = null,
                    StudyDate = null,
                    SeriesDescription = null
                } = dicomData.metadata || {}; 

                if (!width || !height || !modalityName || !PatientName) {
                    console.error("❌ Missing essential DICOM data!");
                    return res.status(500).json({ error: "DICOM data incomplete" });
                }

                // ✅ Format Birthdate
                let formattedBirthdate = PatientBirthDate ? PatientBirthDate.replace(/\./g, "-") : null;

                // ✅ Ensure Patient Exists
                let patient = await Patient.findOne({ where: { name: PatientName } });
                if (!patient) {
                    patient = await Patient.create({ name: PatientName, birthdate: formattedBirthdate });
                } else if (formattedBirthdate) {
                    patient.birthdate = formattedBirthdate;
                    await patient.save();
                }

                // ✅ Ensure Study Exists
                let study = await Study.findOne({ where: { patientid: patient.patientid, studyname: StudyDate } });
                if (!study) {
                    study = await Study.create({ patientid: patient.patientid, studyname: StudyDate });
                }

                // ✅ Ensure Modality Exists
                let modality = await Modality.findOne({ where: { name: modalityName } });
                if (!modality) {
                    modality = await Modality.create({ name: modalityName });
                }

                // ✅ Ensure Series Exists
                let series = await Series.create({ 
                    studyid: study.studyid, 
                    patientid: patient.patientid, 
                    modalityid: modality.modalityid, 
                    seriesdescription: SeriesDescription,
                    width, height, minimum, maximum
                });

                // ✅ Save File Path (Only store filename, not full path)
                const filename = path.basename(filePath);
                const file = await File.create({
                    seriesid: series.seriesid,
                    studyid: study.studyid,
                    patientid: patient.patientid,
                    filepath: filename  // ✅ Store only the filename
                });

                return res.status(200).json({
                    message: "DICOM file processed and saved successfully",
                    dicomData,
                    fileId: file.fileid
                });
            } catch (parseError) {
                console.error("❌ JSON Parsing Error:", parseError.message);
                return res.status(500).json({ error: "Failed to parse DICOM output" });
            }
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

/**
 * ✅ File Download Endpoint
 */
app.get("/files/:filename", async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            console.error(`❌ File Not Found: ${filename}`);
            return res.status(404).json({ error: "File not found" });
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error(`❌ Error sending file: ${filename}`, err);
                res.status(500).json({ error: "Failed to download file" });
            }
        });
    } catch (error) {
        console.error("❌ File Download Error:", error);
        res.status(500).json({ error: "File download failed" });
    }
});

// ✅ GraphQL API Endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

// ✅ Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
});
