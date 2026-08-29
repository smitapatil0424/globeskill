import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  rateLimitResponse,
  sanitizeString,
  applyRateLimitHeaders,
} from '@/lib/security';

export const GLOBESKILL_MENTOR_SYSTEM_PROMPT = `
You are the "GlobeSkill Technical Tutor", an inspiring, patient, and deeply encouraging mentor dedicated to high schoolers and vocational learners, especially underserved youth discovering the power of technology for the first time.

CORE TEACHING PHILOSOPHY & INSTRUCTIONS:
1. Demystify with Relatable Metaphors:
   Always explain abstract IT, cloud, coding, and architecture concepts using everyday real-world analogies:
   - APIs: Like a friendly restaurant waiter taking your food order from table to kitchen and returning with your meal.
   - Databases: Like a neatly labeled library shelf or a school locker organizer where every notebook has a specific slot.
   - Cloud Computing: Like renting a power tool from a community shed when you need it, instead of buying a giant expensive warehouse.
   - Docker & Kubernetes: Docker containers are like standard shipping boxes that fit anywhere; Kubernetes is the harbor port master guiding the ships so they never crash.
   - React Components: Like reusable Lego blocks that click together to assemble a superhero fortress.
   - HTML & CSS: HTML is the wooden frame of a house; CSS is the bright paint, comfortable furniture, and warm lighting.
   - Row Level Security (RLS): Like a hotel room keycard that only unlocks your specific room door and never your neighbor's.
   - Algorithms: Like a step-by-step recipe for baking the crunchiest chocolate chip cookies.
2. Tone & Conciseness:
   - Keep answers concise, clear, and punchy (2 to 4 short paragraphs or bullet points).
   - Use warm, patient, and uplifting language. Never talk down to the learner.
3. Safety:
   - Strictly educational and safe. Refuse any harmful, malicious, or non-educational queries.
4. Motivational Sign-Off:
   - Conclude every response with an empowering cheer (e.g., "You've got this! Every world-class engineer started with their very first line of code. Keep shining!").
`.trim();

interface MentorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface MentorRequestBody {
  prompt?: string;
  message?: string;
  messages?: MentorMessage[];
  topic?: string;
  stream?: boolean;
}

/**
 * Fallback Metaphor Engine tailored for underserved students
 */
function getMetaphoricalTutorReply(userPrompt: string, topic?: string): string {
  const q = (userPrompt || topic || '').toLowerCase();

  if (q.includes('api') || q.includes('endpoint') || q.includes('fetch') || q.includes('rest')) {
    return (
      '**What is an API? Think of it as a Friendly Restaurant Waiter! 🍽️**\n\n' +
      'Imagine you are sitting at a table in a restaurant. You want pizza from the kitchen, but customers are not allowed to walk back and cook. ' +
      'Instead, you tell the **waiter** (the API) what you want. The waiter carries your order to the chef (the server/database), and returns right to your table with hot pizza!\n\n' +
      'In coding:\n' +
      '- **You (the client/browser)**: Asks for course data.\n' +
      '- **The API (the waiter)**: Carries the request over the internet.\n' +
      '- **The Database (the kitchen)**: Prepares and serves the data.\n\n' +
      '💡 *Remember:* APIs just help different computer programs talk politely to each other!\n\n' +
      '🌟 *You\'ve got this! Every world-class engineer started with their very first line of code. Keep shining!*'
    );
  }

  if (q.includes('database') || q.includes('sql') || q.includes('table') || q.includes('supabase')) {
    return (
      '**What is a Database? Think of it as a Super-Organized Toy Chest! 🧸**\n\n' +
      'Imagine your bedroom floor is covered in hundreds of toy cars and puzzle pieces. If someone asks for the red sports car, you have to search forever! ' +
      'A **database** is like a high-tech organizer with clear, labeled drawers (we call these **tables**). One drawer has all toy cars, another has comic books.\n\n' +
      'When you use **SQL**, it\'s just like telling the drawer: *"Give me the red car on the top shelf!"* And in a split-second, it hands it right to you.\n\n' +
      '💡 *Row Level Security (RLS)* is like a key for your personal drawer, making sure your siblings can\'t peek into your private treasure box!\n\n' +
      '🌟 *You\'re building real digital superpowers. Keep asking questions and never stop exploring!*'
    );
  }

  if (q.includes('cloud') || q.includes('kubernetes') || q.includes('docker') || q.includes('container')) {
    return (
      '**What is the Cloud and Kubernetes? Think of Cargo Shipping Containers! 🚢**\n\n' +
      '1. **Docker Containers:** Imagine packing your favorite video game into a magical lunchbox containing the screen, controller, and battery. No matter whose house you visit, it plugs in and plays identically! That\'s Docker—packaging code so it runs anywhere without errors.\n' +
      '2. **Kubernetes:** Now imagine thousands of these lunchboxes stacked on a huge cargo ship. Kubernetes is the **harbor port master** with a walkie-talkie, directing cranes and making sure no box falls over.\n' +
      '3. **The Cloud:** Just means renting computer power from big community data centers rather than buying an expensive server machine to keep in your bedroom.\n\n' +
      '🌟 *Believe in your ability to master this! Technology belongs to you just as much as anyone else.*'
    );
  }

  if (q.includes('react') || q.includes('component') || q.includes('html') || q.includes('css')) {
    return (
      '**Building Web Pages: Like Building a Dream House with Lego! 🧱**\n\n' +
      '- **HTML is the Wooden Frame:** It sets up the solid skeleton—where the walls, doors, and roof go.\n' +
      '- **CSS is the Interior Design:** It paints the walls your favorite neon colors, adds comfortable couches, and makes lights glow.\n' +
      '- **React Components are Lego Bricks:** Instead of building a staircase piece-by-piece fifty times, you build one awesome Lego step and snap copies wherever you need them!\n\n' +
      'When you click a button and the screen updates instantly, that\'s JavaScript bringing your house to life like automatic sliding doors!\n\n' +
      '🌟 *You are a creative creator. Keep building, superstar!*'
    );
  }

  if (q.includes('loop') || q.includes('variable') || q.includes('if') || q.includes('algorithm')) {
    return (
      '**What is an Algorithm? Like a Secret Cookie Recipe! 🍪**\n\n' +
      '- **Variables:** Are like labeled mason jars. You put flour in one jar labeled `flour`, and sugar in another labeled `sugar`.\n' +
      '- **If / Else Conditions:** Are like choices: *"If the timer dings, take the cookies out of the oven. Else, let them bake for 2 more minutes."*\n' +
      '- **Loops:** Like rolling 12 cookies onto the baking sheet: *"Repeat the scoop action until all 12 spots are filled."*\n\n' +
      'Coding isn\'t magic—it\'s just giving very clear, friendly instructions to a computer that loves following directions!\n\n' +
      '🌟 *Step by step, you are becoming a creator of the future. You\'ve totally got this!*'
    );
  }

  // Default encouraging overview
  return (
    `**Welcome to GlobeSkill Tech Tutoring! 👋**\n\n` +
    `I am your **GlobeSkill Technical Tutor**, and my favorite job in the world is making tough coding and computer ideas super easy and fun to understand!\n\n` +
    `Think of computers like helpful musical instruments—once you learn a few simple chords (like variables, functions, and APIs), you can play any song you can imagine.\n\n` +
    `Ask me about:\n` +
    `- *"What is an API?"*\n` +
    `- *"How does a database work?"*\n` +
    `- *"What is Cloud Computing & Kubernetes?"*\n` +
    `- *"What are React components?"*\n\n` +
    `🌟 *Remember: Every single master programmer in the world was once a beginner staring at a blank screen. You belong in tech!*`
  );
}

/**
 * ============================================================================
 * API CONTROLLER: GLOBESKILL AI TECHNICAL TUTOR
 * ============================================================================
 * Endpoint: POST /api/ai/mentor
 *
 * System Persona:
 *  - GlobeSkill Technical Tutor: Encouraging, patient, metaphor-driven mentor.
 *  - Tailored for high school and vocational learners from underserved communities.
 *  - Returns concise, safe, empowering explanations with real-world analogies.
 */
export async function POST(request: Request) {
  try {
    // 1. Enforce Rate Limiting (10 requests per minute per IP)
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    let body: MentorRequestBody = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // 2. Extract and Sanitize User Question
    let userPrompt = body.prompt || body.message || '';
    if (!userPrompt && body.messages && body.messages.length > 0) {
      const lastUserMsg = [...body.messages].reverse().find((m) => m.role === 'user');
      userPrompt = lastUserMsg ? lastUserMsg.content : '';
    }

    userPrompt = sanitizeString(userPrompt, { maxLength: 1000 });

    if (!userPrompt || !userPrompt.trim()) {
      userPrompt = body.topic ? `Explain ${sanitizeString(body.topic, { maxLength: 100 })}` : 'Hello';
    }

    // Synthesize Metaphor-Driven Response
    const tutorResponse = getMetaphoricalTutorReply(userPrompt, body.topic);

    // If client requested streaming, stream text chunks conforming to Vercel AI SDK protocol
    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunks = tutorResponse.split(' ');
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '');
            controller.enqueue(encoder.encode(chunk));
            // Micro-delay for natural conversational typing feel
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
          'Cache-Control': 'no-cache',
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.reset),
        },
      });
    }

    // Standard JSON response with security rate limit headers
    const jsonRes = NextResponse.json(
      {
        success: true,
        persona: 'GlobeSkill Technical Tutor',
        targetAudience: 'High School & Vocational Institute Students',
        systemPromptApplied: GLOBESKILL_MENTOR_SYSTEM_PROMPT,
        message: {
          role: 'assistant',
          content: tutorResponse,
        },
        metadata: {
          style: 'Metaphor-Driven & Encouraging',
          safeContent: true,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    return applyRateLimitHeaders(jsonRes, rateLimit);
  } catch (error) {
    console.error('Mentor API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate mentor response.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
