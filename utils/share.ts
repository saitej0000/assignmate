
/**
 * Shares content using the Web Share API if available, otherwise copies to clipboard.
 * @returns 'shared' if shared via OS, 'copied' if copied to clipboard, or null/false if failed/cancelled.
 */
export const shareContent = async (title: string, text: string, url: string = window.location.href): Promise<'shared' | 'copied' | null> => {
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url
            });
            return 'shared';
        } catch (error: any) {
            // User cancelled share or other error
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
            return null;
        }
    } else {
        try {
            await navigator.clipboard.writeText(url);
            return 'copied';
        } catch (error) {
            console.error('Error copying to clipboard', error);
            return null;
        }
    }
};
