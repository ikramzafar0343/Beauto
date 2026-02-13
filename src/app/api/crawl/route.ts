import { NextRequest, NextResponse } from "next/server";

interface CrawlResult {
  companyName: string;
  description: string;
  brandVoice: string;
  targetAudience: string;
  colors: string[];
  typography: {
    families: string[];
    weights: string[];
    sizes: string[];
  };
  tonality: {
    sentiment: string;
    emotions: string[];
    style: string;
  };
  logo: string | null;
  pages: { url: string; title: string; content: string }[];
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BrandCrawler/1.0)",
      "Accept": "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  return { html: await response.text(), finalUrl: response.url };
}

function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10000);
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].trim() : "";
}

function extractLogo(html: string, baseUrl: string): string | null {
  const patterns = [
    /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i,
    /<img[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']*logo[^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let logoUrl = match[1];
      if (logoUrl.startsWith("//")) {
        logoUrl = "https:" + logoUrl;
      } else if (logoUrl.startsWith("/")) {
        const url = new URL(baseUrl);
        logoUrl = url.origin + logoUrl;
      } else if (!logoUrl.startsWith("http")) {
        const url = new URL(baseUrl);
        logoUrl = url.origin + "/" + logoUrl;
      }
      return logoUrl;
    }
  }
  return null;
}

function extractColors(html: string): string[] {
  const colorCounts = new Map<string, number>();
  
  // Extract all colors
  const hexPattern = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  const rgbPattern = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  
  let match;
  while ((match = hexPattern.exec(html)) !== null) {
    const color = match[0].toLowerCase();
    // Ignore common backgrounds and grays
    if (!["#fff", "#ffffff", "#000", "#000000", "#ccc", "#cccccc", "#ddd", "#dddddd", "#eee", "#eeeeee", "#f0f0f0", "#f5f5f5", "#fafafa"].includes(color)) {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }
  }
  
  while ((match = rgbPattern.exec(html)) !== null) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // Ignore near-white and near-black
    if (r + g + b < 750 && r + g + b > 15) {
      const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }
  }
  
  // Sort by frequency and get top colors
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);
  
  // Primary colors are most frequent
  const primaryColors = sortedColors.slice(0, 2);
  
  // Secondary colors are next most frequent, excluding similar to primary
  const secondaryColors = sortedColors.slice(2, 6).filter(color => {
    return !primaryColors.some(primary => isSimilarColor(primary, color));
  });
  
  return [...primaryColors, ...secondaryColors].slice(0, 6);
}

function isSimilarColor(color1: string, color2: string): boolean {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  // If color difference is less than threshold, consider them similar
  const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  return diff < 80;
}

function extractTypography(html: string): { families: string[]; weights: string[]; sizes: string[] } {
  const families = new Set<string>();
  const weights = new Set<string>();
  const sizes = new Set<string>();
  
  const fontFamilyPattern = /font-family:\s*([^;}"]+)/gi;
  const fontWeightPattern = /font-weight:\s*([^;}"]+)/gi;
  const fontSizePattern = /font-size:\s*([^;}"]+)/gi;
  
  let match;
  while ((match = fontFamilyPattern.exec(html)) !== null) {
    const family = match[1].trim().split(',')[0].replace(/['"]/g, '');
    if (family && !family.includes('inherit') && !family.includes('serif') && family !== 'sans-serif') {
      families.add(family);
    }
  }
  
  while ((match = fontWeightPattern.exec(html)) !== null) {
    const weight = match[1].trim();
    if (weight && !weight.includes('inherit') && !weight.includes('normal')) {
      weights.add(weight);
    }
  }
  
  while ((match = fontSizePattern.exec(html)) !== null) {
    const size = match[1].trim();
    if (size && !size.includes('inherit') && size.match(/\d+/)) {
      sizes.add(size);
    }
  }
  
  return {
    families: Array.from(families).slice(0, 5),
    weights: Array.from(weights).slice(0, 6),
    sizes: Array.from(sizes).slice(0, 8),
  };
}

function extractCompanyName(html: string, url: string): string {
  const ogMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
  if (ogMatch) return ogMatch[1].trim();
  
  const title = extractTitle(html);
  if (title) {
    const parts = title.split(/[|\-–—]/);
    return parts[parts.length - 1].trim();
  }
  
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1);
  } catch {
    return "Company";
  }
}

function analyzeBrandVoice(text: string): string {
  const formalWords = ["professional", "enterprise", "solution", "comprehensive", "strategic"];
  const casualWords = ["easy", "simple", "fun", "awesome", "great"];
  const techWords = ["innovative", "cutting-edge", "AI", "technology", "digital"];
  
  const lower = text.toLowerCase();
  let formal = 0, casual = 0, tech = 0;
  
  formalWords.forEach(w => { if (lower.includes(w)) formal++; });
  casualWords.forEach(w => { if (lower.includes(w)) casual++; });
  techWords.forEach(w => { if (lower.includes(w)) tech++; });
  
  const traits: string[] = [];
  if (formal > casual) traits.push("Professional");
  if (casual > formal) traits.push("Friendly");
  if (tech > 1) traits.push("Tech-focused");
    if (lower.includes("trust")) traits.push("Trustworthy");
    if (lower.includes("innovat")) traits.push("Innovative");
    
    return traits.length > 0 ? traits.join(", ") : "Professional, Clear";
  }
  
  function analyzeTargetAudience(text: string): string {
    const lower = text.toLowerCase();
    const audiences: string[] = [];
    
    if (lower.includes("business") || lower.includes("b2b")) audiences.push("Businesses");
    if (lower.includes("consumer") || lower.includes("b2c")) audiences.push("Consumers");
    if (lower.includes("small business") || lower.includes("smb")) audiences.push("Small Businesses");
    if (lower.includes("enterprise")) audiences.push("Enterprise");
    if (lower.includes("startup")) audiences.push("Startups");
    if (lower.includes("developer")) audiences.push("Developers");
    if (lower.includes("marketer") || lower.includes("marketing")) audiences.push("Marketers");
  
  return audiences.length > 0 ? audiences.join(", ") : "General audience";
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const links: Set<string> = new Set();
  const linkPattern = /<a[^>]*href=["']([^"'#]+)["']/gi;
  const base = new URL(baseUrl);
  
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith("/") && !href.startsWith("//")) {
      href = base.origin + href;
    }
    try {
      const url = new URL(href);
      if (url.hostname === base.hostname && !href.includes("login") && !href.includes("signin")) {
        links.add(url.origin + url.pathname);
      }
    } catch {}
  }
  
  return Array.from(links).slice(0, 5);
}

function analyzeTonality(text: string): { sentiment: string; emotions: string[]; style: string } {
  const lower = text.toLowerCase();
  const emotions: string[] = [];
  
    const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'love', 'best', 'perfect', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'worst', 'hate', 'poor', 'awful'];
    const excitementWords = ['exciting', 'thrilling', 'innovative', 'revolutionary', 'transform'];
    const trustWords = ['trust', 'reliable', 'secure', 'proven', 'guaranteed'];
    const professionalWords = ['professional', 'enterprise', 'solution', 'comprehensive'];
    
    let positiveCount = 0, negativeCount = 0;
    
    positiveWords.forEach(w => { if (lower.includes(w)) positiveCount++; });
    negativeWords.forEach(w => { if (lower.includes(w)) negativeCount++; });
    
    if (excitementWords.some(w => lower.includes(w))) emotions.push('Exciting');
    if (trustWords.some(w => lower.includes(w))) emotions.push('Trustworthy');
    if (professionalWords.some(w => lower.includes(w))) emotions.push('Professional');
    if (lower.includes('innovat')) emotions.push('Innovative');
    if (lower.includes('friendly')) emotions.push('Friendly');
    if (lower.includes('simple') || lower.includes('easy')) emotions.push('Approachable');
    
    const sentiment = positiveCount > negativeCount ? 'Positive' : negativeCount > positiveCount ? 'Negative' : 'Neutral';
    
    const style = lower.includes('!') && lower.split('!').length > 3 
      ? 'Enthusiastic' 
      : lower.includes('we') || lower.includes('our')
      ? 'Conversational'
      : 'Formal';
  
  return { sentiment, emotions: emotions.length > 0 ? emotions : ['Professional'], style };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let fullUrl = url;
    if (!url.startsWith("http")) {
      fullUrl = "https://" + url;
    }

    const { html, finalUrl } = await fetchPage(fullUrl);
    
    const mainText = extractText(html);
    const metaDescription = extractMetaDescription(html);
    
    const result: CrawlResult = {
      companyName: extractCompanyName(html, finalUrl),
      description: metaDescription || mainText.slice(0, 300),
      brandVoice: analyzeBrandVoice(mainText),
      targetAudience: analyzeTargetAudience(mainText),
      colors: extractColors(html),
      typography: { families: [], weights: [], sizes: [] },
      tonality: { sentiment: 'Neutral', emotions: [], style: 'Formal' },
      logo: extractLogo(html, finalUrl),
      pages: [{
        url: finalUrl,
        title: extractTitle(html),
        content: mainText,
      }],
    };

    const internalLinks = extractInternalLinks(html, finalUrl);
    const typography = extractTypography(html);
    const tonality = analyzeTonality(mainText);
    
    for (const link of internalLinks.slice(0, 3)) {
      try {
        const { html: pageHtml } = await fetchPage(link);
        result.pages.push({
          url: link,
          title: extractTitle(pageHtml),
          content: extractText(pageHtml).slice(0, 5000),
        });
      } catch {}
    }
    
    result.typography = typography;
    result.tonality = tonality;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json({ error: "Failed to crawl website" }, { status: 500 });
  }
}