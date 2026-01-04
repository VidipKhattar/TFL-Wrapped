"use client";

import { motion } from "framer-motion";
import Section from "./Section";
import CountUp from "./CountUp";
import { WrappedData } from "../types";

interface TubeLinesSectionProps {
  data: WrappedData;
}

const LINE_COLORS: Record<string, string> = {
  Piccadilly: "bg-blue-500",
  Central: "bg-red-500",
  District: "bg-green-500",
  Northern: "bg-black",
  Circle: "bg-yellow-400",
  Elizabeth: "bg-purple-500",
  "Elizabeth line": "bg-purple-500",
  Jubilee: "bg-gray-400",
  Victoria: "bg-cyan-500",
  Bakerloo: "bg-amber-600",
  "Hammersmith & City": "bg-pink-500",
  Metropolitan: "bg-purple-700",
  "Waterloo & City": "bg-teal-500",

  Overground: "bg-orange-500",
  Lioness: "bg-orange-400",
  Windrush: "bg-orange-600",
  Mildmay: "bg-orange-300",
  Weaver: "bg-orange-700",
  Suffragette: "bg-orange-500",
  Liberty: "bg-amber-500",

  DLR: "bg-teal-400",
  Tram: "bg-lime-500",

  "South Western Railway": "bg-blue-600",
  "Great Western Railway": "bg-green-600",
  Thameslink: "bg-red-700",
  Southeastern: "bg-indigo-600",
  Southern: "bg-green-700",
  "Greater Anglia": "bg-red-600",
  c2c: "bg-emerald-500",
  "Chiltern Railways": "bg-slate-700",
  "London Northwestern Railway": "bg-teal-600",
  "Avanti West Coast": "bg-red-800",
  "East Midlands Railway": "bg-yellow-500",
  LNER: "bg-red-700",

  "National Rail": "bg-slate-500",
  Unknown: "bg-gray-300",
};

const getLineColor = (line: string): string => {
  return LINE_COLORS[line] || "bg-gray-600";
};

export default function TubeLinesSection({ data }: TubeLinesSectionProps) {
  const totalInferred =
    data.confidence_breakdown.high +
    data.confidence_breakdown.medium +
    data.confidence_breakdown.low;

  const confidencePercentage = (value: number) => {
    if (totalInferred === 0) return 0;
    return Math.round((value / totalInferred) * 100);
  };

  if (data.top_lines.length === 0) {
    return null;
  }

  return (
    <Section className="">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-bold mb-4 iridescent-text">
            Your Tube Lines
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Most frequent lines you traveled on
          </p>
          <p className="text-sm text-gray-500 italic">
            {data.line_inference_note}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {data.top_lines.map((lineData, index) => (
            <motion.div
              key={lineData.line}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-bubble glass-bubble-hover bubble-shape-lg p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-4 h-4 rounded-full ${getLineColor(
                    lineData.line
                  )}`}
                />
                <h3 className="text-2xl font-bold text-gray-800">
                  {lineData.line}
                </h3>
              </div>
              <div className="mt-4">
                <CountUp
                  value={lineData.count}
                  className="text-4xl font-bold text-gray-800"
                />
                <p className="text-gray-600 text-sm mt-2">journeys</p>
              </div>
            </motion.div>
          ))}
        </div>

        {totalInferred > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-bubble glass-bubble-hover bubble-shape-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Inference Confidence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {data.confidence_breakdown.high}
                </div>
                <p className="text-gray-600">High Confidence</p>
                <p className="text-sm text-gray-500 mt-1">
                  {confidencePercentage(data.confidence_breakdown.high)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Single valid line</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {data.confidence_breakdown.medium}
                </div>
                <p className="text-gray-600">Medium Confidence</p>
                <p className="text-sm text-gray-500 mt-1">
                  {confidencePercentage(data.confidence_breakdown.medium)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Clear shortest path
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {data.confidence_breakdown.low}
                </div>
                <p className="text-gray-600">Low Confidence</p>
                <p className="text-sm text-gray-500 mt-1">
                  {confidencePercentage(data.confidence_breakdown.low)}%
                </p>
                <p className="text-xs text-gray-500 mt-2">Ambiguous routes</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Section>
  );
}
