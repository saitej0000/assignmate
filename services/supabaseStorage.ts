import { supabase } from './supabaseClient';

export const supabaseStorage = {
    /**
     * Uploads a file to Supabase Storage.
     * @param file The file to upload.
     * @param path The path including the filename (e.g., 'avatars/user_123/avatar.jpg'). 
     *             The first segment will be used as the bucket name if it matches a known bucket.
     * @returns Public URL of the uploaded file.
     */
    uploadFile: async (file: File, path: string): Promise<string> => {
        try {
            // Determine bucket from path (default to 'uploads' if not specific)
            let bucket = 'uploads';
            let key = path;

            if (path.startsWith('avatars/')) {
                bucket = 'avatars';
                key = path.replace('avatars/', '');
            } else if (path.startsWith('portfolio/')) {
                bucket = 'portfolio';
                key = path.replace('portfolio/', '');
            } else if (path.startsWith('chat-files/')) {
                bucket = 'chat-files';
                key = path.replace('chat-files/', '');
            }

            // Upload
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(key, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error("Supabase Upload Error:", error);
                throw error;
            }

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(key);

            return publicData.publicUrl;
        } catch (error) {
            console.error("Failed to upload file to Supabase:", error);
            throw error;
        }
    }
};
