import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  rateLimitResponse,
  sanitizeString,
  applyRateLimitHeaders,
} from '@/lib/security';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  courseContext?: string;
}

/**
 * ============================================================================
 * BACKEND API ROUTE: GLOBESKILL AI TUTOR & TECHNICAL COURSE ASSISTANT
 * ============================================================================
 * Endpoint: POST /api/ai/chat
 *
 * Capabilities:
 *  - Answers questions on software architecture, React 19, Next.js, and Supabase.
 *  - Guides students through curriculum milestones, assessments, and certifications.
 *  - Provides code examples and best practices.
 */
export async function POST(request: Request) {
  try {
    // 1. Enforce Rate Limiting (20 chat prompts per minute per IP)
    const rateLimit = checkRateLimit(request, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    let body: ChatRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload. Expected "message" string.', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const { courseContext } = body;
    const sanitizedMessage = sanitizeString(body.message, { maxLength: 2000 });

    if (!sanitizedMessage) {
      return NextResponse.json(
        { error: 'Validation Error: "message" cannot be empty or invalid.', code: 'EMPTY_MESSAGE' },
        { status: 400 }
      );
    }

    const query = sanitizedMessage.toLowerCase();

    // --------------------------------------------------------------------------
    // CONTEXTUAL KNOWLEDGE ENGINE (TECHNICAL CURRICULUM RESPONSES)
    // --------------------------------------------------------------------------
    let reply = '';
    let suggestedFollowUps: string[] = [];

    if (query.includes('react 19') || query.includes('react') || query.includes('hook') || query.includes('action')) {
      reply =
        '**React 19 Core Fundamentals in GlobeSkill:**\n\n' +
        '1. **Actions & Async Transitions:** In React 19, you can pass async functions directly to `<form action={...}>`. React handles pending states, optimistic updates, and rollbacks automatically via `useActionState`.\n' +
        '2. **use() Hook:** Replaces repetitive `useEffect()` for promise unwrapping and reading React Context conditionally.\n' +
        '3. **Component State:** Standard synchronous state is still handled with `useState()`, while complex transitions use `useTransition()`.\n\n' +
        '```tsx\n// React 19 Server Action Example\nasync function enrollStudent(formData: FormData) {\n  "use server";\n  const courseId = formData.get("courseId");\n  await db.enroll({ courseId });\n}\n```';
      suggestedFollowUps = [
        'How does Next.js App Router differ from Pages Router?',
        'What is the difference between Server and Client Components?',
        'How do I test my assessment quiz?',
      ];
    } else if (query.includes('supabase') || query.includes('rls') || query.includes('row level security') || query.includes('database')) {
      reply =
        '**PostgreSQL Row Level Security (RLS) in GlobeSkill:**\n\n' +
        'Row Level Security enforces data authorization directly inside the PostgreSQL database engine rather than trusting client-side logic.\n\n' +
        '- **Students:** Can only read/insert rows where `auth.uid() = student_id`.\n' +
        '- **Trainers:** Can manage enrollments and grade students for courses they teach via `tp.trainer_id = auth.uid()`.\n' +
        '- **NGO Administrators:** Enjoy full platform management via the `public.is_ngo_admin()` helper function.\n\n' +
        '```sql\n-- Example Policy for Enrolments\nCREATE POLICY "Students can view their own enrolments"\n  ON public.student_enrolments\n  FOR SELECT TO authenticated\n  USING (auth.uid() = student_id);\n```';
      suggestedFollowUps = [
        'How do security definer functions prevent RLS recursion?',
        'Where are quiz attempts recorded in Supabase?',
        'How do I download my certificate?',
      ];
    } else if (query.includes('certificate') || query.includes('graduate') || query.includes('graduation') || query.includes('grade')) {
      reply =
        '**Graduation & Certification Workflow:**\n\n' +
        '1. **Pass the Milestone Assessment:** Complete the module quiz with a score of **70% or higher**.\n' +
        '2. **Automated Status Update:** Once submitted, `/api/assessments/submit` automatically promotes your enrollment to **"Graduated"** with 100% completion.\n' +
        '3. **PDF Generation & Storage:** A vector PDF certificate with dual signatures and the GlobeSkill digital seal is saved to our private `learning-assets` Supabase Storage bucket.\n' +
        '4. **Secure Download:** You can download your credential via `/api/certificates/download/[enrolmentId]` which generates a temporary 5-minute signed URL.';
      suggestedFollowUps = [
        'Launch Module Assessment Quiz',
        'How does anti-backtracking work in the quiz?',
        'What are the passing score thresholds?',
      ];
    } else if (query.includes('ai') || query.includes('llm') || query.includes('micro degree') || query.includes('prompt')) {
      reply =
        '**AI Micro Degree Curriculum Overview:**\n\n' +
        'The **Enterprise AI & Prompt Engineering** track covers:\n' +
        '- **Foundational LLMs:** Transformer architecture, context windows, and tokenization.\n' +
        '- **Prompt Engineering Patterns:** Few-shot prompting, Chain-of-Thought (CoT), ReAct architectures, and system framing.\n' +
        '- **Vector Databases & RAG:** Semantic search with embeddings and pgvector in PostgreSQL.\n' +
        '- **Enterprise Safety:** Guardrails, prompt injection mitigation, and audit logging.\n\n' +
        'Would you like to enroll in the AI Micro Degree course from the Student Hub?';
      suggestedFollowUps = [
        'How do I enroll in AI Micro Degree?',
        'What are the course prerequisites?',
        'How long does the AI track take to complete?',
      ];
    } else if (query.includes('cloud') || query.includes('kubernetes') || query.includes('docker')) {
      reply =
        '**Hybrid Cloud & Kubernetes Track:**\n\n' +
        'This 10-week curriculum equips learners with industry DevOps competencies:\n' +
        '- **Containers:** Writing production multi-stage Dockerfiles and containerizing Next.js microservices.\n' +
        '- **Kubernetes (K8s):** Pod lifecycle, Deployments, Services, Ingress controllers, and ConfigMaps.\n' +
        '- **CI/CD:** Automated GitHub Actions workflows deploying to cloud clusters.';
      suggestedFollowUps = [
        'What is an Ingress controller in Kubernetes?',
        'How do I view available courses?',
        'How do trainers grade students?',
      ];
    } else {
      reply =
        `Hello! I'm your **GlobeSkill AI Technical Mentor**${courseContext ? ` for *${courseContext}*` : ''}.\n\n` +
        'I can assist you with:\n' +
        '- **Code & Architecture:** React 19, Next.js App Router, Tailwind CSS, TypeScript, and SQL.\n' +
        '- **Security & Storage:** Supabase Row Level Security (RLS), signed URLs, and JWT authentication.\n' +
        '- **Curriculum & Grading:** Milestone quizzes, passing criteria (70%+), and certificate downloads.\n\n' +
        'Feel free to ask a specific technical question or choose from the suggested topics below!';
      suggestedFollowUps = [
        'Explain React 19 Server Actions',
        'How does Supabase RLS work?',
        'How do I earn my AI Micro Degree certificate?',
      ];
    }

    const chatRes = NextResponse.json(
      {
        success: true,
        reply,
        suggestedFollowUps,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    return applyRateLimitHeaders(chatRes, rateLimit);
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process AI chat query.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
