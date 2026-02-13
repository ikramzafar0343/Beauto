import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { niche, platform, count, generateImages } = await req.json();

    const prompt = `Generate ${count} social media post ideas for a ${niche} brand on ${platform}. 
    For each post, provide:
    1. A catchy title
    2. Post caption with relevant hashtags
    3. Type of content (Image or Video)
    4. A detailed image prompt that can be used for AI image generation (be specific about colors, composition, style, mood)
    
    Format the response as a JSON array of objects with keys: title, caption, type, imagePrompt
    
    IMPORTANT: Return ONLY the JSON array, no other text.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = result.text || "";
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const posts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (generateImages && posts.length > 0) {
      const postsWithImages = await Promise.all(
        posts.map(async (post: { title: string; caption: string; type: string; imagePrompt: string }, index: number) => {
          try {
            const imageResponse = await genAI.models.generateImages({
              model: "imagen-3.0-generate-002",
              prompt: post.imagePrompt || `Professional social media image for: ${post.title}. High quality, modern design, vibrant colors.`,
              config: {
                numberOfImages: 1,
                aspectRatio: platform === "instagram" ? "1:1" : "16:9",
              },
            });

            if (imageResponse?.generatedImages && imageResponse.generatedImages.length > 0) {
              const imageBytes = imageResponse.generatedImages[0]?.image?.imageBytes;
              
              if (imageBytes) {
                const buffer = Buffer.from(imageBytes, "base64");
                const fileName = `social-autopilot/${Date.now()}-${index}.png`;
                
                const adminSupabase = createAdminClient();
                const { error: uploadError } = await adminSupabase.storage
                  .from("generated-images")
                  .upload(fileName, buffer, {
                    contentType: "image/png",
                    upsert: true,
                  });

                if (!uploadError) {
                  const { data: urlData } = adminSupabase.storage
                    .from("generated-images")
                    .getPublicUrl(fileName);
                  
                  return {
                    ...post,
                    imageUrl: urlData.publicUrl,
                    imageBase64: `data:image/png;base64,${imageBytes}`,
                  };
                }
              }
              
              return {
                ...post,
                imageBase64: imageBytes ? `data:image/png;base64,${imageBytes}` : null,
              };
            }
            
            return post;
          } catch (imgError) {
            console.error("Image generation failed for post:", index, imgError);
            return post;
          }
        })
      );

      return NextResponse.json({ posts: postsWithImages });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
