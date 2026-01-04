"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadCSV, fetchWrappedData } from "../lib/api";
import { WrappedData } from "../types";

interface UploadButtonProps {
  onUploadSuccess: (data: WrappedData) => void;
  onUploadStart?: () => void;
}

export default function UploadButton({
  onUploadSuccess,
  onUploadStart,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setShowSuccess(false);
    onUploadStart?.();

    try {
      const result = await uploadCSV(file);
      const newData = await fetchWrappedData();
      window.scrollTo({ top: 0, behavior: "smooth" });
      onUploadSuccess(newData);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        id="csv-upload-input"
      />

      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={handleButtonClick}
          disabled={isUploading}
          className={`
            relative px-6 py-3 rounded-full font-semibold
            glass-bubble glass-bubble-hover
            text-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
            bubble-shape-lg
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span>Upload New CSV</span>
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 mb-2 px-4 py-2 glass-bubble text-red-700 rounded-lg text-sm whitespace-nowrap bubble-shape"
            >
              {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 mb-2 px-4 py-2 glass-bubble text-green-700 rounded-lg text-sm whitespace-nowrap bubble-shape"
            >
              CSV uploaded successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
