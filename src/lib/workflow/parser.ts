/**
 * Natural Language to Workflow Parser
 * Converts user instructions into structured multi-step workflows
 */

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'loop' | 'delay' | 'webhook';
  name: string;
  description: string;
  app?: string; // e.g., 'gmail', 'slack', 'github'
  action?: string; // e.g., 'send_email', 'create_issue'
  parameters?: Record<string, any>;
  conditions?: {
    if: string;
    then: WorkflowStep[];
    else?: WorkflowStep[];
  };
  dependsOn?: string[]; // IDs of steps that must complete first
  retry?: {
    maxAttempts: number;
    delay: number;
  };
}

export interface ParsedWorkflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedDuration?: number;
  requiredApps?: string[];
}

/**
 * Parse natural language into structured workflow
 */
export async function parseNaturalLanguageToWorkflow(
  instruction: string,
  availableApps: string[] = [],
  model: 'openai' | 'gemini' = 'openai'
): Promise<ParsedWorkflow> {
  // First, try to detect workflow patterns
  const detectedPatterns = detectWorkflowPatterns(instruction);
  
  // If we can parse it with simple patterns, use that
  if (detectedPatterns.steps.length > 0) {
    return {
      name: detectedPatterns.name || 'Generated Workflow',
      description: instruction,
      steps: detectedPatterns.steps,
      requiredApps: detectedPatterns.requiredApps,
    };
  }

  // Otherwise, use AI to parse
  return await parseWithAI(instruction, availableApps, model);
}

/**
 * Detect common workflow patterns without AI
 */
function detectWorkflowPatterns(instruction: string): {
  name: string;
  steps: WorkflowStep[];
  requiredApps: string[];
} {
  const lower = instruction.toLowerCase();
  const steps: WorkflowStep[] = [];
  const requiredApps: string[] = [];
  let stepIndex = 0;

  // Pattern: "Send email then create task"
  const sendEmailMatch = lower.match(/(?:send|write|compose)\s+(?:an\s+)?(?:email|mail|message)\s+(?:to\s+)?([^\s,]+)?/i);
  if (sendEmailMatch) {
    const stepId = `step-${stepIndex++}`;
    steps.push({
      id: stepId,
      type: 'action',
      name: 'Send Email',
      description: `Send email${sendEmailMatch[1] ? ` to ${sendEmailMatch[1]}` : ''}`,
      app: 'gmail',
      action: 'send_email',
      parameters: {
        to: sendEmailMatch[1] || '{{user.email}}',
        subject: extractSubject(instruction),
        body: extractBody(instruction),
      },
    });
    if (!requiredApps.includes('gmail')) requiredApps.push('gmail');
  }

  // Pattern: "Create issue in GitHub"
  const createIssueMatch = lower.match(/(?:create|add|open)\s+(?:an\s+)?(?:issue|ticket)\s+(?:in|on|for)\s+github/i);
  if (createIssueMatch) {
    const stepId = `step-${stepIndex++}`;
    steps.push({
      id: stepId,
      type: 'action',
      name: 'Create GitHub Issue',
      description: 'Create issue in GitHub repository',
      app: 'github',
      action: 'create_issue',
      parameters: {
        title: extractTitle(instruction),
        body: extractBody(instruction),
      },
      dependsOn: steps.length > 0 ? [steps[steps.length - 1].id] : undefined,
    });
    if (!requiredApps.includes('github')) requiredApps.push('github');
  }

  // Pattern: "Post to Slack"
  const slackMatch = lower.match(/(?:post|send|message)\s+(?:to\s+)?slack/i);
  if (slackMatch) {
    const stepId = `step-${stepIndex++}`;
    steps.push({
      id: stepId,
      type: 'action',
      name: 'Post to Slack',
      description: 'Send message to Slack channel',
      app: 'slack',
      action: 'send_message',
      parameters: {
        channel: extractChannel(instruction) || '#general',
        text: extractBody(instruction),
      },
      dependsOn: steps.length > 0 ? [steps[steps.length - 1].id] : undefined,
    });
    if (!requiredApps.includes('slack')) requiredApps.push('slack');
  }

  // Pattern: "Schedule meeting"
  const calendarMatch = lower.match(/(?:schedule|create|book)\s+(?:a\s+)?(?:meeting|event|appointment)/i);
  if (calendarMatch) {
    const stepId = `step-${stepIndex++}`;
    steps.push({
      id: stepId,
      type: 'action',
      name: 'Schedule Meeting',
      description: 'Create calendar event',
      app: 'googlecalendar',
      action: 'create_event',
      parameters: {
        title: extractTitle(instruction),
        startTime: extractTime(instruction),
        duration: extractDuration(instruction) || '1h',
      },
      dependsOn: steps.length > 0 ? [steps[steps.length - 1].id] : undefined,
    });
    if (!requiredApps.includes('googlecalendar')) requiredApps.push('googlecalendar');
  }

  // Pattern: "Wait for X then Y"
  const waitMatch = lower.match(/(?:wait|delay|pause)\s+(?:for\s+)?(\d+)\s*(?:minutes?|hours?|days?|seconds?)/i);
  if (waitMatch) {
    const stepId = `step-${stepIndex++}`;
    const duration = parseDuration(waitMatch[1], waitMatch[2] || 'minutes');
    steps.push({
      id: stepId,
      type: 'delay',
      name: `Wait ${waitMatch[1]} ${waitMatch[2] || 'minutes'}`,
      description: `Delay execution for ${waitMatch[1]} ${waitMatch[2] || 'minutes'}`,
      parameters: {
        duration: duration,
      },
      dependsOn: steps.length > 0 ? [steps[steps.length - 1].id] : undefined,
    });
  }

  // Pattern: "If X then Y"
  const conditionMatch = lower.match(/if\s+(.+?)\s+then\s+(.+)/i);
  if (conditionMatch) {
    const stepId = `step-${stepIndex++}`;
    const condition = conditionMatch[1];
    const thenAction = conditionMatch[2];
    
    steps.push({
      id: stepId,
      type: 'condition',
      name: `If ${condition}`,
      description: `Conditional step: ${condition}`,
      conditions: {
        if: condition,
        then: parseSimpleAction(thenAction, stepIndex),
      },
      dependsOn: steps.length > 0 ? [steps[steps.length - 1].id] : undefined,
    });
  }

  return {
    name: generateWorkflowName(instruction),
    steps,
    requiredApps,
  };
}

/**
 * Parse workflow using AI (OpenAI or Gemini)
 */
async function parseWithAI(
  instruction: string,
  availableApps: string[],
  model: 'openai' | 'gemini'
): Promise<ParsedWorkflow> {
  const prompt = `Parse the following user instruction into a structured workflow with multiple steps.

User Instruction: "${instruction}"

Available Apps: ${availableApps.join(', ')}

Return a JSON object with this structure:
{
  "name": "Workflow name",
  "description": "Brief description",
  "steps": [
    {
      "id": "step-0",
      "type": "action|condition|loop|delay",
      "name": "Step name",
      "description": "What this step does",
      "app": "app_name",
      "action": "action_name",
      "parameters": {},
      "dependsOn": ["step-id"] // optional
    }
  ],
  "requiredApps": ["app1", "app2"]
}

Only return valid JSON, no markdown formatting.`;

  try {
    if (model === 'openai') {
      const response = await fetch('/api/workflows/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, availableApps }),
      });
      return await response.json();
    } else {
      // Gemini fallback
      const response = await fetch('/api/workflows/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, availableApps, model: 'gemini' }),
      });
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to parse with AI:', error);
    // Fallback to simple pattern detection
    return {
      name: generateWorkflowName(instruction),
      description: instruction,
      steps: detectWorkflowPatterns(instruction).steps,
      requiredApps: detectWorkflowPatterns(instruction).requiredApps,
    };
  }
}

// Helper functions
function extractSubject(text: string): string {
  const match = text.match(/subject[:\s]+([^\n,]+)/i);
  return match ? match[1].trim() : 'No Subject';
}

function extractBody(text: string): string {
  const match = text.match(/body[:\s]+([^\n]+)/i) || text.match(/content[:\s]+([^\n]+)/i);
  return match ? match[1].trim() : text;
}

function extractTitle(text: string): string {
  const match = text.match(/title[:\s]+([^\n,]+)/i);
  return match ? match[1].trim() : 'Untitled';
}

function extractChannel(text: string): string | null {
  const match = text.match(/(?:channel|#)([^\s,]+)/i);
  return match ? match[1].trim() : null;
}

function extractTime(text: string): string {
  const match = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i) || text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (match) {
    return `${match[1]}:${match[2] || '00'} ${match[3] || 'am'}`;
  }
  return new Date().toISOString();
}

function extractDuration(text: string): string | null {
  const match = text.match(/(\d+)\s*(?:minutes?|hours?|days?)/i);
  return match ? `${match[1]}${match[2]?.charAt(0) || 'm'}` : null;
}

function parseDuration(value: string, unit: string): number {
  const num = parseInt(value);
  const unitLower = unit.toLowerCase();
  if (unitLower.includes('hour')) return num * 3600000;
  if (unitLower.includes('day')) return num * 86400000;
  if (unitLower.includes('minute')) return num * 60000;
  return num * 1000; // seconds
}

function parseSimpleAction(action: string, startIndex: number): WorkflowStep[] {
  // Simple action parser for conditional branches
  const steps: WorkflowStep[] = [];
  // This is a simplified version - in production, use AI parsing
  return steps;
}

function generateWorkflowName(instruction: string): string {
  // Generate a name from the first few words
  const words = instruction.split(' ').slice(0, 5);
  return words.join(' ') + (instruction.length > 30 ? '...' : '');
}
