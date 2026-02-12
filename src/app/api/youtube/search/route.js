import { NextResponse } from 'next/server';
import { searchYouTubeVideo } from '@/lib/youtube';
import { createClient } from '@/utils/supabase/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, courseId, moduleIndex, subModuleIndex } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch video from YouTube API
    const videoData = await searchYouTubeVideo(query);

    if (!videoData) {
      return NextResponse.json({ error: 'No video found' }, { status: 404 });
    }

    const result = {
      videoId: videoData.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoData.videoId}`,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      channelTitle: videoData.channelTitle,
    };

    // Optionally cache the result in the database if courseId is provided
    if (courseId && moduleIndex !== undefined && subModuleIndex !== undefined) {
      try {
        await connectDB();
        await Course.updateOne(
          { _id: courseId },
          {
            $set: {
              [`modules.${moduleIndex}.subModules.${subModuleIndex}.videoUrl`]: result.videoUrl,
              [`modules.${moduleIndex}.subModules.${subModuleIndex}.videoId`]: result.videoId,
            }
          }
        );
      } catch (dbError) {
        console.error('Error caching video in DB:', dbError);
        // Don't fail the request if caching fails
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}
