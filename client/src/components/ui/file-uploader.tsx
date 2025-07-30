import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Trash2, Loader2, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card"; // Assuming this is your custom card

interface FileUploaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFileTypes?: string;
  onFileUpload: (file: File) => Promise<void>;
}

export function FileUploader({ title, description, icon, acceptedFileTypes, onFileUpload }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(false);
    try {
      await onFileUpload(file);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload failed:", error);
      // Here you can add error state handling, e.g., showing an error message
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        handleClearFile();
      }, 3000); // Reset after 3 seconds on success
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadSuccess(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <GlassCard gradient="neutral" blur="lg" className="p-6 h-full flex flex-col">
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
            {file ? (
                <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="w-full text-center bg-gray-900/50 p-6 rounded-lg border border-dashed border-gray-600 flex flex-col items-center"
                >
                    {icon}
                    <p className="mt-4 font-medium text-white truncate w-full max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    <Button variant="ghost" size="sm" onClick={handleClearFile} className="mt-4 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2"/>
                        Remove
                    </Button>
                </motion.div>
            ) : (
                <motion.label
                    key="uploader"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-48 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
                    ${isDragging ? 'border-emerald-400 bg-emerald-500/10' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-800/20'}`}
                >
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-3"/>
                    <p className="text-gray-300 font-semibold">Drag & drop a file here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={acceptedFileTypes}
                        onChange={handleFileChange}
                        title="Select a file to upload"
                    />
                </motion.label>
            )}
            </AnimatePresence>
        </div>

        <div className="mt-6">
            <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading || uploadSuccess}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {isUploading ? (
                        <motion.span key="uploading" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin"/> Uploading...
                        </motion.span>
                    ) : uploadSuccess ? (
                        <motion.span key="success" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2"/> Upload Successful
                        </motion.span>
                    ) : (
                        <motion.span key="upload" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center">
                           <Upload className="w-5 h-5 mr-2"/> Upload File
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}