import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './ExcelUpload.css';

const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate required columns
      const requiredColumns = [
        'Problem Statement Id',
        'Team Name',
        'Team Leader Name',
        'Leader Email',
        'Leader Contact Number',
      ];

      const missingColumns = requiredColumns.filter(col => !jsonData[0] || !Object.keys(jsonData[0]).includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload_excel/', {
        method: 'POST',
        body: formData,
        headers: {
          // Let the browser set the Content-Type with boundary for FormData
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setExcelData(jsonData);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="excel-upload-container">
      <div className="excel-upload-card">
        <h2 className="excel-upload-title">Upload Shortlisted Teams</h2>
        
        <div className="instructions-box">
          <p className="instructions-title">Instructions:</p>
          <ul className="instructions-list">
            <li>Upload Excel file (.xlsx or .xls) containing shortlisted team details</li>
            <li>Ensure all required columns are present:
              <ul className="instructions-sublist">
                <li>Problem Statement Id</li>
                <li>Team Name</li>
                <li>Team Leader Name</li>
                <li>Leader Email & Contact</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${loading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-500'}`}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label 
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center ${loading ? 'cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 mb-3 rounded-full bg-gray-300"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                </div>
              ) : (
                <>
                  <svg 
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 150 150"
                  >
                    <path 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium mb-1">Click to upload Excel file</span>
                  <span className="text-gray-500 text-sm">or drag and drop</span>
                </>
              )}
            </label>
          </div>
        </div>

        {excelData.length > 0 && (
          <div className="data-table-section">
            <h3 className="table-title">Uploaded Team Data</h3>
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    {Object.keys(excelData[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, index) => (
                    <tr key={index} className="table-row">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="table-cell">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
