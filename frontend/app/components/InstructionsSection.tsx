/**
 * Instruction flow component that guides users through downloading and uploading their TFL journey history.
 * Features step-by-step cards with icons, animations, and clear CTAs.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InstructionStep {
  id: number;
  title: string;
  description: string;
  detail?: string;
}

export default function InstructionsSection() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: InstructionStep[] = [
    {
      id: 1,
      title: "Log in to your TfL account",
      description: "Visit contactless.tfl.gov.uk or oyster.tfl.gov.uk",
      detail:
        "Sign in using the account linked to your Oyster or contactless card",
    },
    {
      id: 2,
      title: "Open Journey History",
      description: "Navigate to your journey history section",
      detail: "Select the card you want to analyse",
    },
    {
      id: 3,
      title: "Choose a date range",
      description: "TfL allows limited history per export",
      detail: "Select your preferred time period for analysis",
    },
    {
      id: 4,
      title: "Download your CSV",
      description:
        "Use the 'Export' or 'Download' option at the bottom of the page",
      detail: "Choose CSV format for the file",
    },
    {
      id: 5,
      title: "Upload it here",
      description:
        "Upload the downloaded CSV file to generate your TFL Wrapped",
      detail: "Get instant insights about your travel patterns",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleFileUpload = () => {
    // Trigger the upload button click
    const uploadInput = document.getElementById(
      "csv-upload-input"
    ) as HTMLInputElement;
    uploadInput?.click();
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-15">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto mb-5"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 iridescent-text">
          Get Your TFL Wrapped
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Follow these steps to download your journey history and discover your
          travel insights
        </p>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-bubble p-4 rounded-xl max-w-2xl mx-auto"
        >
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Note:</span> TfL does not currently
            provide a public API for journey history. This app works with
            user-downloaded CSV files.
          </p>
        </motion.div>
      </motion.div>

      {/* Step Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
      >
        {steps.map((step) => (
          <motion.div
            key={step.id}
            variants={stepVariants}
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300`}
          >
            {/* Content */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {step.id}. {step.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{step.description}</p>
            {step.detail && (
              <p className="text-gray-500 text-xs">{step.detail}</p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center"
      >
        <motion.button
          onClick={handleFileUpload}
          className={`
            relative px-8 py-4 rounded-full font-semibold text-lg
            glass-bubble glass-bubble-hover
            text-gray-800
            flex items-center gap-3 mx-auto
            bubble-shape-lg
            shadow-lg hover:shadow-xl
          `}
          animate={{
            boxShadow: [
              "0 8px 32px 0 rgba(138, 43, 226, 0.15)",
              "0 8px 32px 0 rgba(138, 43, 226, 0.25)",
              "0 8px 32px 0 rgba(138, 43, 226, 0.15)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <span>Upload your journey history CSV</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-4 text-sm text-gray-500"
        >
          Your data stays private.
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-center max-w-4xl mx-auto mb-5"
      >
        <footer className="mt-5">
          <a className="text-4xl md:text-3xl font-bold iridescent-text">
            Created by Vidip Khattar |{" "}
          </a>
          <a
            href="https://github.com/VidipKhattar/fifa_predictor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-4xl md:text-3xl font-bold "
          >
            GitHub
          </a>
        </footer>
      </motion.div>
    </section>
  );
}
