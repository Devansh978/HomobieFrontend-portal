import { motion } from "framer-motion";
import {
  File as FileIcon,
  Sheet,
  List,
  Loader,
  AlertCircle,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import axios from "axios";
import { FileUploader } from "@/components/ui/file-uploader";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/auth";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";

// --- Define your API Base URL ---
const API_BASE_URL = "https://homobiebackend-railway-production.up.railway.app";

// Define a type for our document object for better type safety
type pdf = "pdf";
interface Document {
  fileId: string;
  fileName: string;
  userId: string;
  fileType: pdf;
  status: string;
}

// PDF validation function
const validatePDF = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== "application/pdf") {
    return { 
      isValid: false, 
      error: "Only PDF files are allowed." 
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: "File size exceeds the 10MB limit." 
    };
  }

  return { isValid: true };
};

export function FileUploadPage() {
  // --- STATE MANAGEMENT ---
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get token function
  const getToken = () => localStorage.getItem("auth_token");
  
  // Get userId from user object
  const userId = user?.userId;

  // --- UTILITY FUNCTIONS ---
  const saveFileIdToLocalStorage = (fileId: string) => {
    localStorage.setItem("selected_file_id", fileId);
  };

  const getFileIdFromLocalStorage = () => {
    return localStorage.getItem("selected_file_id");
  };

  // --- API CALL TO GET DOCUMENTS ---
  const fetchDocuments = async () => {
    if (!userId) {
      setError("User not found. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const token = getToken();

    try {
      const response = await axios.get(`${API_BASE_URL}/document/get/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(response.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FETCH DOCUMENTS ON COMPONENT MOUNT ---
  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  // --- API CALL TO UPLOAD FILE (POST) ---
  const handleFileUpload = async (file: File, status: "NORMAL" | "MASTER") => {
    if (!userId || !file) {
      alert("Cannot upload file: User ID is missing.");
      return;
    }
    
    // Validate the file before uploading
    const validation = validatePDF(file);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid file");
      setTimeout(() => setUploadError(null), 5000); // Clear error after 5 seconds
      return;
    }
    
    setUploadError(null); // Clear any previous errors
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("status", status);
    const token = getToken();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/document/upload`,
        formData,
        {
          params: { userId },
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("File uploaded successfully! ");
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading file:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data || "Upload failed.";
      }
      alert("Error: " + errorMessage);
      throw error;
    }
  };

  // --- API CALL TO DOWNLOAD FILE ---
  const handleFileDownload = async (fileId: string, fileName: string) => {
    if (!fileId || !userId) {
      alert("Cannot download file: Missing required information.");
      return;
    }

    setDownloadingFileId(fileId);
    saveFileIdToLocalStorage(fileId);
    const token = getToken();

    try {
      const response = await axios.get(
        `${API_BASE_URL}/document/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      let errorMessage = "Download failed.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data || "Download failed.";
      }
      alert("Error: " + errorMessage);
    } finally {
      setDownloadingFileId(null);
    }
  };

  // --- API CALL TO DELETE FILE ---
  const handleFileDelete = async (fileId: string) => {
    if (!fileId || !userId) {
      alert("Cannot delete file: Missing required information.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    setDeletingFileId(fileId);
    const token = getToken();

    try {
      await axios.delete(`${API_BASE_URL}/document/delete`, {
        params: {
          fileId,
          userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("File deleted successfully!");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Error deleting file:", error);
      let errorMessage = "Delete failed.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data || "Delete failed.";
      }
      alert("Error: " + errorMessage);
    } finally {
      setDeletingFileId(null);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 lg:p-8 pt-28">
      <EnhancedRoleBasedNavbar user={user} onLogout={logout} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Document Management
            </h1>
            <p className="text-gray-400 mt-2">
              Upload, download, and manage your documents with ease.
            </p>
          </div>
        </div>

        {/* Upload Error Message */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 flex items-center"
          >
            <AlertCircle className="mr-3" size={20} />
            <span>{uploadError}</span>
          </motion.div>
        )}

        {/* Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <FileUploader
            title="Normal File Upload"
            description="Upload standard documents like PDFs."
            icon={<FileIcon className="w-10 h-10 text-cyan-400" />}
            onFileUpload={(file) => handleFileUpload(file, "NORMAL")}
            accept=".pdf"
          />
          <FileUploader
            title="Master File Upload"
            description="Upload master data files, typically in PDF format."
            icon={<Sheet className="w-10 h-10 text-emerald-400" />}
            onFileUpload={(file) => handleFileUpload(file, "MASTER")}
            accept=".pdf"
          />
        </div>

        {/* Display Fetched Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
        >
          <h2 className="text-2xl font-bold flex items-center mb-6 text-white">
            <List className="mr-3 text-blue-400" /> 
            Your Uploaded Documents
          </h2>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-3 text-blue-400" size={24} />
              <span className="text-gray-300">Loading documents...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-red-400">
              <AlertCircle className="mr-3" size={24} />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-3">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <motion.div
                    key={doc.fileId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      {/* File Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                          <FileIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{doc.fileName}</p>
                          <p className="text-gray-400 text-sm">File ID: {doc.fileId}</p>
                        </div>
                        <div className={`px-3 py-1 text-xs rounded-full border ${
                          doc.status === "MASTER" 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                        }`}>
                          {doc.status}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Download Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFileDownload(doc.fileId, doc.fileName)}
                          disabled={downloadingFileId === doc.fileId}
                          className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Download File"
                        >
                          {downloadingFileId === doc.fileId ? (
                            <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                          )}
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFileDelete(doc.fileId)}
                          disabled={deletingFileId === doc.fileId}
                          className="p-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Delete File"
                        >
                          {deletingFileId === doc.fileId ? (
                            <Loader className="w-4 h-4 text-red-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 mb-4"
                  >
                    <FileIcon className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <p className="text-gray-400 text-lg mb-2">No documents uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload your first document to get started</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Supported formats: PDF • Maximum file size: 10MB
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
