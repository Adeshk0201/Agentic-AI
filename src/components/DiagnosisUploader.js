import React, { useState } from 'react';
import { uploadReport, downloadReport } from '../api';

const styles = {
  container: {
    maxWidth: 900,
    margin: '20px auto',
    padding: 20,
    background: 'linear-gradient(135deg, #1e1e4f, #12122b)',
    borderRadius: 16,
    boxShadow: '0 0 20px rgba(0, 198, 255, 0.5)',
    color: '#e0e0e0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    gap: 40,
  },
  leftPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Ensures children are left-aligned
  },
  heading: {
    fontSize: 24,
    marginBottom: 16,
    color: '#00c6ff',
    textAlign: 'center',
    textShadow: '0 0 8px #00c6ff',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    border: '1.5px solid #00bfff',
    backgroundColor: '#12122b',
    color: '#e0e0e0',
    fontSize: 16,
    cursor: 'pointer',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(to right, #00bfff, #0072ff)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 0 12px #00bfff',
    transition: 'background 0.3s ease',
  },
  rightPane: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    whiteSpace: 'pre-wrap',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 16,
    color: '#f0f0f0',
    boxShadow: '0 0 15px rgba(0, 198, 255, 0.4)',
    minHeight: 150,
  },
  diagnosisHeading: {
    fontSize: 20,
    marginBottom: 12,
    color: '#00c6ff',
    textShadow: '0 0 8px #00c6ff',
  },
};

function DiagnosisUploader() {
  const [diagnosis, setDiagnosis] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const result = await uploadReport(file);
    setDiagnosis(result);
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPane}>
        <h2 style={styles.heading}>Upload Medical Report</h2>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={styles.input}
        />
        <button onClick={downloadReport} style={styles.button}>
          Download Report
        </button>
      </div>
      <div style={styles.rightPane}>
        <h3 style={styles.diagnosisHeading}>Final Diagnosis</h3>
        <pre>{diagnosis || "No diagnosis available."}</pre>
      </div>
    </div>
  );
}

export default DiagnosisUploader;
