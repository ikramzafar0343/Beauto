"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { Loader2, Plus, Play, Save, Trash2, LayoutGrid, List } from "lucide-react";
import { WORKFLOW_TEMPLATES } from "@/lib/workflows/templates";

type Workflow = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  steps: any[];
  created_at: string;
};

type StepState = {
  id: string;
  step_index: number;
  step_name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  output_data?: any;
  error_message?: string | null;
};

type StepsViewMode = "canvas" | "list";

function getDefaultStepUiPosition(idx: number) {
  const colCount = 3;
  const col = idx % colCount;
  const row = Math.floor(idx / colCount);
  return { x: 80 + col * 260, y: 60 + row * 140 };
}

function WorkflowCanvas(props: {
  steps: any[];
  timeline: StepState[];
  onChangeLocal: (nextSteps: any[]) => void;
  onPersist: (nextSteps: any[]) => void;
  selectedStepId: string | null;
  onSelectStepId: (id: string | null) => void;
}) {
  const { steps, timeline, onChangeLocal, onPersist, selectedStepId, onSelectStepId } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    stepId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const stepsWithIds = useMemo(
    () => steps.map((s: any, idx: number) => ({ ...s, id: String(s.id || `step-${idx}`) })),
    [steps]
  );

  const latestStepsRef = useRef<any[]>(stepsWithIds);
  useEffect(() => {
    latestStepsRef.current = stepsWithIds;
  }, [stepsWithIds]);

  const stepsById = useMemo(() => {
    const m = new Map<string, any>();
    stepsWithIds.forEach((s) => m.set(String(s.id), s));
    return m;
  }, [stepsWithIds]);

  const nodeRects = useMemo(() => {
    return stepsWithIds.map((s: any, idx: number) => {
      const ui = s.ui || {};
      const pos = typeof ui.x === "number" && typeof ui.y === "number" ? { x: ui.x, y: ui.y } : getDefaultStepUiPosition(idx);
      return { id: String(s.id), idx, x: pos.x, y: pos.y, w: 220, h: 90 };
    });
  }, [stepsWithIds]);

  const rectById = useMemo(() => {
    const m = new Map<string, { id: string; idx: number; x: number; y: number; w: number; h: number }>();
    nodeRects.forEach((r) => m.set(String(r.id), r));
    return m;
  }, [nodeRects]);

  const statusByIndex = useMemo(() => {
    const m = new Map<number, StepState["status"]>();
    timeline.forEach((t) => m.set(t.step_index, t.status));
    return m;
  }, [timeline]);

  const edges = useMemo(() => {
    const out: Array<{ from: string; to: string }> = [];
    stepsWithIds.forEach((s: any) => {
      const to = String(s.id);
      const deps: any[] = Array.isArray(s.dependsOn) ? s.dependsOn : [];
      deps.forEach((d) => out.push({ from: String(d), to }));
    });
    return out;
  }, [stepsWithIds]);

  const updateStepUi = (stepId: string, nextUi: { x: number; y: number }) => {
    const next = stepsWithIds.map((s: any) => (String(s.id) === stepId ? { ...s, ui: { ...(s.ui || {}), ...nextUi } } : s));
    onChangeLocal(next);
  };

  const toggleDependency = (depId: string, targetId: string) => {
    const next = stepsWithIds.map((s: any) => {
      if (String(s.id) !== targetId) return s;
      const existing = Array.isArray(s.dependsOn) ? s.dependsOn.map((x: any) => String(x)) : [];
      const dep = String(depId);
      const updated = existing.includes(dep) ? existing.filter((x: string) => x !== dep) : [...existing, dep];
      return { ...s, dependsOn: updated };
    });
    onChangeLocal(next);
    onPersist(next);
  };

  const onPointerDownNode = (e: ReactPointerEvent, stepId: string) => {
    const r = rectById.get(stepId);
    if (!r) return;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      stepId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: r.x,
      startY: r.y,
    };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startClientX;
    const dy = e.clientY - d.startClientY;
    updateStepUi(d.stepId, { x: Math.round(d.startX + dx), y: Math.round(d.startY + dy) });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    onPersist(latestStepsRef.current);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] rounded-2xl border border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#0a0a0a] overflow-auto"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="relative min-w-[920px] min-h-[620px]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge, i) => {
            const a = rectById.get(edge.from);
            const b = rectById.get(edge.to);
            if (!a || !b) return null;
            const x1 = a.x + a.w;
            const y1 = a.y + a.h / 2;
            const x2 = b.x;
            const y2 = b.y + b.h / 2;
            const midX = (x1 + x2) / 2;
            const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
            return <path key={i} d={d} stroke="rgba(52,52,52,0.35)" strokeWidth={2} fill="none" />;
          })}
        </svg>

        {nodeRects.map((r) => {
          const step = stepsById.get(String(r.id));
          const isSelected = selectedStepId === r.id;
          const status = statusByIndex.get(r.idx);
          const pill =
            status === "running"
              ? "bg-blue-600 text-white"
              : status === "completed"
                ? "bg-emerald-600 text-white"
                : status === "failed"
                  ? "bg-red-600 text-white"
                  : "bg-[#e9ecef] dark:bg-[#1a1a1a] text-[#343434] dark:text-white";

          return (
            <div
              key={r.id}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
              className={`absolute rounded-2xl border ${
                isSelected ? "border-[#343434] dark:border-white" : "border-[#dae0e2] dark:border-[#27272a]"
              } bg-white dark:bg-[#0a0a0a] shadow-sm`}
              onClick={(e) => {
                if (e.shiftKey && selectedStepId && selectedStepId !== r.id) {
                  toggleDependency(selectedStepId, r.id);
                  onSelectStepId(r.id);
                  return;
                }
                onSelectStepId(r.id);
              }}
            >
              <div
                className="px-4 py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => onPointerDownNode(e, String(r.id))}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#343434] dark:text-white line-clamp-1">
                      {r.idx + 1}. {step?.name || `Step ${r.idx + 1}`}
                    </div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60 line-clamp-1">
                      {step?.type || "action"} {step?.app ? `• ${step.app}` : ""} {step?.action ? `• ${step.action}` : ""}
                    </div>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded-full ${pill}`}>{status || "idle"}</div>
                </div>
                <div className="mt-2 text-[10px] text-[#343434]/60 dark:text-white/60">
                  {Array.isArray(step?.dependsOn) && step.dependsOn.length > 0 ? `Depends on: ${step.dependsOn.length}` : "No deps"}
                  {selectedStepId === r.id ? " • shift-click another step to add/remove dependency" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function coerceNumber(v: any) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function SchemaEditor(props: {
  schema: any;
  value: any;
  required?: string[];
  onChange: (next: any) => void;
}) {
  const { schema, value, required = [], onChange } = props;
  const properties = schema?.properties || {};
  const keys = Object.keys(properties);

  if (keys.length === 0) {
    return (
      <textarea
        value={JSON.stringify(value ?? {}, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {}
        }}
        rows={6}
        className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-xs font-mono text-[#343434] dark:text-white"
      />
    );
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        const s = properties[key];
        const t = s?.type;
        const isRequired = required.includes(key);
        const fieldLabel = `${key}${isRequired ? " *" : ""}`;
        const fieldValue = value?.[key];

        if (Array.isArray(s?.enum)) {
          return (
            <label key={key} className="block">
              <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">{fieldLabel}</div>
              <select
                value={fieldValue ?? ""}
                onChange={(e) => onChange({ ...(value || {}), [key]: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
              >
                <option value="">Select…</option>
                {s.enum.map((opt: any) => (
                  <option key={String(opt)} value={String(opt)}>
                    {String(opt)}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (t === "boolean") {
          return (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(fieldValue)}
                onChange={(e) => onChange({ ...(value || {}), [key]: e.target.checked })}
                className="w-4 h-4"
              />
              <div className="text-sm text-[#343434] dark:text-white">{fieldLabel}</div>
            </label>
          );
        }

        if (t === "number" || t === "integer") {
          return (
            <label key={key} className="block">
              <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">{fieldLabel}</div>
              <input
                type="number"
                value={fieldValue ?? ""}
                onChange={(e) => onChange({ ...(value || {}), [key]: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
              />
            </label>
          );
        }

        if (t === "object" || t === "array") {
          return (
            <label key={key} className="block">
              <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">{fieldLabel}</div>
              <textarea
                value={JSON.stringify(fieldValue ?? (t === "array" ? [] : {}), null, 2)}
                onChange={(e) => {
                  try {
                    onChange({ ...(value || {}), [key]: JSON.parse(e.target.value) });
                  } catch {}
                }}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-xs font-mono text-[#343434] dark:text-white"
              />
            </label>
          );
        }

        return (
          <label key={key} className="block">
            <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">{fieldLabel}</div>
            <input
              value={fieldValue ?? ""}
              onChange={(e) => onChange({ ...(value || {}), [key]: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
            />
          </label>
        );
      })}
    </div>
  );
}

export default function StudioPage() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const selectedWorkflow = useMemo(() => workflows.find((w) => w.id === selectedWorkflowId) || null, [workflows, selectedWorkflowId]);

  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleCron, setScheduleCron] = useState("");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const [instruction, setInstruction] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<any | null>(null);

  const [saving, setSaving] = useState(false);

  const [executing, setExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<StepState[]>([]);
  const streamAbortRef = useRef<AbortController | null>(null);

  const [stepsView, setStepsView] = useState<StepsViewMode>("canvas");
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const [toolkitSearch, setToolkitSearch] = useState("");
  const [toolkitLoading, setToolkitLoading] = useState(false);
  const [toolkitResults, setToolkitResults] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolResults, setToolResults] = useState<any[]>([]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workflows");
      const data = await res.json();
      const items = (data.workflows || []) as Workflow[];
      setWorkflows(items);
      if (!selectedWorkflowId && items.length > 0) setSelectedWorkflowId(items[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!selectedWorkflowId) return;
      setScheduleLoading(true);
      try {
        const res = await fetch(`/api/workflows/${selectedWorkflowId}/schedule`);
        const data = await res.json();
        const s = data.schedule;
        if (s) {
          setScheduleCron(s.cron || "");
          setScheduleTimezone(s.timezone || "UTC");
          setScheduleEnabled(Boolean(s.enabled));
        } else {
          setScheduleCron("");
          setScheduleTimezone("UTC");
          setScheduleEnabled(false);
        }
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, [selectedWorkflowId]);

  useEffect(() => {
    if (!selectedWorkflow?.steps) {
      setSelectedStepId(null);
      return;
    }
    const first = selectedWorkflow.steps[0];
    setSelectedStepId(first ? String(first.id || "step-0") : null);
  }, [selectedWorkflowId]);

  const parse = async () => {
    if (!instruction.trim()) return;
    setParsing(true);
    setParsed(null);
    try {
      const res = await fetch("/api/workflows/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setParsed(data);
    } catch (e: any) {
      alert(e.message || "Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const saveNewWorkflow = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: parsed.name || "Untitled workflow",
          description: parsed.description || instruction,
          steps: parsed.steps || [],
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setWorkflows((prev) => [data.workflow, ...prev]);
      setSelectedWorkflowId(data.workflow.id);
      setParsed(null);
      setInstruction("");
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const createFromTemplate = async (templateId: string) => {
    const t = WORKFLOW_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: t.name, description: t.description, steps: t.steps, status: "draft" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setWorkflows((prev) => [data.workflow, ...prev]);
      setSelectedWorkflowId(data.workflow.id);
      setStepsView("canvas");
      setSelectedStepId(String((data.workflow.steps?.[0]?.id as any) || "step-0"));
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedWorkflow = async (patch: Partial<Workflow>) => {
    if (!selectedWorkflow) return;
    const next = { ...selectedWorkflow, ...patch };
    setWorkflows((prev) => prev.map((w) => (w.id === next.id ? next : w)));
    const res = await fetch(`/api/workflows/${selectedWorkflow.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Save failed");
  };

  const updateSelectedWorkflowLocal = (patch: Partial<Workflow>) => {
    if (!selectedWorkflow) return;
    const next = { ...selectedWorkflow, ...patch };
    setWorkflows((prev) => prev.map((w) => (w.id === next.id ? next : w)));
  };

  const selectedStep = useMemo(() => {
    if (!selectedWorkflow || !selectedWorkflow.steps || !selectedStepId) return null;
    const steps = selectedWorkflow.steps.map((s: any, i: number) => ({ ...s, id: String(s.id || `step-${i}`) }));
    return steps.find((s: any) => String(s.id) === selectedStepId) || null;
  }, [selectedWorkflow, selectedStepId]);

  const updateSelectedStep = (patch: any) => {
    if (!selectedWorkflow || !selectedWorkflow.steps || !selectedStepId) return;
    const nextSteps = selectedWorkflow.steps.map((s: any, i: number) => {
      const id = String(s.id || `step-${i}`);
      return id === selectedStepId ? { ...s, ...patch, id } : s;
    });
    updateSelectedWorkflow({ steps: nextSteps });
  };

  const loadToolkits = async (query: string) => {
    setToolkitLoading(true);
    try {
      const res = await fetch(`/api/composio/toolkits?search=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      setToolkitResults(data.toolkits || []);
    } finally {
      setToolkitLoading(false);
    }
  };

  const loadTools = async (toolkit: string) => {
    if (!toolkit) return;
    setToolsLoading(true);
    try {
      const res = await fetch(`/api/composio/tools?toolkit=${encodeURIComponent(toolkit)}`);
      const data = await res.json();
      setToolResults(data.tools || []);
    } finally {
      setToolsLoading(false);
    }
  };

  useEffect(() => {
    const app = selectedStep?.app ? String(selectedStep.app) : "";
    if (!app) {
      setToolResults([]);
      return;
    }
    loadTools(app);
  }, [selectedStep?.app]);

  const removeSelectedWorkflow = async () => {
    if (!selectedWorkflow) return;
    if (!confirm("Delete this workflow?")) return;
    const res = await fetch(`/api/workflows/${selectedWorkflow.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }
    setWorkflows((prev) => prev.filter((w) => w.id !== selectedWorkflow.id));
    setSelectedWorkflowId((prev) => {
      const remaining = workflows.filter((w) => w.id !== selectedWorkflow.id);
      return remaining[0]?.id || null;
    });
  };

  const saveSchedule = async () => {
    if (!selectedWorkflowId) return;
    if (!scheduleCron.trim()) {
      const res = await fetch(`/api/workflows/${selectedWorkflowId}/schedule`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to clear schedule");
      return;
    }

    setScheduleSaving(true);
    try {
      const res = await fetch(`/api/workflows/${selectedWorkflowId}/schedule`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cron: scheduleCron, timezone: scheduleTimezone, enabled: scheduleEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save schedule");
    } catch (e: any) {
      alert(e.message || "Failed to save schedule");
    } finally {
      setScheduleSaving(false);
    }
  };

  const runStream = async () => {
    if (!selectedWorkflow) return;
    setExecuting(true);
    setExecutionId(null);
    setTimeline([]);
    streamAbortRef.current?.abort();
    const abort = new AbortController();
    streamAbortRef.current = abort;

    try {
      const res = await fetch(`/api/workflows/${selectedWorkflow.id}/execute-stream`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputData: {} }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "Failed to start execution");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const applyEvent = (event: string, data: any) => {
        if (event === "execution_started") setExecutionId(data.executionId);
        if (event === "step_started") {
          setTimeline((prev) => {
            const existing = prev.find((s) => s.step_index === data.stepIndex);
            const row: StepState = existing || { id: data.stepId, step_index: data.stepIndex, step_name: data.name, status: "running" as const };
            return [...prev.filter((s) => s.step_index !== data.stepIndex), { ...row, status: "running" as const }].sort((a, b) => a.step_index - b.step_index);
          });
        }
        if (event === "step_completed") {
          setTimeline((prev) => {
            const existing = prev.find((s) => s.step_index === data.stepIndex);
            const row: StepState = existing || { id: data.stepId, step_index: data.stepIndex, step_name: `Step ${data.stepIndex + 1}`, status: "completed" as const };
            return [...prev.filter((s) => s.step_index !== data.stepIndex), { ...row, status: "completed" as const, output_data: data.result }].sort((a, b) => a.step_index - b.step_index);
          });
        }
        if (event === "step_failed") {
          setTimeline((prev) => {
            const existing = prev.find((s) => s.step_index === data.stepIndex);
            const row: StepState = existing || { id: `step-${data.stepIndex}`, step_index: data.stepIndex, step_name: `Step ${data.stepIndex + 1}`, status: "failed" as const };
            return [...prev.filter((s) => s.step_index !== data.stepIndex), { ...row, status: "failed" as const, error_message: data.message }].sort((a, b) => a.step_index - b.step_index);
          });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const idx = buffer.indexOf("\n\n");
          if (idx === -1) break;
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const eventMatch = chunk.match(/^event:\s*(.+)$/m);
          const dataMatch = chunk.match(/^data:\s*(.+)$/m);
          if (!eventMatch || !dataMatch) continue;
          const event = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1]);
          applyEvent(event, data);
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") alert(e.message || "Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur border-b border-[#dae0e2] dark:border-[#27272a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#343434] text-white flex items-center justify-center text-sm font-bold">R</div>
            <div>
              <div className="text-sm font-semibold text-[#343434] dark:text-white">Workflow Studio</div>
              <div className="text-xs text-[#343434]/60 dark:text-white/60">Natural language → workflow → execution timeline</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="px-4 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white">
              Marketplace
            </Link>
            <Link href="/settings/mcp" className="px-4 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white">
              MCP
            </Link>
            <Link href="/settings/models" className="px-4 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white">
              Models
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 space-y-4">
          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#343434] dark:text-white">Workflows</div>
              <button onClick={loadWorkflows} className="text-xs text-[#343434]/60 dark:text-white/60">
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#343434]/40 dark:text-white/40" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="py-6 text-sm text-[#343434]/60 dark:text-white/60">No workflows yet.</div>
            ) : (
              <div className="mt-3 space-y-2">
                {workflows.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkflowId(w.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border ${
                      selectedWorkflowId === w.id
                        ? "border-[#343434] dark:border-white bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                        : "border-[#dae0e2] dark:border-[#27272a] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#343434] dark:text-white line-clamp-1">{w.name}</div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60">{(w.steps?.length || 0)} steps</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-4 space-y-3">
            <div className="text-sm font-semibold text-[#343434] dark:text-white">Generate from text</div>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={4}
              placeholder='Example: "Summarize today’s new GitHub issues and post to Slack #dev"'
              className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={parse}
                disabled={parsing || !instruction.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium disabled:opacity-50"
              >
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Generate
              </button>
              <button
                onClick={saveNewWorkflow}
                disabled={!parsed || saving}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
            {parsed && (
              <div className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#0a0a0a] p-3">
                <div className="text-xs font-semibold text-[#343434] dark:text-white">{parsed.name}</div>
                <div className="text-xs text-[#343434]/60 dark:text-white/60 mt-1">{parsed.description}</div>
                <div className="text-xs text-[#343434]/60 dark:text-white/60 mt-2">{(parsed.steps || []).length} steps</div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[#343434] dark:text-white">Templates</div>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-[#343434]/40 dark:text-white/40" />}
            </div>
            <div className="space-y-2">
              {WORKFLOW_TEMPLATES.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => createFromTemplate(t.id)}
                  disabled={saving}
                  className="w-full text-left px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a] disabled:opacity-50"
                >
                  <div className="text-sm font-medium text-[#343434] dark:text-white">{t.name}</div>
                  <div className="text-xs text-[#343434]/60 dark:text-white/60 line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-6 space-y-4">
          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[#343434] dark:text-white">{selectedWorkflow?.name || "Select a workflow"}</div>
                <div className="text-xs text-[#343434]/60 dark:text-white/60">{selectedWorkflow?.description || ""}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSelectedWorkflow({ status: selectedWorkflow?.status === "active" ? "paused" : "active" })}
                  disabled={!selectedWorkflow}
                  className="px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white disabled:opacity-50"
                >
                  {selectedWorkflow?.status === "active" ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={removeSelectedWorkflow}
                  disabled={!selectedWorkflow}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-red-600 dark:text-red-400 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
            {selectedWorkflow && (
              <div className="mt-5 rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#343434] dark:text-white">Schedule</div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60">Cron (5-field) + timezone. Runs via Vercel cron.</div>
                  </div>
                  <button
                    onClick={saveSchedule}
                    disabled={scheduleSaving || scheduleLoading}
                    className="px-4 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium disabled:opacity-50"
                  >
                    {scheduleSaving ? "Saving…" : "Save"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={scheduleCron}
                    onChange={(e) => setScheduleCron(e.target.value)}
                    placeholder="*/15 * * * *"
                    className="md:col-span-2 px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                  />
                  <input
                    value={scheduleTimezone}
                    onChange={(e) => setScheduleTimezone(e.target.value)}
                    placeholder="UTC"
                    className="px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div className="text-sm text-[#343434] dark:text-white">Enabled</div>
                  {scheduleLoading && <div className="text-xs text-[#343434]/60 dark:text-white/60">Loading…</div>}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#343434] dark:text-white">Steps</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStepsView("canvas")}
                  className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 ${
                    stepsView === "canvas"
                      ? "border-[#343434] dark:border-white bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                      : "border-[#dae0e2] dark:border-[#27272a]"
                  } text-[#343434] dark:text-white`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Canvas
                </button>
                <button
                  onClick={() => setStepsView("list")}
                  className={`px-3 py-2 rounded-xl border text-sm inline-flex items-center gap-2 ${
                    stepsView === "list"
                      ? "border-[#343434] dark:border-white bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                      : "border-[#dae0e2] dark:border-[#27272a]"
                  } text-[#343434] dark:text-white`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => runStream()}
                  disabled={!selectedWorkflow || executing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#343434] dark:bg-white text-white dark:text-[#0a0a0a] text-sm font-medium disabled:opacity-50"
                >
                  {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run
                </button>
              </div>
            </div>

            {!selectedWorkflow ? (
              <div className="text-sm text-[#343434]/60 dark:text-white/60">Pick a workflow from the left.</div>
            ) : selectedWorkflow.steps?.length ? (
              stepsView === "canvas" ? (
                <WorkflowCanvas
                  steps={selectedWorkflow.steps}
                  timeline={timeline}
                  onChangeLocal={(nextSteps) => updateSelectedWorkflowLocal({ steps: nextSteps })}
                  onPersist={(nextSteps) => updateSelectedWorkflow({ steps: nextSteps })}
                  selectedStepId={selectedStepId}
                  onSelectStepId={setSelectedStepId}
                />
              ) : (
                <div className="space-y-3">
                  {selectedWorkflow.steps.map((step: any, idx: number) => (
                    <div key={step.id || idx} className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#343434] dark:text-white">
                            {idx + 1}. {step.name || `Step ${idx + 1}`}
                          </div>
                          <div className="text-xs text-[#343434]/60 dark:text-white/60">
                            {step.type || "action"} {step.app ? `• ${step.app}` : ""} {step.action ? `• ${step.action}` : ""}
                          </div>
                        </div>
                      </div>
                      <textarea
                        value={JSON.stringify(step.parameters || {}, null, 2)}
                        onChange={(e) => {
                          let nextParams: any = {};
                          try {
                            nextParams = JSON.parse(e.target.value);
                          } catch {
                            return;
                          }
                          const nextSteps = selectedWorkflow.steps.map((s: any, i: number) => (i === idx ? { ...s, parameters: nextParams } : s));
                          updateSelectedWorkflow({ steps: nextSteps });
                        }}
                        rows={4}
                        className="mt-3 w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-xs font-mono text-[#343434] dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-sm text-[#343434]/60 dark:text-white/60">This workflow has no steps.</div>
            )}

            {selectedWorkflow && selectedStep && (
              <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-5 bg-white dark:bg-[#0a0a0a]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#343434] dark:text-white">Step editor</div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60">{selectedStepId}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="block">
                    <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">Name</div>
                    <input
                      value={selectedStep.name || ""}
                      onChange={(e) => updateSelectedStep({ name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">Type</div>
                    <select
                      value={selectedStep.type || "action"}
                      onChange={(e) => updateSelectedStep({ type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                    >
                      <option value="action">action</option>
                      <option value="delay">delay</option>
                    </select>
                  </label>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-[#343434] dark:text-white mb-2">Dependencies</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflow.steps
                      .map((s: any, i: number) => ({ ...s, id: String(s.id || `step-${i}`) }))
                      .filter((s: any) => s.id !== selectedStepId)
                      .map((s: any) => {
                        const deps = Array.isArray(selectedStep.dependsOn) ? selectedStep.dependsOn.map((x: any) => String(x)) : [];
                        const checked = deps.includes(String(s.id));
                        return (
                          <label
                            key={s.id}
                            className={`px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                              checked
                                ? "border-[#343434] dark:border-white bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                                : "border-[#dae0e2] dark:border-[#27272a]"
                            } text-[#343434] dark:text-white`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked ? [...deps, String(s.id)] : deps.filter((x: string) => x !== String(s.id));
                                updateSelectedStep({ dependsOn: next });
                              }}
                              className="mr-2"
                            />
                            {s.name || s.id}
                          </label>
                        );
                      })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block">
                    <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">Retry attempts</div>
                    <input
                      type="number"
                      value={selectedStep.retry?.maxAttempts ?? 1}
                      onChange={(e) => updateSelectedStep({ retry: { ...(selectedStep.retry || {}), maxAttempts: coerceNumber(e.target.value || 1) } })}
                      className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">Backoff (ms)</div>
                    <input
                      type="number"
                      value={selectedStep.retry?.backoffMs ?? 1000}
                      onChange={(e) => updateSelectedStep({ retry: { ...(selectedStep.retry || {}), backoffMs: coerceNumber(e.target.value || 0) } })}
                      className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                    />
                  </label>
                  {selectedStep.type === "delay" ? (
                    <label className="block">
                      <div className="text-xs font-semibold text-[#343434] dark:text-white mb-1">Duration (ms)</div>
                      <input
                        type="number"
                        value={selectedStep.parameters?.duration ?? 1000}
                        onChange={(e) => updateSelectedStep({ parameters: { ...(selectedStep.parameters || {}), duration: coerceNumber(e.target.value || 0) } })}
                        className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                      />
                    </label>
                  ) : (
                    <div />
                  )}
                </div>

                {selectedStep.type !== "delay" && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-4">
                      <div className="text-xs font-semibold text-[#343434] dark:text-white">Toolkit</div>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={toolkitSearch}
                          onChange={(e) => setToolkitSearch(e.target.value)}
                          placeholder={selectedStep.app || "Search toolkits (e.g. slack, github)"}
                          className="flex-1 px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white"
                        />
                        <button
                          onClick={() => loadToolkits(toolkitSearch || "")}
                          disabled={toolkitLoading}
                          className="px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] text-sm text-[#343434] dark:text-white disabled:opacity-50"
                        >
                          {toolkitLoading ? "…" : "Search"}
                        </button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {(toolkitResults || []).slice(0, 8).map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              updateSelectedStep({ app: t.id, action: "", parameters: {} });
                              setToolkitResults([]);
                              setToolkitSearch("");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl border ${
                              String(selectedStep.app || "") === String(t.id)
                                ? "border-[#343434] dark:border-white bg-[#f8f9fa] dark:bg-[#0a0a0a]"
                                : "border-[#dae0e2] dark:border-[#27272a] hover:bg-[#f8f9fa] dark:hover:bg-[#1a1a1a]"
                            }`}
                          >
                            <div className="text-sm font-medium text-[#343434] dark:text-white">{t.name}</div>
                            <div className="text-xs text-[#343434]/60 dark:text-white/60">{t.id}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-[#343434] dark:text-white">Action</div>
                        {toolsLoading && <div className="text-xs text-[#343434]/60 dark:text-white/60">Loading…</div>}
                      </div>
                      <div className="mt-2">
                        <select
                          value={selectedStep.action || ""}
                          onChange={(e) => updateSelectedStep({ action: e.target.value })}
                          disabled={!selectedStep.app}
                          className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-sm text-[#343434] dark:text-white disabled:opacity-50"
                        >
                          <option value="">{selectedStep.app ? "Select an action…" : "Pick a toolkit first"}</option>
                          {toolResults.map((t: any) => (
                            <option key={t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs font-semibold text-[#343434] dark:text-white mb-2">Parameters</div>
                        {(() => {
                          const tool = toolResults.find((t: any) => String(t.name) === String(selectedStep.action));
                          const schema = tool?.inputSchema || null;
                          const required = Array.isArray(schema?.required) ? schema.required : Array.isArray(schema?.schema?.required) ? schema.schema.required : [];
                          const schemaObj = schema?.schema || schema;
                          if (!schemaObj) {
                            return (
                              <textarea
                                value={JSON.stringify(selectedStep.parameters || {}, null, 2)}
                                onChange={(e) => {
                                  try {
                                    updateSelectedStep({ parameters: JSON.parse(e.target.value) });
                                  } catch {}
                                }}
                                rows={6}
                                className="w-full px-3 py-2 rounded-xl border border-[#dae0e2] dark:border-[#27272a] bg-white dark:bg-[#0a0a0a] text-xs font-mono text-[#343434] dark:text-white"
                              />
                            );
                          }
                          return (
                            <SchemaEditor
                              schema={schemaObj}
                              required={required}
                              value={selectedStep.parameters || {}}
                              onChange={(next) => updateSelectedStep({ parameters: next })}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <aside className="col-span-12 md:col-span-3 space-y-4">
          <div className="rounded-2xl border border-[#dae0e2] dark:border-[#27272a] p-5 space-y-3">
            <div className="text-sm font-semibold text-[#343434] dark:text-white">Run timeline</div>
            <div className="text-xs text-[#343434]/60 dark:text-white/60">
              Execution: {executionId || "—"}
            </div>
            {timeline.length === 0 ? (
              <div className="text-sm text-[#343434]/60 dark:text-white/60">No run yet.</div>
            ) : (
              <div className="space-y-2">
                {timeline.map((s) => (
                  <div key={s.step_index} className="rounded-xl border border-[#dae0e2] dark:border-[#27272a] p-3">
                    <div className="text-xs font-semibold text-[#343434] dark:text-white">
                      {s.step_index + 1}. {s.step_name}
                    </div>
                    <div className="text-xs text-[#343434]/60 dark:text-white/60 mt-1">Status: {s.status}</div>
                    {s.error_message && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{s.error_message}</div>}
                    {s.output_data && (
                      <pre className="mt-2 text-[10px] overflow-auto whitespace-pre-wrap text-[#343434] dark:text-white/90 bg-[#f8f9fa] dark:bg-[#0a0a0a] border border-[#dae0e2] dark:border-[#27272a] rounded-lg p-2">
                        {typeof s.output_data === "string" ? s.output_data : JSON.stringify(s.output_data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

