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
        const originalFileName = req.file.originalname; // ✅ Get original filename

        console.log(`🟢 Uploaded File Path: ${filePath}`);
        console.log(`🟢 Original File Name: ${originalFileName}`);

        const pythonScript = path.join(__dirname, "process_dicom.py");

        execFile("python3", [pythonScript, filePath], { maxBuffer: 50 * 1024 * 1024 }, async (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Python script execution error:", error.message);
                console.error("🔴 STDERR:", stderr);
                return res.status(500).json({ error: "Failed to process DICOM file", details: stderr });
            }

            try {
                // ✅ Ensure the output is properly trimmed before parsing
                const cleanedOutput = stdout.trim();

                if (!cleanedOutput) {
                    throw new Error("DICOM script returned empty output.");
                }

                const dicomData = JSON.parse(cleanedOutput);

                console.log("✅ Extracted DICOM Data:", dicomData);

                // ✅ Extract Metadata (Handle missing values)
                const {
                    width = null,
                    height = null,
                    minimum = null,
                    maximum = null,
                    Modality: modalityName = null,
                    PatientName = null,
                    PatientBirthDate = null,
                    StudyName = "",
                    SeriesDescription = "",
                    SeriesName = "",
                } = dicomData.metadata || {};

                if (!width || !height || !modalityName || !PatientName) {
                    console.error("❌ Missing essential DICOM metadata!");
                    return res.status(500).json({ error: "DICOM metadata incomplete" });
                }

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
                let study = await Study.findOne({ where: { patientid: patient.patientid, studyname: StudyName } });
                if (!study) {
                    study = await Study.create({ patientid: patient.patientid, studyname: StudyName });
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
                    seriesname: SeriesName,
                    seriesdescription: SeriesDescription,
                    width,
                    height,
                    minimum,
                    maximum
                });

                // ✅ Save File with Original Name
                const file = await File.create({
                    seriesid: series.seriesid,
                    studyid: study.studyid,
                    patientid: patient.patientid,
                    filepath: path.basename(filePath), 
                    filename: originalFileName // ✅ Store the original filename
                });

                return res.status(200).json({
                    message: "DICOM file processed and saved successfully",
                    dicomData,
                    fileId: file.fileid
                });
            } catch (parseError) {
                console.error("❌ JSON Parsing Error:", parseError.message);
                console.error("🔴 Raw Python Output:", stdout);
                return res.status(500).json({ error: "Failed to parse DICOM output", parseError });
            }
        });
    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

/**
 * ✅ File Download Endpoint
 */

app.get("/files/:filename", async (req, res) => {
    try {
        const { filename } = req.params;

        // ✅ Check if file exists in DB
        const fileRecord = await File.findOne({ where: { filepath: filename } });

        if (!fileRecord) {
            console.error(`❌ File Not Found in Database: ${filename}`);
            return res.status(404).json({ error: "File not found in database" });
        }

        // ✅ Construct full file path dynamically
        const filePath = path.join(uploadsDir, filename); // ✅ Corrected

        if (!fs.existsSync(filePath)) {
            console.error(`❌ File Not Found on Server: ${filePath}`);
            return res.status(404).json({ error: "File not found on server" });
        }

        // ✅ Serve file with original filename
        res.download(filePath, fileRecord.filename, (err) => {
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
