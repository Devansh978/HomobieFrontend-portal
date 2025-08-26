import { motion } from "framer-motion";
import {
  File as FileIcon,
  Sheet,
  List,
  Loader,
  AlertCircle,
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
  status: string; // Assuming the backend sends a string date
}

export function FileUploadPage() {
  // --- STATE MANAGEMENT ---
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // Get token function
  const getToken = () => localStorage.getItem("auth_token");
  
  // Get userId from user object
  const userId = user?.userId;

  // --- API CALL TO GET DOCUMENTS ---
  const fetchDocuments = async () => {
    // Check for userId instead of fileId
    if (!userId) {
      setError("User not found. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const token = getToken();

    try {
      // Use userId in the API call
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
    // Only fetch documents if userId is available
    if (userId) {
      fetchDocuments();
    }
  }, [userId]); // Add userId as dependency so it refetches when user changes

  // --- API CALL TO UPLOAD FILE (POST) ---
  const handleFileUpload = async (file: File, status: "NORMAL" | "MASTER") => {
    if (!userId || !file) {
      alert("Cannot upload file: User ID is missing.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("status", status);
    const token = getToken();
    

    try {
      // Prepend the base URL to the endpoint
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
      
      alert("File uploaded successfully! " + response.data);
      // Refresh the document list after a successful upload
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading file:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data || "Upload failed.";
      }
      alert("Error: " + errorMessage);
      // Re-throw the error to let the FileUploader component know it failed
      throw error;
    }
  };
  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8 pt-28">
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
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Data Upload 
            </h1>
            <p className="text-gray-400 mt-2">
              Upload your standard documents and master data files.
            </p>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileUploader
            title="Normal File Upload"
            description="Upload standard document like PDFs."
            icon={<FileIcon className="w-10 h-10 text-cyan-400" />}
            onFileUpload={(file) => handleFileUpload(file, "NORMAL")}
          />
          <FileUploader
            title="Master File Upload"
            description="Upload master data files, typically in PDF format."
            icon={<Sheet className="w-10 h-10 text-emerald-400" />}
            onFileUpload={(file) => handleFileUpload(file, "MASTER")}
          />
        </div>

        {/* Display Fetched Documents */}
        <div className="mt-16  text-white">
          <h2 className="text-2xl font-bold flex items-center mb-4 text-white">
            <List className="mr-3" /> Your Uploaded Documents
          </h2>
          {isLoading && (
            <div className="flex items-center text-gray-400">
              <Loader className="animate-spin mr-2" /> Loading documents...
            </div>
          )}
          {error && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-2" /> {error}
            </div>
          )}
          {!isLoading && !error && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              {documents.length > 0 ? (
                <ul>
                  {documents.map((doc) => (
                    <li
                      key={doc.fileId}
                      className="flex justify-between items-center p-2 border-b border-gray-800 last:border-b-0"
                    >
                      <span>{doc.fileName}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${doc.status === "MASTER" ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"}`}
                      >
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  You have not uploaded any documents yet.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
