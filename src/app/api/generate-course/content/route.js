import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from '@/models/Course';
import connectDB from '@/lib/db';
import { createClient } from '@/utils/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { courseId, moduleIndex, moduleTitle, roleContext } = await req.json();

        if (!courseId || moduleIndex === undefined || !moduleTitle) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
      Generate detailed content for the module: "${moduleTitle}".
      Course Context: ${roleContext || 'General Learning'}.
      
      The module must have 3-4 sub-modules.
      
      For each sub-module, provide:
      - Title
      - Detailed Explanation (at least 150 words)
      - Practical Examples (at least 2 distinct examples)
      - A search query to find a relevant YouTube tutorial.
      
      Also provide a quiz with 6-7 multiple choice questions for this module.
      
      Return STRICTLY JSON:
      {
        "subModules": [
          {
            "title": "Sub-module Title",
            "explanation": "Detailed explanation...",
            "examples": "Example 1... Example 2...",
            "youtubeQuery": "Search query"
          }
        ],
        "quiz": {
          "questions": [
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": "Correct Option"
            }
          ]
        }
      }
    `;

        // Retry logic for 429 errors from Gemini
        let text = '';
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                });
                const response = await result.response;
                text = response.text();
                break;
            } catch (err) {
                if (err.message.includes('429') || err.status === 429) {
                    if (retryCount === maxRetries) throw new Error('Gemini Rate Limit Exceeded');
                    await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
                    retryCount++;
                } else {
                    throw err;
                }
            }
        }

        const contentData = JSON.parse(text);

        // Prepare module update data
        // We need to preserve the title but update subModules and quiz
        const processedSubModules = contentData.subModules.map(sub => ({
            ...sub,
            youtubeQuery: sub.youtubeQuery || `${moduleTitle} ${sub.title} tutorial`,
            videoUrl: null,
            videoId: null,
            duration: null,
            isCompleted: false
        }));

        // Update specific module in MongoDB
        // Using dot notation for array update: "modules.INDEX.field"
        const updateField = {};
        updateField[`modules.${moduleIndex}.subModules`] = processedSubModules;
        updateField[`modules.${moduleIndex}.quiz`] = contentData.quiz;

        await Course.findByIdAndUpdate(courseId, { $set: updateField });

        return NextResponse.json({ success: true, moduleIndex });

    } catch (error) {
        console.error(`Module ${moduleIndex} generation error:`, error);
        // Return 500 but with specific message so frontend knows it failed
        return NextResponse.json({ error: error.message || 'Module generation failed' }, { status: 500 });
    }
}
