import sys
import json
import numpy as np
from pydicom import dcmread

def getDicomValue(ds, name):
    """ Safely extracts DICOM metadata fields. Returns an empty string if value is missing. """
    try:
        value = ds.get(name)
        if value is None:
            return ""  # ✅ Returns empty string if field is missing

        if isinstance(value, list):
            return [str(v) for v in value]

        if isinstance(value, np.ndarray):
            return value.tolist()

        return str(value)
    except Exception as e:
        print(f"❌ Error extracting {name}: {e}", file=sys.stderr)
        return ""  # ✅ Ensures script continues running


def convert_dicom(filepath):
    try:
        ds = dcmread(filepath)

        # ✅ Extract Pixel Data Safely
        if hasattr(ds, "pixel_array"):
            pixel_data = ds.pixel_array.astype(float)
            rescale_intercept = getattr(ds, "RescaleIntercept", 0)
            pixel_data += rescale_intercept

            max_value = np.amax(pixel_data) if pixel_data.size > 0 else 0
            min_value = np.amin(pixel_data) if pixel_data.size > 0 else 0
            pixel_data_scaled = (np.maximum(pixel_data, 0) / max_value) * 255.0 if max_value > 0 else pixel_data
            pixel_data_uint8 = pixel_data_scaled.astype(np.uint8)
        else:
            print("❌ No Pixel Data Found", file=sys.stderr)
            pixel_data_uint8 = None
            max_value, min_value = 0, 0  # Default values

        # ✅ Build JSON Output
        dicom_data = {
            "slices": [{
                "image": pixel_data_uint8.tolist() if pixel_data_uint8 is not None else None,
                "InstanceNumber": getDicomValue(ds, "InstanceNumber"),
                "SliceLocation": getDicomValue(ds, "SliceLocation"),
                "filepath": filepath,
            }],
            "metadata": {
                "width": getattr(ds, "Columns", None),
                "height": getattr(ds, "Rows", None),
                "minimum": float(min_value),
                "maximum": float(max_value),
                "Modality": getDicomValue(ds, "Modality"),
                "PatientName": getDicomValue(ds, "PatientName"),
                "PatientBirthDate": getDicomValue(ds, "PatientBirthDate"),
                "StudyName": getDicomValue(ds, "StudyName") or "",  # ✅ Returns empty string if missing
                "SeriesDescription": getDicomValue(ds, "SeriesDescription") or "",  # ✅ Returns empty string if missing
                "SeriesName": getDicomValue(ds, "SeriesName") or "",  # ✅ Returns empty string if missing
            }
        }

        # ✅ Validate Output Before Sending
        if not dicom_data["metadata"]["Modality"]:
            print("❌ Missing Modality information!", file=sys.stderr)
        if not dicom_data["metadata"]["PatientName"]:
            print("❌ Missing PatientName information!", file=sys.stderr)

        return json.dumps(dicom_data, indent=2)

    except Exception as e:
        print(f"❌ DICOM Processing Error: {e}", file=sys.stderr)
        return json.dumps({"error": "Failed to process DICOM file", "details": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ No DICOM file provided!", file=sys.stderr)
        sys.exit(1)

    dicom_file = sys.argv[1]
    print(convert_dicom(dicom_file))
