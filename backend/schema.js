const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Patient {
    patientid: Int
    name: String
    birthdate: String
    date_created: String
    studies: [Study]
    series: [Series]
    files: [File]
  }

  type Study {
    studyid: Int
    patientid: Int
    studyname: String
    date_created: String
    series: [Series]
    files: [File]
  }

  type Series {
    seriesid: Int
    studyid: Int
    patientid: Int
    modalityid: Int
    seriesname: String
    seriesdescription: String
    date_created: String
    modality: Modality
    files: [File]
  }

  type Modality {
    modalityid: Int
    name: String
    series: [Series]
  }

  type File {
    fileid: Int
    seriesid: Int
    patientid: Int
    studyid: Int
    filename: String    # ✅ NEW: Stores the original file name
    filepath: String    # ✅ Stores the hashed/multer filename
    date_created: String
  }

  type Query {
    getPatients: [Patient]
    getStudies: [Study]
    getSeries: [Series]
    getModalities: [Modality]
    getFiles(seriesid: Int!): [File]
  }

  type Mutation {
    createPatient(name: String!, birthdate: String!): Patient
    createStudy(patientid: Int!, studyname: String!): Study
    createModality(name: String!): Modality
    createSeries(studyid: Int!, patientid: Int!, modalityid: Int, seriesname: String!, seriesdescription: String): Series
    uploadFile(seriesid: Int!, studyid: Int!, patientid: Int!, filename: String!, filepath: String!): File  # ✅ UPDATED
  }
`);

module.exports = schema;
