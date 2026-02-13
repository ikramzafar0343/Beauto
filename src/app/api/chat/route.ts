import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { OpenAIAgentsProvider } from "@composio/openai-agents";
import { Agent, run, hostedMcpTool } from "@openai/agents";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/config/env";

const ALL_TOOLKITS = [
  "gmail", "github", "slack", "googlecalendar", "gemini", "googlesheets", "instagram", 
  "hubspot", "notion", "shopify", "googledrive", "supabase", "airtable", "trello", 
  "asana", "dropbox", "zoom", "salesforce", "stripe", "linkedin", "twitter", 
  "facebook", "youtube", "discord", "telegram", "whatsapp", "mailchimp", 
  "sendgrid", "zendesk", "intercom", "calendly", "jira", "confluence", "bitbucket", 
  "gitlab", "figma", "canva", "box", "clickup", "monday", "todoist", "googlemeet", 
    "pipedrive", "brevo", "klaviyo", "ahrefs", 
    "semrush", "moz", "mixpanel", "amplitude", "segment", "openai", "replicate", 
    "elevenlabs", "heygen", "perplexityai", "bench", "browser_tool", "codeinterpreter", 
    "composio", "composio_search", "entelligence", "hackernews", "instacart", 
    "seat_geek", "test_app", "text_to_pdf", "weathermap", "yelp", "veo", "gemini"
  ];
  
  const NO_AUTH_TOOLKITS = [
    "gemini", "veo", "bench", "browser_tool", "codeinterpreter", "composio", 
    "composio_search", "entelligence", "hackernews", "instacart", "seat_geek", 
    "test_app", "text_to_pdf", "weathermap", "yelp", "openai", "replicate", "perplexityai"
  ];

  // Toolkits that are known to cause "auth config" errors if not explicitly configured
  // We should exclude these unless they are explicitly connected
  const PROBLEMATIC_TOOLKITS = ["basecamp", "spotify", "webex", "zendesk", "intercom", "hubspot", "salesforce"];


interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CustomContext {
  companyName: string;
  brandVoice: string;
  targetAudience: string;
  colors: string[];
  description: string;
  customKnowledge: string;
  crawledContent: string;
  files: string;
  logo: string | null;
  typography?: any;
  tonality?: any;
}

let composioInstance: any = null;

function getComposio() {
  if (composioInstance) return composioInstance;
  
  if (!process.env.COMPOSIO_API_KEY) {
    console.error("COMPOSIO_API_KEY is missing");
    throw new Error("COMPOSIO_API_KEY is missing");
  }

  try {
    composioInstance = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new OpenAIAgentsProvider(),
    });
    return composioInstance;
  } catch (error) {
    console.error("Failed to initialize Composio:", error);
    throw error;
  }
}

// Helper to safely access toolRouter
function getToolRouter(composioInstance: any) {
  if (!composioInstance) {
    throw new Error("Composio instance not initialized");
  }
  // Try different possible property names
  if (composioInstance.toolRouter) {
    return composioInstance.toolRouter;
  }
  if ((composioInstance as any).toolRouter) {
    return (composioInstance as any).toolRouter;
  }
  // Fallback: try to access via provider
  if (composioInstance.provider?.toolRouter) {
    return composioInstance.provider.toolRouter;
  }
  throw new Error("toolRouter not available on Composio instance. Check COMPOSIO_API_KEY and Composio SDK version.");
}

async function getConnectedAccounts(userId: string) {
  try {
    // Fetching connected accounts for user
    // Add a race to avoid hanging indefinitely on Composio API
    const response = await Promise.race([
      getComposio().connectedAccounts.list({ userIds: [userId] }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Composio API timeout")), 8000))
    ]) as any;
    // Connected accounts retrieved
    return response?.items || [];
  } catch (e: any) {
    console.warn(`[DEBUG] Failed to fetch connected accounts: ${e.message}`);
    return [];
  }
}

function detectLanguage(text: string): string {
  const swedishIndicators = [
    'och', 'är', 'på', 'för', 'att', 'jag', 'med', 'det', 'den', 'som', 
    'kan', 'hur', 'vad', 'skapa', 'ska', 'har', 'än', 'när', 'till', 
    'från', 'också', 'gör', 'vi', 'de', 'denna', 'själv', 'måste'
  ];
  const englishIndicators = [
    'the', 'is', 'and', 'for', 'to', 'of', 'a', 'in', 'that', 'it', 
    'with', 'as', 'on', 'how', 'what', 'create', 'from', 'this', 'we', 
    'do', 'they', 'should', 'must', 'have', 'when', 'where'
  ];
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let swedishScore = 0;
  let englishScore = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;]/g, '');
    if (swedishIndicators.includes(cleanWord)) swedishScore += 2;
    if (englishIndicators.includes(cleanWord)) englishScore += 2;
  });
  
  swedishIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) swedishScore += matches.length;
  });
  
  englishIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) englishScore += matches.length;
  });
  
  return swedishScore > englishScore ? 'Swedish' : 'English';
}

function detectToolkit(message: string): string[] {
  const lower = message.toLowerCase();
  const detected: string[] = [];
  
  // Check for explicit "connect X" or "koppla X" patterns first
  if (lower.includes("koppla") || lower.includes("anslut") || lower.includes("connect")) {
    if (lower.includes("gmail") || lower.includes("mail") || lower.includes("mejl")) detected.push("gmail");
    if (lower.includes("kalender") || lower.includes("calendar")) detected.push("googlecalendar");
    if (lower.includes("github")) detected.push("github");
    if (lower.includes("slack")) detected.push("slack");
    if (lower.includes("instagram") || lower.includes("insta")) detected.push("instagram");
    if (lower.includes("sheets") || lower.includes("kalkylark")) detected.push("googlesheets");
    if (lower.includes("hubspot")) detected.push("hubspot");
    if (lower.includes("openai")) detected.push("openai");
  }
  
  const gmailKeywords = ["email", "mail", "inbox", "send mail", "skicka mail", "hämta mail", "e-post", "meddelande", "gmail", "draft", "utkast", "mejl", "mejlen", "brev", "inkorg", "skriv", "sänd"];
  const githubKeywords = ["github", "repo", "repository", "commit", "pull request", "pr", "issue", "kod", "code", "branch"];
  const slackKeywords = ["slack", "kanal", "channel", "workspace"];
  const calendarKeywords = ["kalender", "calendar", "möte", "möten", "meeting", "meetings", "event", "schedule", "boka", "bokning", "händelse", "schema", "tid", "planera"];
  const sheetsKeywords = ["sheets", "spreadsheet", "kalkylark", "google sheets", "excel"];
    const instagramKeywords = ["instagram", "insta", "ig", "reels", "stories", "post to instagram"];
    const hubspotKeywords = ["hubspot", "crm", "leads", "contacts", "deals"];
    const geminiKeywords = [
      "skapa bild", "generera bild", "generate image", "create image", "make image", "bild av", 
      "skapa video", "generera video", "generate video", "create video", "make video", "video av",
      "veo", "gemini", "nano banana", "ai bild", "ai video", "bildgenerering", "videogenerering",
      "rita", "draw", "illustrera", "illustrate", "visualisera", "visualize"
    ];
    const utilityKeywords: Record<string, string[]> = {
      bench: ["bench", "benchmark"],
      browser_tool: ["browser", "web scrap", "search web", "sök på webben", "bläddra"],
      codeinterpreter: ["kod", "analysera data", "räkna ut", "kalkylera", "python", "code interpreter"],
      composio_search: ["composio search", "search tools"],
      text_to_pdf: ["pdf", "skapa pdf", "convert to pdf"],
      weathermap: ["väder", "weather", "temperatur"],
      yelp: ["yelp", "restaurang", "restaurant", "matställe"],
    };
    
    for (const [toolkit, keywords] of Object.entries(utilityKeywords)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          detected.push(toolkit);
          break;
        }
      }
    }
    
    for (const kw of geminiKeywords) {
      if (lower.includes(kw)) {
        detected.push("gemini");
        if (lower.includes("video") || lower.includes("veo")) {
          detected.push("veo");
        }
        break;
      }
    }
  for (const kw of gmailKeywords) {
    if (lower.includes(kw)) {
      detected.push("gmail");
      break;
    }
  }
  for (const kw of githubKeywords) {
    if (lower.includes(kw)) {
      detected.push("github");
      break;
    }
  }
  for (const kw of slackKeywords) {
    if (lower.includes(kw)) {
      detected.push("slack");
      break;
    }
  }
  for (const kw of calendarKeywords) {
    if (lower.includes(kw)) {
      detected.push("googlecalendar");
      break;
    }
  }
  for (const kw of sheetsKeywords) {
    if (lower.includes(kw)) {
      detected.push("googlesheets");
      break;
    }
  }
  for (const kw of instagramKeywords) {
    if (lower.includes(kw)) {
      detected.push("instagram");
      break;
    }
  }
  for (const kw of hubspotKeywords) {
    if (lower.includes(kw)) {
      detected.push("hubspot");
      break;
    }
  }
  return [...new Set(detected)];
}

function detectScheduling(message: string, language: string, timezone: string = "Europe/Stockholm"): { isScheduled: boolean; scheduledTime: string | null } {
  const lower = message.toLowerCase();
  
  // Time patterns
  const timePatterns = [
    /kl(?:ockan)?\s*(\d{1,2})(?::(\d{2}))?/i, // "kl 20", "klockan 14:30"
    /at\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i, // "at 8pm", "at 14:30"
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i, // "8pm", "2:30pm"
  ];
  
  // Day patterns
  const dayPatterns: Record<string, number> = {
    // Swedish
    'idag': 0,
    'imorgon': 1,
    'i morgon': 1,
    'övermorgon': 2,
    'över morgon': 2,
    'måndag': 1,
    'tisdag': 2,
    'onsdag': 3,
    'torsdag': 4,
    'fredag': 5,
    'lördag': 6,
    'söndag': 0,
    // English
    'today': 0,
    'tomorrow': 1,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0,
  };
  
  let detectedTime: { hours: number; minutes: number } | null = null;
  let detectedDay: number | null = null;
  
  // Detect time
  for (const pattern of timePatterns) {
    const match = lower.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const ampm = match[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      detectedTime = { hours, minutes };
      break;
    }
  }
  
  // Detect day
  for (const [dayName, dayOffset] of Object.entries(dayPatterns)) {
    if (lower.includes(dayName)) {
      if (['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(dayName)) {
        // It's a weekday name
        const now = new Date();
        // Convert to user's timezone
        const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        const currentDay = userNow.getDay();
        const targetDay = dayOffset;
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) daysUntilTarget += 7; // Next week
        detectedDay = daysUntilTarget;
      } else {
        // It's a relative day (today, tomorrow, etc)
        detectedDay = dayOffset;
      }
      break;
    }
  }
  
  // If we found time or day indicators, this is a scheduled action
  if (detectedTime || detectedDay !== null) {
    const now = new Date();
    // Create date in user's timezone
    const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const scheduledDate = new Date(userNow);
    
    // Set day
    if (detectedDay !== null) {
      scheduledDate.setDate(scheduledDate.getDate() + detectedDay);
    }
    
    // Set time
    if (detectedTime) {
      scheduledDate.setHours(detectedTime.hours, detectedTime.minutes, 0, 0);
    } else {
      // Default to 9am if only day is specified
      scheduledDate.setHours(9, 0, 0, 0);
    }
    
    // If scheduled time is in the past, add one day
    if (scheduledDate < userNow) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    // Convert back to UTC for storage
    return {
      isScheduled: true,
      scheduledTime: scheduledDate.toISOString(),
    };
  }
  
  return { isScheduled: false, scheduledTime: null };
}

const toolkitDisplayNames: Record<string, string> = {
  gmail: "Gmail",
  github: "GitHub",
  slack: "Slack",
  googlecalendar: "Google Kalender",
  googlesheets: "Google Sheets",
  instagram: "Instagram",
  hubspot: "HubSpot",
  openai: "OpenAI",
  gemini: "Gemini",
  veo: "Veo (Video AI)",
};

interface PersonaContext {
  role: string;
  name: string;
  description: string;
  integrations: string[];
}

export async function POST(request: NextRequest) {
    try {
      // Validate required environment variables
      if (!process.env.COMPOSIO_API_KEY) {
        return NextResponse.json(
          { error: "COMPOSIO_API_KEY is not configured. Please set it in your .env.local file." },
          { status: 500 }
        );
      }
      
      const body = await request.json();
      const { message, messages = [], customContext, personaContext, selectedIntegrations = [], uploadedFiles = [], isDirectToolCall, toolCall } = body;
      
      // Get userId safely
      let userId = body.userId;
      if (!userId || userId === "pg-test-3788177c-f9aa-4b33-a8ad-6911a872ff98") {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      }
      
      if (!userId) userId = "guest-session-" + Math.random().toString(36).substring(7);

      const detectedToolkits = detectToolkit(message || "");

      if (!message && !isDirectToolCall && uploadedFiles.length === 0) {
        return NextResponse.json({ error: "Message or file is required" }, { status: 400 });
      }

    if (isDirectToolCall && toolCall) {
      try {
        // Direct tool call from Voice Assistant
        let fnCall = toolCall.functionCalls[0];
        let args = fnCall.args;
        
        // Handle case where args might be a string (from Voice Assistant)
        if (typeof args === "string") {
          try {
            args = JSON.parse(args || "{}");
          } catch (e) {
            console.error("Failed to parse toolCall args string:", e);
          }
        }
        
        const { appName, actionName, params } = args as any;
        
        // Executing action

        // Use Composio to execute the action
        const result = await (getComposio() as any).actions.execute(userId, {
          appName: appName?.toLowerCase(),
          actionName: actionName,
          input: params
        });

        // Tool execution completed

        return NextResponse.json({
          success: true,
          result: result,
          response: `Successfully executed ${actionName}. Result: ${JSON.stringify(result).slice(0, 500)}`,
          summary: `The ${appName} action ${actionName} was completed successfully.`
        });
      } catch (error: any) {
        console.error("Direct tool execution failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Get user preferences (language & timezone) from database
    const supabase = await createClient();
    
      const { data: userPrefs } = await supabase
        .from("user_preferences")
        .select("language, timezone, plan")
        .eq("user_id", userId)
        .single();
      
      const userLanguage = body.language || userPrefs?.language || detectLanguage(message || "");
      const userTimezone = userPrefs?.timezone || "Europe/Stockholm";
      const userPlan = userPrefs?.plan || "starter";

      // AI Consultant instructions if needed
      const isConsultantMode = message?.toLowerCase().includes("consultant") || message?.toLowerCase().includes("bottleneck") || message?.toLowerCase().includes("industry") || body.isConsultant;
      const consultantInstructions = isConsultantMode ? `
YOU ARE THE BEAUTO AI CONSULTANT (CRITICAL ROLE):
1. Your goal is to help the user find the best automation stack and Beauto plan.
2. Ask about their industry, team size, and main productivity bottlenecks if they haven't provided them.
3. Recommend specific apps from our 908+ integrations (e.g., Gmail + HubSpot + Slack for Sales).
4. Recommend the best Beauto plan:
   - Starter ($50/mo): 3 integrations, perfect for individuals.
   - Pro ($125/mo): 10 integrations, human support, perfect for small teams.
   - Enterprise (Custom): 908+ integrations, priority support, for large scale operations.

WHEN YOU ARE READY TO RECOMMEND:
You must include a JSON block at the end of your response exactly like this:
RECOMMENDATION_JSON:
{
  "plan": "Starter" | "Pro" | "Enterprise",
  "apps": ["App1", "App2", "App3"],
  "reason": "Brief summary of why this works for them"
}
RECOMMENDATION_END

Be professional, helpful, and focused on ROI.` : "";

      const languageInstruction = `Respond in ${userLanguage}. If the user uses Swedish, respond in Swedish. If Danish, respond in Danish. If Norwegian, respond in Norwegian. If Arabic, respond in Arabic (RTL). Otherwise, use English.`;

      const connectedAccounts = await getConnectedAccounts(userId);
      const normalizeSlug = (slug: string) => slug.toLowerCase().replace(/[^a-z0-9]/g, "");
      const connectedToolkitsSlugs = [...new Set(connectedAccounts.map((a: any) => a.toolkit?.slug).filter(Boolean))] as string[];
      const normalizedConnectedToolkits = connectedToolkitsSlugs.map(normalizeSlug);

      // Enforce plan limits
      const planLimit = userPlan === "starter" ? 3 : userPlan === "pro" ? 10 : 999;
      if (normalizedConnectedToolkits.length > planLimit) {
        return NextResponse.json({
          response: `You have ${normalizedConnectedToolkits.length} connected apps, but your ${userPlan} plan only supports ${planLimit}. Please upgrade to continue using all your integrations.`,
          error: "Plan limit exceeded"
        });
      }

    // If there are uploaded files with images/videos, use vision analysis
    const hasImageOrVideo = uploadedFiles.some((f: any) => 
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    if (hasImageOrVideo) {
      try {
        const visionMessages: any[] = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: message || "Please analyze this image/video and describe what you see.",
              },
              ...uploadedFiles
                .filter((f: any) => f.type.startsWith('image/'))
                .map((f: any) => ({
                  type: "image_url",
                  image_url: { url: f.url },
                })),
            ],
          },
        ];

        const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: visionMessages,
            max_tokens: 1000,
          }),
        });

        const visionData = await visionResponse.json();
        const analysis = visionData.choices?.[0]?.message?.content;

        if (analysis) {
          const wantsToPost = message?.toLowerCase().match(/(post|publish|share|publicera|dela|lägg upp).*(instagram|facebook|twitter|social|sociala medier)/i);

          if (wantsToPost) {
            const platform = message?.toLowerCase().match(/instagram|facebook|twitter/i)?.[0] || "instagram";
            const normalizedPlatform = normalizeSlug(platform);
            const isPlatformConnected = normalizedConnectedToolkits.includes(normalizedPlatform);
            
            if (!isPlatformConnected) {
              const toolRouter = getToolRouter(getComposio());
              const session = await toolRouter.create(userId, {
                toolkits: [platform.toLowerCase()],
              });
              const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
              const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
              let origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "");
              if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
                origin = `https://${host}`;
              }
              const connectionRequest = await session.authorize(platform.toLowerCase(), {
                callbackUrl: `${origin}/api/composio/callback`,
              });

              return NextResponse.json({
                response: userLanguage === 'Swedish'
                  ? `Jag har analyserat din bild/video:\n\n${analysis}\n\nVill du publicera detta på ${platform}? Jag kan hjälpa dig med det! Koppla först ditt ${platform}-konto för att fortsätta.`
                  : `I've analyzed your image/video:\n\n${analysis}\n\nWould you like to post this to ${platform}? I can help you with that! First, connect your ${platform} account to proceed.`,
                requiresAuth: true,
                toolkit: platform.toLowerCase(),
                connectionUrl: connectionRequest.redirectUrl || undefined,
              });
            }
            
            const imageUrls = uploadedFiles
              .filter((f: any) => f.type.startsWith('image/'))
              .map((f: any) => f.url);
              
            messages.push({
              role: "user",
              content: `[VISION ANALYSIS]: ${analysis}. \n\nMEDIA URLs: ${imageUrls.join(", ")}\n\nThe user wants to post this to ${platform}. Please proceed with posting it. Use the provided URLs.`
            });
          } else {
            // Check if current session exists
            if (message || uploadedFiles.length > 0) {
                // If we're not posting, we just add the analysis to the history and continue
                // This allows the user to ask questions about the image later
                messages.push({
                    role: "assistant",
                    content: `[ANALYSIS]: ${analysis}`
                });
            }
          }
        }
      } catch (error) {
        console.error("Vision API error:", error);
      }
    }

      // Filter available toolkits to only include connected or NO_AUTH toolkits
      const availableToolkits = ALL_TOOLKITS.filter(t => 
        normalizedConnectedToolkits.includes(normalizeSlug(t)) || 
        NO_AUTH_TOOLKITS.includes(t.toLowerCase())
      );

      let toolkitsToUse = detectedToolkits.length > 0
        ? detectedToolkits.map((t: string) => t.toLowerCase())
        : (selectedIntegrations.length > 0 ? selectedIntegrations : availableToolkits);

      // CRITICAL: Normalize slugs to avoid mis-slugs like 'google_ai_studio' or 'googleaistudio'
      toolkitsToUse = toolkitsToUse.map((t: string) => {
        const low = t.toLowerCase();
        if (low.includes("google") && low.includes("ai") && low.includes("studio")) return "gemini";
        if (low === "googleaistudio") return "gemini";
        if (low === "google_ai_studio") return "gemini";
        return t;
      });

      // CRITICAL: Second filter to ensure we ONLY request toolkits that won't error out
      // except if explicitly detected, then the user might want a connection card.
      toolkitsToUse = toolkitsToUse.filter((t: string) => {
        const isKnown = ALL_TOOLKITS.includes(t.toLowerCase());
        const isConnected = normalizedConnectedToolkits.includes(normalizeSlug(t));
        const isNoAuth = NO_AUTH_TOOLKITS.includes(t.toLowerCase());
        return isKnown && (isConnected || isNoAuth);
      });

      // Ensure we have at least one valid toolkit
      if (toolkitsToUse.length === 0) {
        toolkitsToUse = ["gemini", "browser_tool"];
      }

      // Creating tool router session
      let toolRouter;
      try {
        toolRouter = getToolRouter(getComposio());
      } catch (routerError: any) {
        console.error("Failed to get tool router:", routerError);
        return NextResponse.json(
          { 
            error: `Failed to initialize Composio tool router: ${routerError.message}. Please check your COMPOSIO_API_KEY configuration.` 
          },
          { status: 500 }
        );
      }
      
      // Safely get MCP config ID (optional)
      let mcpConfigId: string | undefined;
      try {
        mcpConfigId = env().COMPOSIO_MCP_CONFIG_ID;
      } catch (e) {
        // env() might throw if validation fails, but MCP config is optional
        mcpConfigId = process.env.COMPOSIO_MCP_CONFIG_ID;
      }
      
      const sessionConfig: any = {
        toolkits: toolkitsToUse,
      };
      
      // Only add mcpConfigId if it's set
      if (mcpConfigId) {
        sessionConfig.mcpConfigId = mcpConfigId;
      }
      
      let session;
      try {
        session = await Promise.race([
          toolRouter.create(userId, sessionConfig),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Composio ToolRouter creation timeout")), 12000))
        ]) as any;
      } catch (sessionError: any) {
        console.error("Failed to create tool router session:", sessionError);
        return NextResponse.json(
          { 
            error: `Failed to create Composio session: ${sessionError.message}. This might be due to invalid toolkit configuration or API issues.` 
          },
          { status: 500 }
        );
      }
      // Tool router session created

  
        // Detect if user wants to schedule an action
        const scheduleDetection = detectScheduling(message, userLanguage, userTimezone);
        const primaryToolkit = detectedToolkits[0];
      
        if (scheduleDetection.isScheduled && primaryToolkit) {
          // User wants to schedule this action for later
          try {
            // Use Supabase client directly
            const { data, error } = await supabase
              .from("scheduled_actions")
              .insert({
                user_id: userId,
                chat_id: null,
                action_type: primaryToolkit,
                action_description: message,
                scheduled_time: scheduleDetection.scheduledTime,
                toolkit: primaryToolkit,
                action_params: {
                  originalMessage: message,
                  language: userLanguage,
                  customContext: customContext || null,
                },
                status: "pending",
              })
              .select()
              .single();
            
            if (!error && data) {
              const formattedTime = new Date(scheduleDetection.scheduledTime!).toLocaleString(
                userLanguage === 'Swedish' ? 'sv-SE' : 'en-US',
                { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }
              );
              
              const responseText = userLanguage === 'Swedish'
                ? `✅ Perfekt! Jag har schemalagt handlingen:\n\n📅 ${message}\n\n⏰ Kommer att köras: ${formattedTime}\n\nJag kommer automatiskt att utföra detta åt dig vid den tiden. Du kan se alla dina schemalagda handlingar i sidofältet.`
                : `✅ Perfect! I've scheduled the action:\n\n📅 ${message}\n\n⏰ Will run: ${formattedTime}\n\nI will automatically perform this for you at that time. You can see all your scheduled actions in the sidebar.`;
              
              return NextResponse.json({
                response: responseText,
                connectedApps: connectedToolkitsSlugs,
                scheduled: true,
                scheduledTime: scheduleDetection.scheduledTime,
              });
            }
          } catch (error) {
            console.error("Failed to schedule action:", error);
          }
        }
  
        // Check if any detected toolkit requires auth and is not connected
        for (const toolkit of detectedToolkits) {
          const isOpenAIRequest = toolkit === "openai";
          const isNoAuthToolkit = NO_AUTH_TOOLKITS.includes(toolkit.toLowerCase());
          const isToolkitConnected = isOpenAIRequest || isNoAuthToolkit || normalizedConnectedToolkits.includes(normalizeSlug(toolkit));

          if (!isToolkitConnected) {
            // Offering to connect toolkit
            const displayName = toolkitDisplayNames[toolkit] || toolkit;
            let connectionUrl: string | undefined;
            
            try {
              const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
              const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
              let origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || "");
              if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
                origin = `https://${host}`;
              }
              const connectionRequest = await session.authorize(toolkit.toLowerCase(), {
                callbackUrl: `${origin}/api/composio/callback`,
              });
              connectionUrl = connectionRequest.redirectUrl || undefined;
            } catch (e) {
              console.error(`Connection setup failed for ${toolkit}:`, e);
            }

            const responseText = userLanguage === 'Swedish'
              ? `Självklart! För att hjälpa dig med ${displayName} behöver vi ansluta ditt konto först. Klicka på knappen nedan för att ansluta - det tar bara några sekunder!`
              : `Sure! To help you with ${displayName}, we need to connect your account first. Click the button below to connect - it only takes a few seconds!`;

            return NextResponse.json({
              response: responseText,
              connectedApps: connectedToolkitsSlugs,
              requiresAuth: true,
              toolkit: toolkit.toLowerCase(),
              connectionUrl: connectionUrl || undefined,
            });
          }
        }
  
      const conversationContext = messages.length > 0
        ? `\n\nConversation history:\n${messages.map((m: ChatMessage) => `${m.role}: ${m.content}`).join("\n")}`
        : "";
  
      const openaiInstructions = detectedToolkits.includes("openai") ? `
  Du är nu ansluten till OpenAI. Använd dess kapabiliteter för att svara på användarens fråga.` : "";
  
    const geminiInstructions = (detectedToolkits.includes("gemini") || detectedToolkits.includes("veo")) ? `
Du är nu ansluten till Gemini. Använd dess kapabiliteter för att generera bilder eller videor som användaren begärt.` : "";

    const customContextInstructions = customContext ? `

IMPORTANT - You are acting as the AI assistant for ${(customContext as CustomContext).companyName}. 
Follow these guidelines strictly:

BRAND VOICE: ${(customContext as CustomContext).brandVoice}
TARGET AUDIENCE: ${(customContext as CustomContext).targetAudience}
BRAND COLORS: ${(customContext as CustomContext).colors.join(", ")}
${(customContext as CustomContext).typography ? `BRAND TYPOGRAPHY: ${JSON.stringify((customContext as any).typography)}` : ''}
${(customContext as CustomContext).tonality ? `BRAND TONALITY: ${JSON.stringify((customContext as any).tonality)}` : ''}

COMPANY DESCRIPTION:
${(customContext as CustomContext).description}

CUSTOM KNOWLEDGE:
${(customContext as CustomContext).customKnowledge}

WEBSITE CONTENT:
${(customContext as CustomContext).crawledContent.slice(0, 5000)}

ADDITIONAL FILES:
${(customContext as CustomContext).files.slice(0, 3000)}

When generating ANY content (emails, images, messages, etc):
- ALWAYS use the brand colors: ${(customContext as CustomContext).colors.join(", ")}
- ALWAYS match the brand voice: ${(customContext as CustomContext).brandVoice}
- ALWAYS target the audience: ${(customContext as CustomContext).targetAudience}
- ALWAYS reflect the brand's tonality and emotions in your responses
- ALWAYS incorporate the company's visual identity and style
- When connecting to apps (Gmail, Slack, etc), demonstrate HOW you're connecting (show the authentication flow)
- When performing actions, explain WHAT you're doing in real-time (e.g., "Connecting to Gmail...", "Searching for emails from...", "Composing email with brand colors...")
- NEVER show demo or placeholder data - use REAL data from connected apps
${(customContext as CustomContext).logo ? `- The company logo is available at: ${(customContext as CustomContext).logo}` : ''}` : "";

      // Fetch user feedback for learning
      let feedbackLearning = "";
      try {
        const { data: positiveFeedback } = await supabase
          .from("message_feedback")
          .select("user_query, message_content")
          .eq("user_id", userId)
          .eq("feedback_type", "thumbs_up")
          .order("created_at", { ascending: false })
          .limit(5);
        
        const { data: negativeFeedback } = await supabase
          .from("message_feedback")
          .select("user_query, message_content")
          .eq("user_id", userId)
          .eq("feedback_type", "thumbs_down")
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (positiveFeedback?.length) {
          feedbackLearning += "\n\nUSER PREFERRED RESPONSE STYLE (from positive feedback):\n";
          positiveFeedback.forEach((f, i) => {
            feedbackLearning += `Example ${i + 1}:\n- Query: "${f.user_query?.slice(0, 100) || 'N/A'}"\n- Liked response style: "${f.message_content?.slice(0, 200)}..."\n`;
          });
          feedbackLearning += "\nMimic these response patterns - the user has indicated they prefer this style.";
        }
        
        if (negativeFeedback?.length) {
          feedbackLearning += "\n\nAVOID THESE PATTERNS (from negative feedback):\n";
          negativeFeedback.forEach((f, i) => {
            feedbackLearning += `- Disliked: "${f.message_content?.slice(0, 150)}..."\n`;
          });
          feedbackLearning += "\nDo NOT respond in these ways - the user has indicated they dislike this style.";
        }
      } catch (feedbackError) {
        console.log("Could not load feedback for learning:", feedbackError);
      }

      const personaInstructions = personaContext ? `
PERSONA ACTIVE: You are roleplaying as ${(personaContext as PersonaContext).name}, a ${(personaContext as PersonaContext).role}.

YOUR ROLE: ${(personaContext as PersonaContext).description}

PRIMARY INTEGRATIONS: ${(personaContext as PersonaContext).integrations.slice(0, 10).join(", ")}

BEHAVIOR GUIDELINES:
- Act as a specialized ${(personaContext as PersonaContext).role} assistant
- Prioritize tasks and workflows relevant to ${(personaContext as PersonaContext).role} work
- Use terminology and approaches common in ${(personaContext as PersonaContext).role} roles
- When suggesting integrations, prefer: ${(personaContext as PersonaContext).integrations.slice(0, 5).join(", ")}
- Be proactive about ${(personaContext as PersonaContext).role}-specific tasks
` : "";

      const systemPrompt = `You are Beauto, a powerful AI assistant with access to a wide range of tools and integrations.
        
        AVAILABLE TOOLS:
        - Gemini (GEMINI toolkit): Comprehensive integration supporting:
          • Image generation: Use GEMINI_GENERATE_IMAGE (Nano Banana). Models: 'gemini-3-pro-image-preview' (advanced) or 'gemini-2.5-flash-image'.
          • Video generation: Use GEMINI_GENERATE_VIDEOS (Veo) and GEMINI_WAIT_FOR_VIDEO.
          • Text generation: Use GEMINI_GENERATE_CONTENT (Gemini 2.5 Flash).
          • Multimodal tasks: Analyzing text, images, and video.
        - Instagram: Can post photos, reels, and stories directly. Actions: INSTAGRAM_CREATE_USER_POST, INSTAGRAM_UPLOAD_PHOTO, etc.
        - Productivity: Google Sheets, Google Calendar, Google Drive, Gmail, Slack, GitHub, HubSpot, Notion, Shopify, Airtable, Trello, Asana, Dropbox, Zoom, Salesforce, Stripe, LinkedIn, Twitter, Facebook.
        - Utilities: Browser Tool (for web scraping), Code Interpreter (for data analysis), Composio Search, Text to PDF, Weather Map, Yelp.
        
        ${personaInstructions}
        ${customContextInstructions}
        ${consultantInstructions}
        ${languageInstruction}
        ${openaiInstructions}
        ${geminiInstructions}
        ${feedbackLearning}
        ${conversationContext}
        
        IMPORTANT (CRITICAL): 
        1. INSTAGRAM UPLOADS: You MUST perform the upload to Instagram if the user asks. NEVER tell the user to do it themselves if you have the tools. Use the Instagram toolkit actions. If you have a media URL (generated by Gemini or provided via vision analysis), use it as the source for the Instagram upload.
        2. GEMINI IMAGE/VIDEO: When generating images or videos, GEMINI will provide a URL. Use this URL for further actions like sharing to social media or sending via email.
        3. MULTI-STEP ACTIONS: You can and should chain tools. Example: 
           Step 1: Generate an image using GEMINI_GENERATE_IMAGE.
           Step 2: Get the resulting image URL.
           Step 3: Use that URL with INSTAGRAM_UPLOAD_PHOTO/CREATE_USER_POST.
        4. When asked to fetch items from apps, ALWAYS use the tool_router to fetch the ACTUAL CONTENT.
        
        CONNECTION GUIDELINES:
        - If an account is not connected, mention it. The system will show a "Connect" button.
        - NO_AUTH required for: Gemini, Veo, Bench, Browser Tool, Code Interpreter, Composio, Composio Search, Entelligence, HackerNews, Instacart, Seat Geek, Test App, Text to PDF, Weather Map, Yelp. You can use these immediately.
        
        FORMATTING GUIDELINES (CRITICAL):
        - You SHOULD use markdown for formatting (bold, italics, lists, etc.) to make responses readable.
        - Images should be displayed using markdown syntax: ![alt text](url)
        - For lists, use standard markdown bullets.
        - Use double line breaks between sections.
        
        Current Date: ${new Date().toLocaleDateString('sv-SE')}
        `;

    // Safely get OpenAI model
    let openaiModel = "gpt-4o-mini";
    try {
      openaiModel = env().OPENAI_MODEL || "gpt-4o-mini";
    } catch (e) {
      openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
    }
    
    const agent = new Agent({
      name: "Beauto",
      instructions: systemPrompt,
      model: openaiModel,
        tools: [
            hostedMcpTool({
              serverLabel: "tool_router",
              serverUrl: session.mcp.url,
              headers: {
                ...session.mcp.headers,
                "x-api-key": process.env.COMPOSIO_API_KEY,
              } as any,
            }),
        ],
    });

    // Starting agent execution
    const result = await Promise.race([
      run(agent, message),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Agent execution timeout")), 90000))
    ]) as any;
        // Agent execution finished

        let responseText = typeof result.finalOutput === "string" 
          ? result.finalOutput 
          : JSON.stringify(result.finalOutput);

        // Track analytics
        try {
          const primaryToolkit = detectedToolkits[0] || "general";
          const isExecuteAction = responseText.toLowerCase().includes("successfully") || 
                                   responseText.toLowerCase().includes("completed") ||
                                   responseText.toLowerCase().includes("sent") ||
                                   responseText.toLowerCase().includes("created");
          const isFetchAction = responseText.toLowerCase().includes("here is") ||
                                responseText.toLowerCase().includes("found") ||
                                responseText.toLowerCase().includes("fetched") ||
                                responseText.toLowerCase().includes("retrieved");
          
          await supabase.from("user_analytics").insert({
            user_id: userId,
            action_type: isExecuteAction ? "execute" : isFetchAction ? "fetch" : "chat",
            toolkit: primaryToolkit,
            action_name: message?.slice(0, 100),
            metadata: {
              toolkitsUsed: detectedToolkits,
              hasCustomContext: !!customContext,
              hasPersona: !!personaContext,
              responseLength: responseText.length
            }
          });
        } catch (analyticsError) {
          console.log("Analytics tracking failed (non-blocking):", analyticsError);
        }

        // Extract recommendations if present
        let recommendations = null;
        if (isConsultantMode) {
          const jsonMatch = responseText.match(/RECOMMENDATION_JSON:\s*(\{[\s\S]*?\})\s*RECOMMENDATION_END/);
          if (jsonMatch) {
            try {
              recommendations = JSON.parse(jsonMatch[1]);
              // Remove the JSON block from response text
              responseText = responseText.replace(/RECOMMENDATION_JSON:[\s\S]*?RECOMMENDATION_END/, "").trim();
            } catch (e) {
              console.error("Failed to parse recommendations JSON:", e);
            }
          }
        }

        return NextResponse.json({
          response: responseText,
          connectedApps: connectedToolkitsSlugs,
          mcpSessionUrl: session.mcp.url,
          requiresAuth: false,
          isToolUseExpected: detectedToolkits.length > 0,
          recommendations: recommendations
        });

    } catch (error: any) {
      console.error("Chat API error details:", {
        message: error.message,
        stack: error.stack,
        error,
        composioApiKey: process.env.COMPOSIO_API_KEY ? "***set***" : "MISSING",
        openaiApiKey: process.env.OPENAI_API_KEY ? "***set***" : "MISSING",
        mcpConfigId: process.env.COMPOSIO_MCP_CONFIG_ID ? "***set***" : "MISSING"
      });

      // Automated AI Self-Repair Block
      try {
        const errorString = JSON.stringify(error);
        const isToolkitError = errorString.includes("Invalid toolkit slugs") || errorString.includes("4305");
        const isAuthConfigError = errorString.includes("require auth configs") || errorString.includes("4300");
        
        if (isToolkitError || isAuthConfigError) {
          // Detected toolkit/auth-config error. Attempting AI self-repair
          
          // Identify problematic toolkits from error message
          let toolkitsToRemove: string[] = [];
          if (isAuthConfigError) {
            // Error msg usually looks like "... cannot be auto-created: basecamp, spotify, webex. Please specify..."
            const match = errorString.match(/auto-created: (.*?)\. Please specify/);
            if (match && match[1]) {
              toolkitsToRemove = match[1].split(",").map((t: string) => t.trim().toLowerCase());
            }
          }
          
          if (isToolkitError) {
            // Error msg usually looks like "Invalid toolkit slugs: googleaistudio. Please provide..."
            const match = errorString.match(/slugs: (.*?)\. Please provide/);
            if (match && match[1]) {
              toolkitsToRemove = [...toolkitsToRemove, ...match[1].split(",").map((t: string) => t.trim().toLowerCase())];
            }
          }

          // Identidy what we were using
          const body = await request.clone().json();
          const { message, customContext, personaContext, selectedIntegrations = [] } = body;
          const connectedAccounts = await getConnectedAccounts(body.userId);
          const connectedToolkitsSlugs = [...new Set(connectedAccounts.map((a: any) => a.toolkit?.slug).filter(Boolean))] as string[];
          const normalizeSlug = (slug: string) => slug.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedConnectedToolkits = connectedToolkitsSlugs.map(normalizeSlug);

          const availableToolkits = ALL_TOOLKITS.filter((t: string) => 
            normalizedConnectedToolkits.includes(normalizeSlug(t)) || 
            NO_AUTH_TOOLKITS.includes(t.toLowerCase())
          );

          let toolkitsToUse = detectToolkit(message || "").length > 0
            ? detectToolkit(message || "").map((t: string) => t.toLowerCase())
            : (selectedIntegrations.length > 0 ? selectedIntegrations : availableToolkits);

          // Re-detect toolkits without the problematic ones
          const cleanToolkits = toolkitsToUse.filter((t: string) => !toolkitsToRemove.includes(t.toLowerCase()));
          
          // Also handle specific mis-mappings like googleaistudio -> gemini
          const finalToolkits = cleanToolkits.map((t: string) => {
            if (t.toLowerCase() === "googleaistudio") return "gemini";
            return t;
          });

          if (finalToolkits.length !== toolkitsToUse.length) {
            // Retrying with toolkits
            
            const toolRouter = getToolRouter(getComposio());
            
            // Safely get MCP config ID (optional)
            let mcpConfigId: string | undefined;
            try {
              mcpConfigId = env().COMPOSIO_MCP_CONFIG_ID;
            } catch (e) {
              mcpConfigId = process.env.COMPOSIO_MCP_CONFIG_ID;
            }
            
            const retrySessionConfig: any = {
              toolkits: finalToolkits.length > 0 ? finalToolkits : ["gemini"],
            };
            
            if (mcpConfigId) {
              retrySessionConfig.mcpConfigId = mcpConfigId;
            }
            
            const retrySession = await toolRouter.create(body.userId, retrySessionConfig);

            // Safely get OpenAI model for retry
            let retryModel = "gpt-4o-mini";
            try {
              retryModel = env().OPENAI_MODEL || "gpt-4o-mini";
            } catch (e) {
              retryModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
            }
            
            const retryAgent = new Agent({
              name: "Beauto",
              instructions: "You are Beauto AI assistant.\n\nNOTE: A technical error occurred with some toolkits. I have automatically adjusted the configuration to ensure success.",
              model: retryModel,
              tools: [
                hostedMcpTool({
                  serverLabel: "tool_router",
                  serverUrl: retrySession.mcp.url,
                  headers: {
                    ...retrySession.mcp.headers,
                    "x-api-key": process.env.COMPOSIO_API_KEY,
                  } as any,
                }),
              ],
            });

            const retryResult = await run(retryAgent, message);
            const responseText = typeof retryResult.finalOutput === "string" 
              ? retryResult.finalOutput 
              : JSON.stringify(retryResult.finalOutput);

            return NextResponse.json({
              response: responseText,
              connectedApps: connectedToolkitsSlugs,
              mcpSessionUrl: retrySession.mcp.url,
              requiresAuth: false,
              selfRepaired: true
            });
          }
        }
      } catch (repairError) {
        console.error("Self-repair failed:", repairError);
      }

      return NextResponse.json(
        { error: `Failed to process request: ${error.message || "Unknown error"}` },
        { status: 500 }
      );
    }
}
