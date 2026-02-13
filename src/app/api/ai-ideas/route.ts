import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Composio } from "@composio/core";
import { translations, Language } from "@/lib/translations";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

// Task ideas translations
const TASK_IDEAS_TRANSLATIONS: Record<Language, {
  mondayTitle: string;
  mondayDescription: string;
  mondayPrompt: string;
  followUpTitle: string;
  followUpDescription: string;
  followUpPrompt: string;
}> = {
  en: {
    mondayTitle: "New week, new opportunities!",
    mondayDescription: "It's Monday! Would you like a summary of your latest emails and plan the week?",
    mondayPrompt: "Summarize my latest emails from the weekend and list important to-do items for the week.",
    followUpTitle: "Time for customer follow-up?",
    followUpDescription: "It's been quiet for a while. Should we send a thank you email to your latest customers?",
    followUpPrompt: "Get the latest 5 contacts from HubSpot and prepare a personalized thank you email."
  },
  sv: {
    mondayTitle: "Ny vecka, nya möjligheter!",
    mondayDescription: "Det är måndag! Vill du ha en sammanfattning av dina senaste mail och planera veckan?",
    mondayPrompt: "Sammanfatta mina senaste mail från helgen och lista viktiga att-göra punkter för veckan.",
    followUpTitle: "Dags för kunduppföljning?",
    followUpDescription: "Det har varit lugnt ett tag. Ska vi skicka ut ett tack-mail till dina senaste kunder?",
    followUpPrompt: "Hämta de senaste 5 kontakterna från HubSpot och förbered ett personligt tack-mail."
  },
  da: {
    mondayTitle: "Ny uge, nye muligheder!",
    mondayDescription: "Det er mandag! Vil du have et resumé af dine seneste emails og planlægge ugen?",
    mondayPrompt: "Opsummer mine seneste emails fra weekenden og list vigtige opgaver for ugen.",
    followUpTitle: "Tid til kundeopfølgning?",
    followUpDescription: "Det har været stille et stykke tid. Skal vi sende en tak-email til dine seneste kunder?",
    followUpPrompt: "Hent de seneste 5 kontakter fra HubSpot og forbered en personlig tak-email."
  },
  no: {
    mondayTitle: "Ny uke, nye muligheter!",
    mondayDescription: "Det er mandag! Vil du ha et sammendrag av dine siste e-poster og planlegge uken?",
    mondayPrompt: "Oppsummer mine siste e-poster fra helgen og list viktige gjøremål for uken.",
    followUpTitle: "Tid for kundeoppfølging?",
    followUpDescription: "Det har vært stille en stund. Skal vi sende en takk-e-post til dine siste kunder?",
    followUpPrompt: "Hent de siste 5 kontaktene fra HubSpot og forbered en personlig takk-e-post."
  },
  ar: {
    mondayTitle: "أسبوع جديد، فرص جديدة!",
    mondayDescription: "إنه الاثنين! هل تريد ملخصًا لرسائلك الإلكترونية الأخيرة وتخطيط الأسبوع؟",
    mondayPrompt: "لخص رسائلي الإلكترونية الأخيرة من عطلة نهاية الأسبوع واذكر المهام المهمة للأسبوع.",
    followUpTitle: "حان وقت متابعة العملاء؟",
    followUpDescription: "لقد كان هادئًا لفترة. هل يجب أن نرسل بريدًا إلكترونيًا شكرًا لأحدث عملائك؟",
    followUpPrompt: "احصل على آخر 5 جهات اتصال من HubSpot وأعد بريدًا إلكترونيًا شكرًا شخصيًا."
  }
};

const SPECIAL_DAYS = [
  { name: "Kladdkakans dag", month: 10, day: 7, description: "Det är Kladdkakans dag! Perfekt läge att dela ett recept eller ett erbjudande." },
  { name: "Kanelbullens dag", month: 9, day: 4, description: "Idag doftar det kanelbullar överallt! Gör ett inlägg om dagens fika." },
  { name: "Våffeldagen", month: 2, day: 25, description: "Våffeldagen är här! Visa upp dina bästa toppings." },
  { name: "Chokladbollens dag", month: 4, day: 11, description: "Glöm inte chokladbollens dag! Ett snabbt och populärt tips." },
  { name: "Semlans dag", month: 2, day: 4, description: "Semmeldags! Är du en traditionsbärare eller testar du nya varianter?" }, // 2025 date
];

// Simple cache for AI ideas (User ID -> { ideas: any[], timestamp: number })
const aiIdeasCache: Record<string, { ideas: any[], timestamp: number }> = {};
const AI_IDEAS_CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check cache first
    const cached = aiIdeasCache[user.id];
    if (cached && (Date.now() - cached.timestamp < AI_IDEAS_CACHE_TTL)) {
      return NextResponse.json({ ideas: cached.ideas }, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': '0ms',
        },
      });
    }

    // 1. Fetch existing pending suggestions
    const { data: existingIdeas } = await supabase
      .from("ai_task_ideas")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10); // Limit to 10 most recent

    // 2. Check if we should generate new ones (if none generated today)
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    
    const { count } = await supabase
      .from("ai_task_ideas")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfToday);

    if (count === 0) {
      // Generate in background, don't wait
      generateNewIdeas(user.id, supabase).catch(err => 
        console.error("Background idea generation error:", err)
      );
    }

    // Return existing ideas immediately
    const ideas = existingIdeas || [];

    // Update cache
    aiIdeasCache[user.id] = {
      ideas,
      timestamp: Date.now(),
    };

    return NextResponse.json({ ideas }, {
      headers: {
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error("Error in ai-ideas:", error);
    // Graceful fallback if table is missing
    if (String(error).includes("relation \"ai_task_ideas\" does not exist")) {
      return NextResponse.json({ ideas: [] });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id, status } = await request.json();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("ai_task_ideas")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function generateNewIdeas(userId: string, supabase: any) {
  // Get user language preference
  const { data: userPrefs } = await supabase
    .from("user_preferences")
    .select("language")
    .eq("user_id", userId)
    .single();
  
  const userLanguage = (userPrefs?.language || 'en').toLowerCase() as Language;
  const lang = (['en', 'sv', 'da', 'no', 'ar'].includes(userLanguage) ? userLanguage : 'en') as Language;
  const t = TASK_IDEAS_TRANSLATIONS[lang];

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
  const month = now.getMonth();
  const date = now.getDate();

  const ideas = [];

  // 1. Check for Special Days (Swedish holidays - can be expanded for other languages)
  const specialDay = SPECIAL_DAYS.find(d => d.month === month && d.day === date);
  if (specialDay && lang === 'sv') {
    ideas.push({
      user_id: userId,
      title: specialDay.name,
      description: specialDay.description,
      type: "social_post",
      integration: "instagram",
      action_data: { 
        prompt: `Skapa ett inlägg om ${specialDay.name} för en restaurang/café. Inkludera en lockande bildbeskrivning och hashtags.`,
        platform: "instagram"
      }
    });
  }

  // 2. Monday Motivation / Weekly Summary
  if (dayOfWeek === 1) { // Monday
    ideas.push({
      user_id: userId,
      title: t.mondayTitle,
      description: t.mondayDescription,
      type: "email_summary",
      integration: "gmail",
      action_data: { 
        prompt: t.mondayPrompt,
        toolkit: "gmail"
      }
    });
  }

  // 3. Generic Engagement
  if (ideas.length === 0) {
    ideas.push({
      user_id: userId,
      title: t.followUpTitle,
      description: t.followUpDescription,
      type: "follow_up",
      integration: "hubspot",
      action_data: { 
        prompt: t.followUpPrompt,
        toolkit: "hubspot"
      }
    });
  }

  if (ideas.length > 0) {
    await supabase.from("ai_task_ideas").insert(ideas);
  }
}
