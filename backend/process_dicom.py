import sys
import json
import numpy as np
from pydicom import dcmread

def getDicomValue(ds, name):
    value = ds.get(name)
    if value is None:
        return ''
    if isinstance(value, list):
        return [str(v) for v in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    return str(value)

def convert_dicom(filepath):
    ds = dcmread(filepath)
    pixel_data = ds.pixel_array.astype(float)
    rescale_intercept = getattr(ds, "RescaleIntercept", 0)
    pixel_data += rescale_intercept

    max_value = np.amax(pixel_data)
    min_value = np.amin(pixel_data)
    pixel_data_scaled = (np.maximum(pixel_data, 0) / max_value) * 255.0
    pixel_data_uint8 = pixel_data_scaled.astype(np.uint8)

    dicom_data = {
        "slices": [{
            "image": pixel_data_uint8.tolist(),
            "InstanceNumber": getDicomValue(ds, "InstanceNumber"),
            "SliceLocation": getDicomValue(ds, "SliceLocation"),
            "filepath": filepath,
        }],
        "metadata": {
            "width": ds.Columns,
            "height": ds.Rows,
            "minimum": float(min_value),
            "maximum": float(max_value),
            "Modality": getDicomValue(ds, "Modality"),
            "PatientName": getDicomValue(ds, "PatientName"),
            "PatientBirthDate": getDicomValue(ds, "PatientBirthDate"),
            "StudyName": getDicomValue(ds, "StudyName"),
            "SeriesDescription": getDicomValue(ds, "SeriesDescription"),
            "SeriesName": getDicomValue(ds, "SeriesName"),
        }
    }

    return json.dumps(dicom_data)

if __name__ == "__main__":
    dicom_file = sys.argv[1]
    result = convert_dicom(dicom_file)
    print(result)
