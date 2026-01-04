/**
 * Opening summary section displaying total journeys and spending.
 * Features large animated numbers and bold typography.
 */

"use client";

import { motion } from "framer-motion";
import Section from "./Section";
import CountUp from "./CountUp";
import { WrappedData } from "../types";

interface SummarySectionProps {
  data: WrappedData;
}

export default function SummarySection({ data }: SummarySectionProps) {
  const formatDateRange = () => {
    if (!data.daily_spending || data.daily_spending.length === 0) {
      return `Your ${data.summary.days_covered} day travel journey`;
    }
    const dates = data.daily_spending
      .map((d) => new Date(d.date))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return `Your ${data.summary.days_covered} day travel journey`;
    }

    const start = dates[0];
    const end = dates[dates.length - 1];

    const startStr = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const endStr = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (startStr === endStr) return startStr;
    return `${startStr} - ${endStr}`;
  };

  return (
    <Section className="">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-center max-w-5xl mx-auto"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-4 iridescent-text">
          Your TFL Wrapped
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-16">
          {formatDateRange() || "Your travel journey"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-16">
          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Total Journeys
            </p>
            <div className="text-center">
              <CountUp
                value={data.summary.total_journeys}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Total Spent
            </p>
            <div className="text-center">
              <CountUp
                value={data.summary.total_spent}
                decimals={2}
                prefix="£"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Total Time Traveling
            </p>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800">
                {Math.floor(data.summary.total_time_minutes / 60)}h{" "}
                {Math.round(data.summary.total_time_minutes % 60)}m
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(data.summary.total_time_minutes)} minutes total
              </p>
              <p className="text-sm text-gray-600 mt-3 font-semibold">
                {(
                  (data.summary.total_time_minutes /
                    (data.summary.days_covered * 24 * 60)) *
                  100
                ).toFixed(2)}
                % of your{" "}
                {data.summary.days_covered === 1 ? "day" : "time period"} spent
                on TFL
              </p>
            </div>
          </div>

          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Average Journey Cost
            </p>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800">
                £{data.summary.average_cost.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Capped Journeys
            </p>
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800">
                {data.summary.capped_journeys}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(
                  (data.summary.capped_journeys / data.summary.total_journeys) *
                    100
                )}
                % of all journeys
              </p>
            </div>
          </div>

          <div className="glass-bubble glass-bubble-hover bubble-shape-lg p-6 lg:p-8 flex flex-col justify-center min-h-[200px]">
            <p className="text-gray-600 text-lg mb-4 text-center">
              Average Spend Per Day
            </p>
            <div className="text-center">
              <CountUp
                value={data.summary.average_spend_per_day}
                decimals={2}
                prefix="£"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800"
              />
              <p className="text-sm text-gray-500 mt-2">
                Over {data.summary.days_covered}{" "}
                {data.summary.days_covered === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-bubble glass-bubble-hover bubble-shape-lg p-6"
            >
              <h3 className="text-lg text-gray-600 mb-3">
                Most Expensive Journey
              </h3>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                <CountUp
                  value={data.most_expensive_journey.cost}
                  decimals={2}
                  prefix="£"
                  className="text-3xl md:text-4xl font-bold text-gray-800"
                />
              </div>
              <p className="text-gray-700 text-sm mb-2">
                {data.most_expensive_journey.route}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(data.most_expensive_journey.date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                  }
                )}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="glass-bubble glass-bubble-hover bubble-shape-lg p-6"
            >
              <h3 className="text-lg text-gray-600 mb-3">Busiest Day</h3>
              <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                <CountUp
                  value={data.busiest_day.journey_count}
                  className="text-3xl md:text-4xl font-bold text-gray-800"
                />
              </div>
              <p className="text-gray-700 text-sm mb-2">
                {data.busiest_day.journey_count} journeys on{" "}
                {new Date(data.busiest_day.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
