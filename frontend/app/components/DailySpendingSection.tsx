"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Section from "./Section";
import { WrappedData } from "../types";

interface DailySpendingSectionProps {
  data: WrappedData;
}

export default function DailySpendingSection({
  data,
}: DailySpendingSectionProps) {
  const chartData = data.daily_spending.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <Section className="" delay={0.3}>
      <div className="w-full max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4 iridescent-text"
        >
          Daily Spending
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-gray-600 mb-12"
        >
          Your spending pattern throughout the month
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-bubble glass-bubble-hover bubble-shape-lg p-8"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
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
                dataKey="dateLabel"
                stroke="#6b7280"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: "#4b5563", fontSize: 12 }}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                  backdropFilter: "blur(10px)",
                }}
                formatter={(value: number) => [
                  `£${value.toFixed(2)}`,
                  "Spending",
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: "#667eea", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Section>
  );
}
