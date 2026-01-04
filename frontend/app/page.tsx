"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchWrappedData } from "./lib/api";
import { WrappedData } from "./types";
import SummarySection from "./components/SummarySection";
import TubeLinesSection from "./components/TubeLinesSection";
import DailySpendingSection from "./components/DailySpendingSection";
import HourlyPatternSection from "./components/HourlyPatternSection";
import UploadButton from "./components/UploadButton";
import InstructionsSection from "./components/InstructionsSection";

export default function Home() {
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleUploadSuccess = (newData: WrappedData) => {
    setData(newData);
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Processing your TFL data...</p>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen text-gray-800 overflow-x-hidden relative">
        {/* Show instructions when no data is available */}
        <InstructionsSection />

        {/* Hidden upload input for the instructions CTA button */}
        <UploadButton
          onUploadSuccess={handleUploadSuccess}
          onUploadStart={handleUploadStart}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800 overflow-x-hidden relative">
      {loading && data && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">Processing new data...</p>
          </motion.div>
        </div>
      )}

      <UploadButton
        onUploadSuccess={handleUploadSuccess}
        onUploadStart={handleUploadStart}
      />

      {data && (
        <>
          <SummarySection data={data} />
          <TubeLinesSection data={data} />
          <DailySpendingSection data={data} />
          <HourlyPatternSection data={data} />
        </>
      )}

      {data && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 iridescent-text">
              Upload a new CSV to see your TFL Wrapped for another period
            </h2>
          </motion.div>
        </motion.section>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="fixed bottom-10 left-0 w-full text-center"
      >
        <footer className="mt-5">
          <a className="text-4xl md:text-3xl font-bold iridescent-text">
            Created by Vidip Khattar |{" "}
          </a>
          <a
            href="https://github.com/VidipKhattar/fifa_predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-4xl md:text-3xl font-bold"
          >
            GitHub
          </a>
        </footer>
      </motion.div>
    </main>
  );
}
