export interface FileData {
  fileid: number;
  filepath: string;
}

export interface SeriesData {
  seriesid: number;
  seriesname: string;
  seriesdescription: string;
  files: FileData[];
}

export interface StudyData {
  studyid: number;
  studyname: string;
  series: SeriesData[];
}

export interface PatientData {
  patientid: number;
  name: string;
  birthdate: string;
  studies: StudyData[];
}
