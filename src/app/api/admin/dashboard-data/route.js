import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Requirement from '@/models/Requirement';
import { getNineBoxCategory } from '@/utils/nineBox';

export async function GET(request) {
    try {
        await dbConnect();

        // In a real app, verify the token here or use middleware
        // For this task, we assume the frontend handles the protection via redirection
        // but it is good practice to check the cookie here too.
        const token = request.cookies.get('admin_token');
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const users = await User.find({})
            .select('name fullName email enrolledCourses status score ranking rating performanceRating potentialRating idpScore department currentRole targetRole reportingManager workExperience technicalSkills softSkills certifications accountStatus username')
            .sort({ idpScore: -1 });

        // Fetch all requirements to map to roles
        const requirements = await Requirement.find({}).lean();
        const roleRequirementsMap = requirements.reduce((acc, req) => {
            if (req.roleName) {
                acc[req.roleName.toLowerCase()] = {
                    skills: req.skills || [],
                    required: req.requirements || []
                };
            }
            return acc;
        }, {});

        // Transform data to match requirements
        // Transform data to match requirements
        const formattedUsers = users.map(user => {
            // Skill Gap Calculation
            let skillGap = [];
            // Use targetRole if available, otherwise fallback to currentRole
            const targetRoleName = user.targetRole || user.currentRole || '';
            const roleKey = targetRoleName.toLowerCase();

            if (roleRequirementsMap[roleKey]) {
                const requiredSkills = roleRequirementsMap[roleKey].skills.map(s => s.toLowerCase());
                const userSkills = [
                    ...(user.technicalSkills || []),
                    ...(user.softSkills || [])
                ].map(s => s.toLowerCase());

                // Find skills in requiredSkills that are NOT in userSkills
                skillGap = roleRequirementsMap[roleKey].skills.filter(reqSkill =>
                    !userSkills.includes(reqSkill.toLowerCase())
                );
            }

            return {
                id: user._id,
                name: user.fullName || user.username || 'Unknown',
                email: user.email,
                courseHistory: user.enrolledCourses, // List of role IDs
                status: user.status,
                score: user.score,
                ranking: user.ranking,
                rating: user.rating,
                performanceRating: user.performanceRating || 0,
                potentialRating: user.potentialRating || 0,
                technicalSkills: user.technicalSkills || [],
                softSkills: user.softSkills || [],
                certifications: user.certifications || [],
                // New fields for EmployeeTable
                department: user.department || 'N/A',
                role: user.currentRole || 'N/A',
                targetRole: user.targetRole || user.currentRole || 'N/A', // Return the effective target role
                reportingManager: user.reportingManager || 'N/A',
                workingYears: user.workExperience || 'N/A',
                idpScore: user.idpScore,
                category: getNineBoxCategory(user.idpScore),
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`, // Placeholder image
                skillGap: skillGap,
                accountStatus: user.accountStatus || 'PENDING' // Default to PENDING if undefined
            };
        });

        // Sorting Logic: Sort by IDP Score descending ONLY (as per final requirements)
        formattedUsers.sort((a, b) => b.idpScore - a.idpScore);

        return NextResponse.json(formattedUsers, { status: 200 });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
