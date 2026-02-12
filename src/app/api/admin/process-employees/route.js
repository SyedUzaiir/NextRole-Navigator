import { GoogleGenerativeAI } from '@google/generative-ai';
import EmployeeUpload from '@/models/EmployeeUpload';
import connectDB from '@/lib/db';
import Papa from 'papaparse';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        console.log("Starting Process Employees...");
        await connectDB();

        // 1. Strict Sync Chain: Parse Incoming JSON
        const body = await req.json();
        const data = body.data || body;

        console.log(`Received ${data.length} records to process.`);

        if (!Array.isArray(data) || data.length === 0) {
            return new Response(JSON.stringify({ error: 'No data provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // 2. Strict Sync Chain: Processing Loop
        // We ensure complete resolution of all promises before proceeding
        const results = await Promise.all(
            data.map(async (record, index) => {
                // Validation
                if (!record.email || !record.targetRole) {
                    console.log(`Skipping record ${index}: Missing email or targetRole`);
                    return null;
                }

                try {
                    // A. Call Gemini -> await response
                    const currentSkills = record.currentSkills || "None listed";
                    const targetRole = record.targetRole;
                    const prompt = `Given Current Skills: ${currentSkills} and Target Role: ${targetRole}, list only the specific upgrading/missing skills required to reach the target role. Output format: Return ONLY a JSON array of strings. Example: ["Skill1", "Skill2"]`;

                    let upgradingSkills = [];
                    try {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                        upgradingSkills = JSON.parse(text);
                    } catch (aiError) {
                        console.error(`AI Error for ${record.email}:`, aiError.message);
                        upgradingSkills = ["Manual Review Required"];
                    }

                    // B. await MongoDB Save
                    // Using findOneAndUpdate to securely handle upserts
                    const savedDoc = await EmployeeUpload.findOneAndUpdate(
                        { email: record.email },
                        {
                            ...record,
                            upgradingSkills: upgradingSkills,
                            yearsOfExperience: Number(record.yearsOfExperience) || 0
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    return savedDoc;

                } catch (err) {
                    console.error(`Error processing ${record.email}:`, err);
                    return null;
                }
            })
        );

        console.log("All records processed. Fetching updated dataset...");

        // 3. ONLY AFTER the previous step finishes: Fetch All Documents
        const allRecords = await EmployeeUpload.find({}).lean();

        console.log(`Fetched ${allRecords.length} records for CSV generation.`);

        // 4. Convert to CSV string (in memory)
        const csvData = allRecords.map(r => {
            // Flatten upgradingSkills array to a string
            const skillsStr = Array.isArray(r.upgradingSkills)
                ? r.upgradingSkills.join(', ')
                : (r.upgradingSkills || '');

            return {
                Name: r.name,
                Email: r.email,
                TargetRole: r.targetRole,
                CurrentSkills: r.currentSkills,
                UpgradingSkills: skillsStr,
                YearsOfExperience: r.yearsOfExperience,
                Course: r.course,
                // Add other fields as necessary, ensuring simple key-value pairs
            };
        });

        const csvString = Papa.unparse(csvData);

        // 5. FINAL STEP: Return the CSV string with correct headers
        return new Response(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="processed_employee_report.csv"',
            },
        });

    } catch (error) {
        console.error('CRITICAL SERVER ERROR:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
