import axios from 'axios';

// For local development
const BASE_URL = "http://localhost:8005";

// Upload .txt file
export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${BASE_URL}/diagnose/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data.result;
  } catch (error) {
    console.error("Upload failed:", error);
    return "Upload failed. Check server or file format.";
  }
};

// Download the .docx file
export const downloadReport = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/download/`, {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "final_diagnosis.docx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed:", error);
  }
};