const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// ✅ Patient Model (Updated birthdate to STRING)
const Patient = sequelize.define("patients", {
  patientid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  birthdate: { type: DataTypes.STRING, allowNull: true }, // ✅ Changed to STRING
  date_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: "patients" });

// ✅ Modality Model
const Modality = sequelize.define("modalities", {
  modalityid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: false, tableName: "modalities" });

// ✅ Study Model
const Study = sequelize.define("study", {
  studyid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "patients", key: "patientid" }
  },
  studyname: { type: DataTypes.STRING, allowNull: true },
  date_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: "studies" });

// ✅ Series Model
const Series = sequelize.define("series", {
  seriesid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "patients", key: "patientid" }
  },
  studyid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "studies", key: "studyid" }
  },
  modalityid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "modalities", key: "modalityid" },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  },
  seriesname: { type: DataTypes.STRING, allowNull: true },
  seriesdescription: { type: DataTypes.STRING, allowNull: true },
  date_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: "series" });

// ✅ File Model
const File = sequelize.define("file", {
  fileid: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seriesid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "series", key: "seriesid" }
  },
  patientid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "patients", key: "patientid" }
  },
  studyid: { type: DataTypes.INTEGER, allowNull: false,
    references: { model: "studies", key: "studyid" }
  },
  filepath: { type: DataTypes.STRING, allowNull: false },
  date_created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false, tableName: "files" });

// ✅ Define Relationships
Patient.hasMany(Study, { foreignKey: "patientid", onDelete: "CASCADE" });
Study.belongsTo(Patient, { foreignKey: "patientid" });

Study.hasMany(Series, { foreignKey: "studyid", onDelete: "CASCADE" });
Series.belongsTo(Study, { foreignKey: "studyid" });

Patient.hasMany(Series, { foreignKey: "patientid", onDelete: "CASCADE" });
Series.belongsTo(Patient, { foreignKey: "patientid" });

Modality.hasMany(Series, { foreignKey: "modalityid", onDelete: "SET NULL" });
Series.belongsTo(Modality, { foreignKey: "modalityid" });

Series.hasMany(File, { foreignKey: "seriesid", onDelete: "CASCADE" });
File.belongsTo(Series, { foreignKey: "seriesid" });

Patient.hasMany(File, { foreignKey: "patientid", onDelete: "CASCADE" });
File.belongsTo(Patient, { foreignKey: "patientid" });

Study.hasMany(File, { foreignKey: "studyid", onDelete: "CASCADE" });
File.belongsTo(Study, { foreignKey: "studyid" });

module.exports = { sequelize, Patient, Study, Series, Modality, File };
