import NestedCoursePlayer from '@/components/NestedCoursePlayer';

export default async function CoursePage({ params }) {
    const { courseId } = await params;
    return <NestedCoursePlayer courseId={courseId} />;
}
