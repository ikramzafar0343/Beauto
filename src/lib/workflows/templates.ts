export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  steps: any[];
};

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "github-issues-to-slack",
    name: "GitHub issues → Slack digest",
    description: "Summarize new issues and post a digest to a Slack channel.",
    steps: [
      {
        id: "fetch_issues",
        name: "Fetch new issues",
        type: "action",
        app: "github",
        action: "GITHUB_LIST_ISSUES",
        parameters: { owner: "", repo: "", state: "open" },
        retry: { maxAttempts: 3, backoffMs: 1500 },
      },
      {
        id: "post_slack",
        name: "Post digest to Slack",
        type: "action",
        app: "slack",
        action: "SLACK_SEND_MESSAGE",
        dependsOn: ["fetch_issues"],
        parameters: { channel: "", text: "" },
        retry: { maxAttempts: 3, backoffMs: 1500 },
      },
    ],
  },
  {
    id: "gmail-triage",
    name: "Gmail triage",
    description: "Read unread email and label or summarize it.",
    steps: [
      {
        id: "list_unread",
        name: "List unread messages",
        type: "action",
        app: "gmail",
        action: "GMAIL_LIST_MESSAGES",
        parameters: { query: "is:unread", maxResults: 10 },
        retry: { maxAttempts: 3, backoffMs: 1500 },
      },
      {
        id: "summarize",
        name: "Summarize messages",
        type: "action",
        app: "openai",
        action: "OPENAI_RESPONSES_CREATE",
        dependsOn: ["list_unread"],
        parameters: { input: "Summarize the unread emails: {{steps.list_unread}}" },
        retry: { maxAttempts: 2, backoffMs: 1000 },
      },
    ],
  },
  {
    id: "delay-then-action",
    name: "Delay then run",
    description: "Wait for a duration, then execute an action.",
    steps: [
      { id: "wait", name: "Wait", type: "delay", parameters: { duration: 5000 } },
      {
        id: "do_thing",
        name: "Run action",
        type: "action",
        app: "",
        action: "",
        dependsOn: ["wait"],
        parameters: {},
      },
    ],
  },
];

