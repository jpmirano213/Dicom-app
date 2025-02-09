const { Patient, Study, Series, Modality, File } = require("./models");

const root = {
  // ✅ Get all patients including studies, series, and files
  getPatients: async () => {
    return await Patient.findAll({
      include: [
        {
          model: Study,
          include: [
            {
              model: Series,
              include: [File, Modality], // ✅ Ensure Series includes Files & Modality
            },
          ],
        },
      ],
    });
  },

  // ✅ Get all studies with related series and files
  getStudies: async () => {
    return await Study.findAll({
      include: [
        {
          model: Series,
          include: [File, Modality], // ✅ Ensures we get series and its files
        },
      ],
    });
  },

  // ✅ Get all series including modality and files
  getSeries: async () => {
    return await Series.findAll({
      include: [Modality, File],
    });
  },

  // ✅ Get all modalities and their linked series
  getModalities: async () => {
    return await Modality.findAll({
      include: [Series],
    });
  },

  // ✅ Get files for a given `seriesid`
  getFiles: async ({ seriesid }) => {
    return await File.findAll({
      where: { seriesid },
    });
  },

  // ✅ Create a new patient
  createPatient: async ({ name, birthdate }) => {
    return await Patient.create({ name, birthdate });
  },

  // ✅ Create a new study for a patient
  createStudy: async ({ patientid, studyname }) => {
    // Ensure patient exists
    const patient = await Patient.findByPk(patientid);
    if (!patient) {
      throw new Error(`Patient with ID ${patientid} does not exist.`);
    }
    return await Study.create({ patientid, studyname });
  },

  // ✅ Create a new modality
  createModality: async ({ name }) => {
    return await Modality.create({ name });
  },

  // ✅ Create a new series under a study
  createSeries: async ({ studyid, patientid, modalityid, seriesname, seriesdescription }) => {
    // Ensure `studyid` and `modalityid` exist before creating series
    const study = await Study.findByPk(studyid);
    if (!study) {
      throw new Error(`Study with ID ${studyid} does not exist.`);
    }

    const modality = await Modality.findByPk(modalityid);
    if (!modality) {
      throw new Error(`Modality with ID ${modalityid} does not exist.`);
    }

    return await Series.create({ studyid, patientid, modalityid, seriesname, seriesdescription });
  },

  // ✅ Upload a file and link it to a series
  uploadFile: async ({ seriesid, studyid, patientid, filepath }) => {
    // Ensure `patientid`, `studyid`, and `seriesid` exist
    const patient = await Patient.findByPk(patientid);
    if (!patient) {
      throw new Error(`Patient with ID ${patientid} does not exist.`);
    }

    const study = await Study.findByPk(studyid);
    if (!study) {
      throw new Error(`Study with ID ${studyid} does not exist.`);
    }

    const series = await Series.findByPk(seriesid);
    if (!series) {
      throw new Error(`Series with ID ${seriesid} does not exist.`);
    }

    return await File.create({ seriesid, studyid, patientid, filepath });
  },

  getFilesWithDetails: async () => {
    const files = await File.findAll({
      include: [
        {
          model: Patient,
          attributes: ["name", "birthdate"],
        },
        {
          model: Series,
          attributes: ["seriesdescription"],
        },
      ],
      attributes: ["fileid", "filepath", "filename"],
      raw: true, // ✅ Flatten the result
    });
  
    if (!Array.isArray(files)) {
      console.error("❌ Expected an array, but got:", files);
      return [];
    }
  
    return files.map(file => ({
      fileid: file.fileid,
      filepath: file.filepath,
      filename: file.filename,
      patientName: file["patient.name"] || "Unknown Patient", // ✅ Handle missing data
      birthdate: file["patient.birthdate"] || "Unknown Date",
      seriesName: file["series.seriesdescription"] || "Unknown Series",
    }));
  }
  
  
};

module.exports = root;
