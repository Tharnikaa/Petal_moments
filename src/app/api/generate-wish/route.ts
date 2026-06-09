import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, eventType, relationship, notes, feedback } = await request.json();

    if (!name || !eventType || !relationship) {
      return NextResponse.json(
        { error: 'Missing required event details.' },
        { status: 400 }
      );
    }

    let systemPrompt = `Write a highly custom, heartfelt, or fun ${eventType} message for a person named ${name} who is my ${relationship}. Seamlessly weave in these unique personal details about them: ${notes || 'No specific notes provided.'}. Do NOT use generic AI clichés. Output ONLY the message text itself. No introductory pleasantries, no meta-text, no quotes.`;

    let apiKeyToUse = process.env.GEMINI_API_KEY;

    if (session && (session.user as any)?.id) {
      const userId = (session.user as any).id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { geminiApiKey: true }
      });

      if (user?.geminiApiKey) {
        apiKeyToUse = user.geminiApiKey;
      }

      const pref = await prisma.categoryPreference.findFirst({
        where: { userId, category: relationship }
      });
      if (pref && pref.customMessage) {
        // Replace '_____' (5 underscores) with the recipient's name
        const personalizedMessage = pref.customMessage.replace(/_{5}/g, name);
        systemPrompt += `\n\nIMPORTANT CUSTOM INSTRUCTION FOR THIS CATEGORY (${relationship}): ${personalizedMessage}`;
      }
    }

    if (!apiKeyToUse) {
      return NextResponse.json(
        { error: 'Gemini API Key is missing. Please add it in your settings.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKeyToUse,
    });

    if (feedback) {
      systemPrompt += `\n\nAdditionally, the user provided this specific feedback to tweak the previous draft: "${feedback}". Please adjust the message to incorporate this feedback perfectly.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    if (!response || !response.text) {
      throw new Error('Failed to generate response from Gemini.');
    }

    return NextResponse.json({ wish: response.text });
  } catch (error) {
    console.error('Error generating wish:', error);
    return NextResponse.json(
      { error: 'Failed to generate wish. Please try again.' },
      { status: 500 }
    );
  }
}
