"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Section from "./Section";
import { WrappedData } from "../types";

interface HourlyPatternSectionProps {
  data: WrappedData;
}

export default function HourlyPatternSection({
  data,
}: HourlyPatternSectionProps) {
  const chartData = data.hourly_pattern.map((item) => ({
    ...item,
    hourLabel: `${item.hour}:00`,
  }));

  return (
    <Section className="" delay={0.4}>
      <div className="w-full max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 iridescent-text"
        >
          Your Travel Times
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-gray-600 mb-12"
        >
          What time you traveled the most during the day
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-bubble glass-bubble-hover bubble-shape-lg p-8"
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorJourneys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#764ba2" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient
                  id="areaStrokeGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="50%" stopColor="#764ba2" />
                  <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(138, 43, 226, 0.2)"
              />
              <XAxis
                dataKey="hourLabel"
                stroke="#6b7280"
                tick={{ fill: "#4b5563", fontSize: 12 }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: "#4b5563", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                  backdropFilter: "blur(10px)",
                }}
                formatter={(value: number) => [`${value} journeys`, "Count"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#areaStrokeGradient)"
                fillOpacity={1}
                fill="url(#colorJourneys)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Section>
  );
}
