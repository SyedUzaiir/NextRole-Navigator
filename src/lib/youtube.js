import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOG_API_KEY,
});

export async function searchYouTubeVideo(query) {
    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: query,
            maxResults: 1,
            type: 'video',
            videoEmbeddable: 'true',
        });

        if (response.data.items && response.data.items.length > 0) {
            const video = response.data.items[0];
            return {
                videoId: video.id.videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.high.url,
                channelTitle: video.snippet.channelTitle,
            };
        } else {
            console.warn(`No video found for query: ${query}`);
            return null;
        }
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return null;
    }
}
