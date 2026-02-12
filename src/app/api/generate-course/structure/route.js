import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from '@/models/Course';
import User from '@/models/User';
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

        const user = await User.findOne({ email: supabaseUser.email });
        if (!user) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const { title, category, roleContext } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Generate ONLY Course Structure (Module Titles)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
      Create a comprehensive course outline on "${title}" for a user with the goal: "${category}".
      Role Context: ${roleContext || 'General Learning'}.
      
      The course must have exactly 5 modules.
      
      Return the response STRICTLY as a JSON object with the following structure:
      {
        "modules": [
          { "title": "Module 1 Title" },
          { "title": "Module 2 Title" },
          { "title": "Module 3 Title" },
          { "title": "Module 4 Title" },
          { "title": "Module 5 Title" }
        ]
      }
    `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
        });
        const response = await result.response;
        const text = response.text();

        let structureData;
        try {
            structureData = JSON.parse(text);
        } catch (e) {
            return NextResponse.json({ error: 'Failed to parse structure' }, { status: 500 });
        }

        // Create initial course with empty sub-modules
        const initialModules = structureData.modules.map(m => ({
            title: m.title,
            subModules: [], // Empty initially
            quiz: { questions: [] } // Empty initially
        }));

        const newCourse = new Course({
            userId: user._id,
            title,
            category,
            roleContext,
            modules: initialModules,
            status: 'active',
            totalProgress: 0,
        });

        await newCourse.save();

        return NextResponse.json({
            courseId: newCourse._id,
            modules: structureData.modules, // Return just titles/structure to client
            message: 'Course structure created'
        });

    } catch (error) {
        console.error('Structure generation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
