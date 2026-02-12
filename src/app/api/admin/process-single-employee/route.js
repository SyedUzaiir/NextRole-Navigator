import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import EmployeeUpload from '@/models/EmployeeUpload';
import connectDB from '@/lib/db';

export async function POST(req) {
    try {
        console.log('=== API REQUEST STARTED ===');

        // 1. Check Environment Variables
        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is not defined');
            return NextResponse.json({
                error: 'Server Configuration Error',
                details: 'GEMINI_API_KEY is missing in environment variables'
            }, { status: 500 });
        }

        await connectDB();

        const rawRecord = await req.json();

        console.log('=== RAW RECORD RECEIVED ===');
        console.log('Raw keys:', Object.keys(rawRecord));

        // Helper function to find a field with various possible names
        const findField = (record, ...possibleNames) => {
            for (const name of possibleNames) {
                // Try exact match
                if (record[name] !== undefined && record[name] !== null && record[name] !== '') {
                    return String(record[name]).trim();
                }

                // Try case-insensitive match
                const lowerName = name.toLowerCase();
                for (const key of Object.keys(record)) {
                    if (key.toLowerCase() === lowerName) {
                        const value = record[key];
                        if (value !== undefined && value !== null && value !== '') {
                            return String(value).trim();
                        }
                    }
                }
            }
            return '';
        };

        // Map all possible field variations
        const record = {
            name: findField(rawRecord, 'Name', 'name', 'NAME', 'employee_name', 'Employee Name'),
            email: findField(rawRecord, 'Email', 'email', 'EMAIL', 'e-mail', 'E-mail'),
            course: findField(rawRecord, 'Course', 'course', 'COURSE', 'courses'),
            role: findField(rawRecord, 'Role', 'role', 'ROLE', 'Current_Role', 'current_role', 'CurrentRole', 'CourseRoleCurrent'),
            currentSkills: findField(rawRecord, 'Current_Skills', 'current_skills', 'currentSkills', 'CurrentSkills', 'skills', 'Skills'),
            targetRole: findField(rawRecord, 'Target_Role', 'target_role', 'targetRole', 'TargetRole', 'target', 'Target'),
            yearsOfExperience: findField(rawRecord, 'Years_of_Exp', 'years_of_exp', 'yearsOfExperience', 'experience', 'Experience', 'Years', 'years', 'Years_of_Experience')
        };

        console.log('=== MAPPED RECORD ===');
        console.log(JSON.stringify(record, null, 2));

        // Validation - only email and targetRole are required
        if (!record.email || !record.targetRole) {
            const errorMsg = {
                error: 'Invalid record data',
                details: 'Missing required fields (email or targetRole)',
                required: {
                    email: !!record.email,
                    targetRole: !!record.targetRole
                },
                mappedRecord: record, // Send back what we understood
                receivedKeys: Object.keys(rawRecord)
            };
            console.error('=== VALIDATION FAILED ===');
            console.error(JSON.stringify(errorMsg, null, 2));
            return NextResponse.json(errorMsg, { status: 400 });
        }

        // Initialize Gemini INSIDE the handler to be safe
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // AI Step
        const currentSkills = record.currentSkills || "No current skills listed";
        const targetRole = record.targetRole;
        const prompt = `Given current skills: "${currentSkills}" and target role: "${targetRole}", list 3-5 specific technical skills needed to upgrade. Return ONLY a JSON array of strings like ["Skill1", "Skill2", "Skill3"]. No markdown, no explanations.`;

        let upgradingSkills = [];
        try {
            console.log(`Calling Gemini for ${record.email}...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            // Clean up any markdown
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            // Try to find array bracket if extra text exists
            const startIdx = text.indexOf('[');
            const endIdx = text.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1) {
                text = text.substring(startIdx, endIdx + 1);
            }

            upgradingSkills = JSON.parse(text);
            console.log(`Gemini response for ${record.email}:`, upgradingSkills);
        } catch (aiError) {
            console.error(`AI Error for ${record.email}:`, aiError.message);
            upgradingSkills = ["Manual Review Required"];
        }

        // DB Step
        console.log(`Saving to database: ${record.email}`);
        const savedRecord = await EmployeeUpload.findOneAndUpdate(
            { email: record.email },
            {
                name: record.name,
                email: record.email,
                course: record.course,
                role: record.role,
                currentSkills: record.currentSkills,
                targetRole: record.targetRole,
                upgradingSkills: upgradingSkills,
                yearsOfExperience: parseInt(record.yearsOfExperience) || 0
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`✓ Successfully processed ${record.email}`);

        // Return enriched object
        return NextResponse.json({
            success: true,
            data: savedRecord
        });

    } catch (error) {
        console.error('=== CRITICAL ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
