"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionStep {
  id: string;
  step_index: number;
  step_name: string;
  step_type: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input_data?: any;
  output_data?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  logs?: string[];
}

interface ExecutionTimelineProps {
  executionId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function ExecutionTimeline({
  executionId,
  autoRefresh = true,
  refreshInterval = 2000,
}: ExecutionTimelineProps) {
  const [execution, setExecution] = useState<any>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/executions/${executionId}/timeline`);
      const data = await response.json();
      setExecution(data.execution);
      setSteps(data.steps || []);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();

    if (autoRefresh && execution?.status === "running") {
      const interval = setInterval(fetchTimeline, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [executionId, autoRefresh, refreshInterval, execution?.status]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-gray-400" />;
      case "skipped":
        return <Clock className="w-5 h-5 text-gray-300 line-through" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50 dark:bg-green-950";
      case "failed":
        return "border-red-500 bg-red-50 dark:bg-red-950";
      case "running":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "pending":
        return "border-gray-300 bg-gray-50 dark:bg-gray-900";
      case "skipped":
        return "border-gray-200 bg-gray-50 dark:bg-gray-900 opacity-50";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Execution Header */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {execution?.workflow_id ? "Workflow Execution" : "Execution"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium">{execution?.status}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Started: {execution?.started_at ? new Date(execution.started_at).toLocaleString() : "N/A"}
            </p>
            {execution?.completed_at && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed: {new Date(execution.completed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Step Card */}
              <div
                className={`p-4 rounded-xl border-2 ${getStatusColor(step.status)} cursor-pointer transition-all hover:shadow-md`}
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="relative z-10 mt-0.5">
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {step.step_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Step {step.step_index + 1} • {step.step_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.started_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(step.started_at).toLocaleTimeString()}
                          </span>
                        )}
                        {expandedSteps.has(step.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedSteps.has(step.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 space-y-3 overflow-hidden"
                        >
                          {/* Input Data */}
                          {step.input_data && Object.keys(step.input_data).length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Input:
                              </p>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {JSON.stringify(step.input_data, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Output Data */}
                          {step.output_data && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Output:
                              </p>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {JSON.stringify(step.output_data, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Error Message */}
                          {step.error_message && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
                              <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                                Error:
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                {step.error_message}
                              </p>
                            </div>
                          )}

                          {/* Logs */}
                          {step.logs && step.logs.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Logs:
                              </p>
                              <div className="space-y-1">
                                {step.logs.map((log, logIndex) => (
                                  <p
                                    key={logIndex}
                                    className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded"
                                  >
                                    {log}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timing */}
                          {step.started_at && step.completed_at && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Duration:{" "}
                              {Math.round(
                                (new Date(step.completed_at).getTime() -
                                  new Date(step.started_at).getTime()) /
                                  1000
                              )}{" "}
                              seconds
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {execution?.status === "completed" && (
        <div className="p-4 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              Execution completed successfully
            </p>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {steps.filter((s) => s.status === "completed").length} of {steps.length} steps completed
          </p>
        </div>
      )}

      {execution?.status === "failed" && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Execution failed
            </p>
          </div>
          {execution.error_message && (
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {execution.error_message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
