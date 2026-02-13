import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages, isModification, currentFiles } = await req.json();

    const systemPrompt = `You are "Aura," a World-Class Full-Stack Design Engineer. Create COMPLETE, PRODUCTION-READY React websites using TypeScript.
    
    CRITICAL: You MUST generate FULL working code for EVERY file. NO placeholders, NO "// add code here", NO incomplete code.
    
    MANDATORY: Use ADVANCED REACT LOGIC. The user specifically wants to see code that uses React hooks (useState, useEffect, useMemo, useCallback), state management, and functional logic.
    - Implement REAL interactivity: filterable lists, search bars, interactive calculators, form validation, multi-step wizards, or dynamic data tables.
    - Use framer-motion for high-end cinematic transitions and micro-interactions.
    - Use Lucide-React for all iconography.
    - Use Tailwind CSS for ALL styling.
    - The goal is a FULLY FUNCTIONAL web application that works out of the box.

    DESIGN STYLE:
    - Premium $10,000+ agency quality.
    - Sophisticated color palettes (neutrals with sharp accents).
    - Glassmorphism, backdrop-blur, semi-transparent backgrounds.
    - Proper typography hierarchy (use custom font sizes if needed via Tailwind text-[...]).
    - Ensure the main wrapper has \`min-h-screen\` and the background covers everything.
    - Use \`import "./styles.css";\` in App.tsx.

TECHNICAL REQUIREMENTS:
1. ENTRY: /App.tsx is the ONLY entry point - it must render EVERYTHING.
2. DO NOT create separate component files - put ALL code in /App.tsx to ensure a single, robust file that always works in the sandbox.
3. Use ONLY Tailwind CSS classes inline.
4. Libraries: framer-motion, lucide-react, clsx, tailwind-merge.
5. Images: Use high-quality Unsplash URLs (e.g., https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800).

MANDATORY /App.tsx STRUCTURE:
\`\`\`tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Star, Users, Zap, Shield, Menu, X, Search, ChevronRight } from "lucide-react";
import "./styles.css";

// --- TYPES ---
interface ProjectProps { ... }

// --- COMPONENTS ---
// Put all helper components here in the same file

// --- MAIN APP ---
export default function App() {
  // Add state for interactivity (e.g., mobile menu, search filters, etc.)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      {/* Navigation */}
      {/* Hero */}
      {/* Interactive Features Section */}
      {/* ... */}
    </div>
  );
}
\`\`\`

OUTPUT JSON FORMAT:
{
  "projectTitle": "Website Name",
  "files": {
    "/App.tsx": "COMPLETE React code with ALL logic and sections inline"
  },
  "description": "A detailed summary of the functional features and design choices made."
}

${isModification ? `MODIFYING:
Current: ${JSON.stringify(currentFiles)}
Request: ${prompt}` : `BUILD: ${prompt}

Create a COMPLETE website with:
- Animated hero with gradient text and CTA buttons
- Features section with icon cards (use lucide-react icons)
- Testimonials or social proof section
- Pricing or CTA section
- Footer with links
- All using framer-motion animations (fadeIn, slideUp, stagger)
- Dark premium aesthetic with glass effects`}`;

    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt }
    ];

    if (messages && messages.length > 0) {
      messages.forEach((m: { role: string; content: string }) => {
        chatMessages.push({
          role: m.role as "user" | "assistant",
          content: m.content
        });
      });
    }

    chatMessages.push({
      role: "user",
      content: `Create the website now. Respond ONLY with valid JSON. ${prompt}`
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 16000,
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    let data = JSON.parse(responseText);

        // Validate and fix the App.tsx
        if (data.files && data.files["/App.tsx"]) {
          let code = data.files["/App.tsx"];
          
          // Ensure styles.css is imported
          if (!code.includes('import "./styles.css"')) {
            code = `import "./styles.css";\n${code}`;
          }
          
          // Only remove other CSS imports, keep component imports
          code = code.replace(/import\s+['"]\.\/((?!styles).)*\.css['"];?\n?/g, "");
        
        // Ensure it has export default function App
        if (!code.includes("export default function App")) {
          code = code.replace(/export default App;?/, "");
          code = code.replace(/function App\(\)/, "export default function App()");
        }
        
        // Fix TypeScript props - add : any to untyped function params
        code = code.replace(/function\s+(\w+)\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*\{/g, 
          (match: string, name: string, params: string) => {
            // Check if already typed
            if (params.includes(':')) return match;
            return `function ${name}({ ${params} }: any) {`;
          }
        );
        
        data.files["/App.tsx"] = code;
      }
    
    // Ensure all component files have proper exports
    if (data.files) {
      for (const path in data.files) {
        if (path.startsWith("/components/") && typeof data.files[path] === "string") {
          let componentCode = data.files[path];
          // Remove CSS imports from components too
          componentCode = componentCode.replace(/import\s+['"]\.\/.*\.css['"];?\n?/g, "");
          data.files[path] = componentCode;
        }
      }
    }

    // Process AI Image Placeholders
    if (data.files) {
      for (const path in data.files) {
        if (typeof data.files[path] === "string") {
          data.files[path] = data.files[path].replace(
            /\[AI_GENERATE_IMAGE:\s*"([^"]+)"\s*\]/g,
            (_match: string, p1: string) => {
              const encodedPrompt = encodeURIComponent(p1);
              return `https://pollinations.ai/p/${encodedPrompt}?width=1200&height=800&nologo=true`;
            }
          );
        }
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Builder generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
