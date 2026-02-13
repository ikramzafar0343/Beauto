"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Save, Loader2, ArrowLeft, Trash2, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExecutionTimeline } from "@/components/workflow/ExecutionTimeline";
import { parseNaturalLanguageToWorkflow, type ParsedWorkflow } from "@/lib/workflow/parser";

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [parsedWorkflow, setParsedWorkflow] = useState<ParsedWorkflow | null>(null);
  const [parsing, setParsing] = useState(false);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [executingWorkflows, setExecutingWorkflows] = useState<Set<string>>(new Set());
  const [deletingWorkflows, setDeletingWorkflows] = useState<Set<string>>(new Set());
  const [copyingWorkflows, setCopyingWorkflows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows", {
        cache: "no-store", // Ensure fresh data
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleParseWorkflow = async () => {
    if (!naturalLanguageInput.trim()) return;

    setParsing(true);
    try {
      const response = await fetch("/api/workflows/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: naturalLanguageInput }),
      });

      const parsed = await response.json();
      setParsedWorkflow(parsed);
    } catch (error) {
      console.error("Failed to parse workflow:", error);
      alert("Failed to parse workflow. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!parsedWorkflow) return;

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsedWorkflow.name,
          description: parsedWorkflow.description,
          steps: parsedWorkflow.steps,
          status: "draft",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows([data.workflow, ...workflows]);
        setShowBuilder(false);
        setNaturalLanguageInput("");
        setParsedWorkflow(null);
        alert("Workflow saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
      alert("Failed to save workflow.");
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    if (executingWorkflows.has(workflowId)) return;
    
    setExecutingWorkflows(prev => new Set(prev).add(workflowId));
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputData: {} }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveExecutionId(data.executionId);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to execute workflow.");
      }
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      alert("Failed to execute workflow. Please try again.");
    } finally {
      setExecutingWorkflows(prev => {
        const next = new Set(prev);
        next.delete(workflowId);
        return next;
      });
    }
  };

  const handleCopyWorkflow = async (workflowId: string) => {
    if (copyingWorkflows.has(workflowId)) return;
    
    setCopyingWorkflows(prev => new Set(prev).add(workflowId));
    try {
      const response = await fetch(`/api/workflows/${workflowId}/copy`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        // Optimistic update - add new workflow to the list
        setWorkflows(prev => [data.workflow, ...prev]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to copy workflow.");
      }
    } catch (error) {
      console.error("Failed to copy workflow:", error);
      alert("Failed to copy workflow. Please try again.");
      // Refresh to get accurate state
      fetchWorkflows();
    } finally {
      setCopyingWorkflows(prev => {
        const next = new Set(prev);
        next.delete(workflowId);
        return next;
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (deletingWorkflows.has(workflowId)) return;
    
    if (!confirm("Are you sure you want to delete this workflow? This action cannot be undone.")) {
      return;
    }

    // Optimistic update - remove from UI immediately
    const originalWorkflows = [...workflows];
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    setDeletingWorkflows(prev => new Set(prev).add(workflowId));

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert on error
        setWorkflows(originalWorkflows);
        const error = await response.json();
        alert(error.error || "Failed to delete workflow.");
      }
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      // Revert on error
      setWorkflows(originalWorkflows);
      alert("Failed to delete workflow. Please try again.");
    } finally {
      setDeletingWorkflows(prev => {
        const next = new Set(prev);
        next.delete(workflowId);
        return next;
      });
    }
  };

  if (activeExecutionId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setActiveExecutionId(null)}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </button>
          <ExecutionTimeline executionId={activeExecutionId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Chat
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Workflows
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage automated workflows
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>

        {/* Workflow Builder */}
        {showBuilder && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Workflow from Natural Language
            </h2>
            <div className="space-y-4">
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="Example: Send an email to john@example.com, then create a GitHub issue, then post to Slack #dev channel"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                rows={4}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleParseWorkflow}
                  disabled={parsing || !naturalLanguageInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    "Parse Workflow"
                  )}
                </button>
                {parsedWorkflow && (
                  <button
                    onClick={handleSaveWorkflow}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Workflow
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowBuilder(false);
                    setNaturalLanguageInput("");
                    setParsedWorkflow(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Parsed Workflow Preview */}
              {parsedWorkflow && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Parsed Workflow: {parsedWorkflow.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {parsedWorkflow.description}
                  </p>
                  <div className="space-y-2">
                    {parsedWorkflow.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {step.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {step.description}
                          </p>
                          {step.app && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {step.app}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflows List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No workflows yet. Create your first workflow to get started.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {workflow.steps?.length || 0} steps
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {workflow.status}
                      </span>
                      <span>
                        Created {new Date(workflow.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                      disabled={executingWorkflows.has(workflow.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Execute workflow"
                    >
                      {executingWorkflows.has(workflow.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Execute
                    </button>
                    <button
                      onClick={() => handleCopyWorkflow(workflow.id)}
                      disabled={copyingWorkflows.has(workflow.id)}
                      className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy workflow"
                    >
                      {copyingWorkflows.has(workflow.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      disabled={deletingWorkflows.has(workflow.id)}
                      className="p-2 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete workflow"
                    >
                      {deletingWorkflows.has(workflow.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
