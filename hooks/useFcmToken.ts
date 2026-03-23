import { useEffect, useState } from 'react';
import { fcm } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const useFcmToken = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const setupFCM = async () => {
            if (!user) return;

            // 1. Request Permission & Get Token
            const token = await fcm.requestPermission(user.id);
            if (token) {
                setToken(token);
                console.log('FCM Token secured:', token);

                // Subscribe to topics (Vercel API)
                fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token,
                        school: user.school
                    })
                }).catch(err => console.error('Subscription error:', err));
            }

            // 2. Setup Foreground Listener
            fcm.onForegroundMessage((payload: any) => {
                console.log('[FCM] Foreground Message:', payload);
                const { notification } = payload;
                if (notification) {
                    // Show Toast Notification
                    toast(
                        notification.title || 'New Notification',
                        'info' // You might want to add a 'message' variant or icon
                    );

                    // Optional: Play a sound
                    try {
                        const audio = new Audio('/notification.mp3'); // Ensure this file exists or remove
                        audio.play().catch(e => console.log('Audio play failed', e));
                    } catch (e) {
                        // Ignore audio errors
                    }
                }
            });
        };

        setupFCM();
    }, [user]);

    return { fcmToken: token };
};
