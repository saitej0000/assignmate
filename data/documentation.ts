// Documentation content for AssignMate
// Each section contains all the information about the platform

export interface DocSection {
    id: string;
    title: string;
    icon: string;
    content: DocContent[];
}

export interface DocContent {
    type: 'heading' | 'paragraph' | 'list' | 'code' | 'tip' | 'warning' | 'image';
    content: string | string[];
    language?: string;
}

export const documentationData: DocSection[] = [
    {
        id: 'introduction',
        title: 'What is AssignMate?',
        icon: 'info',
        content: [
            { type: 'heading', content: 'Welcome to AssignMate! 🎓' },
            { type: 'paragraph', content: 'AssignMate is India\'s #1 secure platform where college students can connect with verified senior students (writers) to get help with their assignments. Think of it as a trusted marketplace within your college community.' },
            { type: 'heading', content: 'How It Works (Simple!)' },
            {
                type: 'list', content: [
                    '📝 Sign up with your college email or Google account',
                    '🔍 Browse verified writers from your college',
                    '💬 Chat securely and discuss your requirements',
                    '🤝 Connect and build your academic network',
                    '✅ Get help with assignments safely'
                ]
            },
            { type: 'tip', content: 'AssignMate uses a Trust System with verified profiles, portfolio samples, and ratings to ensure you connect with reliable writers.' },
            { type: 'heading', content: 'Key Features' },
            {
                type: 'list', content: [
                    'Hyper-Local: Find writers from YOUR college',
                    'Verified Profiles: ID verification for trust',
                    'Real-time Chat: Instant messaging with file sharing',
                    'Portfolio System: See writing samples before you connect',
                    'XP & Levels: Writers earn experience and level up'
                ]
            }
        ]
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: 'rocket_launch',
        content: [
            { type: 'heading', content: 'Create Your Account' },
            { type: 'paragraph', content: 'Getting started takes less than 2 minutes!' },
            { type: 'heading', content: 'Option 1: Sign in with Google (Fastest)' },
            {
                type: 'list', content: [
                    'Click "Sign in with Google" on the login page',
                    'Select your Google account',
                    'Complete your profile by choosing a username and selecting your college',
                    'Choose if you want to "Find Help" or "Earn Money" as a writer'
                ]
            },
            { type: 'heading', content: 'Option 2: Email Registration' },
            {
                type: 'list', content: [
                    'Click "Sign Up" and fill in your details',
                    'Enter your full name, email, and create a password',
                    'Choose a unique username (handle) - this is how others will find you',
                    'Select your college from the dropdown',
                    'Optionally add a bio about yourself'
                ]
            },
            { type: 'tip', content: 'Use your college email for faster verification!' },
            { type: 'heading', content: 'Complete Your Profile' },
            { type: 'paragraph', content: 'A complete profile gets 5x more responses! Make sure to:' },
            {
                type: 'list', content: [
                    'Upload a profile picture (click the camera icon)',
                    'Add a bio telling others about yourself',
                    'Add skill tags like "Math", "Engineering", "English"',
                    'If you\'re a writer, upload portfolio samples'
                ]
            }
        ]
    },
    {
        id: 'finding-writers',
        title: 'Finding Writers',
        icon: 'search',
        content: [
            { type: 'heading', content: 'How to Find the Perfect Writer' },
            { type: 'paragraph', content: 'AssignMate makes it easy to find verified writers who can help you with your assignments.' },
            { type: 'heading', content: 'Step 1: Browse the Writers Page' },
            {
                type: 'list', content: [
                    'Go to the "Writers" page from the navigation',
                    'You\'ll see a grid of available writers',
                    'Each card shows their name, college, rating, and availability'
                ]
            },
            { type: 'heading', content: 'Step 2: Use Filters' },
            {
                type: 'list', content: [
                    'Filter by College: Find writers from your own college',
                    'Search by Name: Type a name or username to search',
                    'Filter by Skills: Look for specific expertise like "Mathematics" or "Programming"'
                ]
            },
            { type: 'heading', content: 'Step 3: Check Writer Profiles' },
            { type: 'paragraph', content: 'Click on any writer card to see their full profile:' },
            {
                type: 'list', content: [
                    '📸 Portfolio Samples - See their actual work',
                    '⭐ Rating & Reviews - What others say about them',
                    '✅ Verification Status - Blue tick means verified',
                    '📊 Stats - Projects completed, response time, on-time rate',
                    '🏷️ Skills - What subjects they\'re good at'
                ]
            },
            { type: 'tip', content: 'Look for writers with the blue "Verified" badge - they have submitted their college ID for verification!' },
            { type: 'heading', content: 'Step 4: Connect or Message' },
            {
                type: 'list', content: [
                    'Click "Connect" to send a connection request',
                    'Once connected, you can start chatting directly',
                    'Or click "Message" to start a conversation right away'
                ]
            }
        ]
    },
    {
        id: 'becoming-writer',
        title: 'Becoming a Writer',
        icon: 'edit_note',
        content: [
            { type: 'heading', content: 'Earn Money by Helping Fellow Students' },
            { type: 'paragraph', content: 'As a writer on AssignMate, you can earn money by helping other students with their assignments. Here\'s how to get started:' },
            { type: 'heading', content: 'Step 1: Enable Writer Mode' },
            {
                type: 'list', content: [
                    'Go to your Profile page',
                    'Toggle ON the "Writer Mode" switch at the bottom of your profile card',
                    'You need at least 1 portfolio sample to enable writer mode'
                ]
            },
            { type: 'heading', content: 'Step 2: Build Your Portfolio' },
            { type: 'paragraph', content: 'Your portfolio is crucial - it shows potential clients your writing quality!' },
            {
                type: 'list', content: [
                    'Click "Add New" in the Portfolio section',
                    'Upload images of your best handwritten assignments',
                    'You can add multiple samples to showcase variety',
                    'Delete samples anytime by hovering and clicking the trash icon'
                ]
            },
            { type: 'warning', content: 'Only upload YOUR OWN work. Plagiarized content will result in account suspension.' },
            { type: 'heading', content: 'Step 3: Get Verified (Highly Recommended)' },
            {
                type: 'list', content: [
                    'Scroll to the "Trust Score" section on your profile',
                    'Click "Verify" next to "ID Verification"',
                    'Upload a clear photo of your college ID card',
                    'Wait for admin approval (usually 24-48 hours)',
                    'Once verified, you get a blue "Verified" badge!'
                ]
            },
            { type: 'tip', content: 'Verified writers get 10x more connection requests!' },
            { type: 'heading', content: 'Step 4: Set Up Your Profile' },
            {
                type: 'list', content: [
                    'Write a compelling bio about your strengths',
                    'Add skill tags that match what you can help with',
                    'Make sure your school/college is correct',
                    'Upload a professional-looking profile photo'
                ]
            },
            { type: 'heading', content: 'XP & Leveling System' },
            { type: 'paragraph', content: 'As you complete projects and receive positive feedback, you earn XP (Experience Points):' },
            {
                type: 'list', content: [
                    'Level 1: New Writer (0-100 XP)',
                    'Level 2: Active Writer (100-500 XP)',
                    'Level 3: Trusted Writer (500-1000 XP)',
                    'Level 4+: Expert Writer (1000+ XP)',
                    'Higher levels = more visibility in search results!'
                ]
            }
        ]
    },
    {
        id: 'chat-system',
        title: 'Chat & Messaging',
        icon: 'chat',
        content: [
            { type: 'heading', content: 'Real-Time Messaging' },
            { type: 'paragraph', content: 'AssignMate\'s chat system lets you communicate securely with writers in real-time.' },
            { type: 'heading', content: 'Starting a Conversation' },
            {
                type: 'list', content: [
                    'Click "Message" on any writer\'s profile or card',
                    'A chat room will be created automatically',
                    'Type your message and press Enter or click Send'
                ]
            },
            { type: 'heading', content: 'Chat Features' },
            {
                type: 'list', content: [
                    '💬 Real-time Messages - See messages instantly',
                    '📎 File Sharing - Send images, PDFs, and documents',
                    '✔️ Read Receipts - Know when your message is read',
                    '⌨️ Typing Indicator - See when the other person is typing',
                    '🔔 Notifications - Get push notifications for new messages'
                ]
            },
            { type: 'heading', content: 'Sharing Files' },
            {
                type: 'list', content: [
                    'Click the attachment (📎) icon in the chat',
                    'Select a file from your device',
                    'Supported formats: Images, PDFs, Word documents',
                    'Maximum file size: 10MB'
                ]
            },
            { type: 'tip', content: 'You can send assignment PDFs directly in the chat for easy discussion!' },
            { type: 'heading', content: 'Managing Your Chats' },
            {
                type: 'list', content: [
                    'Access all your conversations from the "Messages" page',
                    'Chats are sorted by most recent activity',
                    'Unread message count is shown on each chat',
                    'Click any chat to open the conversation'
                ]
            },
            { type: 'warning', content: 'Never share personal payment information like UPI IDs or bank details in the chat. Use the official escrow system for payments.' }
        ]
    },
    {
        id: 'connections',
        title: 'Connections & Network',
        icon: 'group',
        content: [
            { type: 'heading', content: 'Building Your Academic Network' },
            { type: 'paragraph', content: 'Connections on AssignMate work like LinkedIn - they represent trusted relationships between students.' },
            { type: 'heading', content: 'Sending Connection Requests' },
            {
                type: 'list', content: [
                    'Visit a student or writer\'s profile',
                    'Click the "Connect" button',
                    'The request is sent to the other person',
                    'Wait for them to accept your request'
                ]
            },
            { type: 'heading', content: 'Managing Connection Requests' },
            {
                type: 'list', content: [
                    'Go to the "Connections" page from navigation',
                    'See your pending incoming requests at the top',
                    'Click ✓ (check) to accept a request',
                    'Click ✗ (cross) to reject a request'
                ]
            },
            { type: 'heading', content: 'Your Connection List' },
            { type: 'paragraph', content: 'Once connected, you can:' },
            {
                type: 'list', content: [
                    'See all your connections in a grid view',
                    'Click the message icon to start chatting',
                    'View their full profile anytime',
                    'Connected users can message each other directly'
                ]
            },
            { type: 'tip', content: 'Having more connections increases your visibility and credibility on the platform!' }
        ]
    },
    {
        id: 'profile-settings',
        title: 'Profile & Settings',
        icon: 'person',
        content: [
            { type: 'heading', content: 'Managing Your Profile' },
            { type: 'paragraph', content: 'Your profile is your identity on AssignMate. Keep it updated to attract more connections!' },
            { type: 'heading', content: 'Editing Your Profile' },
            {
                type: 'list', content: [
                    'Go to the "Profile" page',
                    'Click the "Edit" button',
                    'Update your name, bio, and school',
                    'Click "Save Changes" when done'
                ]
            },
            { type: 'heading', content: 'Changing Your Avatar' },
            {
                type: 'list', content: [
                    'Click the camera icon on your profile picture',
                    'Select an image from your device',
                    'The image will be uploaded and saved automatically'
                ]
            },
            { type: 'heading', content: 'Adding Skills/Tags' },
            {
                type: 'list', content: [
                    'Go to the "About" tab on your profile',
                    'Type a skill in the "Add Tag" input',
                    'Press Enter to add it',
                    'Click the ✗ next to any tag to remove it'
                ]
            },
            { type: 'heading', content: 'Privacy Settings' },
            { type: 'paragraph', content: 'Control who can see your profile:' },
            {
                type: 'list', content: [
                    'Global Visibility: Anyone on AssignMate can find you',
                    'College Only: Only students from your college can find you'
                ]
            },
            { type: 'warning', content: 'Deleting your account is permanent! All your data, chats, and connections will be removed. This cannot be undone.' },
            { type: 'heading', content: 'Deleting Your Account' },
            {
                type: 'list', content: [
                    'Scroll to the bottom of your profile page',
                    'Click "Delete Account"',
                    'Type "DELETE" to confirm',
                    'Click "Delete Forever"'
                ]
            }
        ]
    },
    {
        id: 'verification',
        title: 'Trust & Verification',
        icon: 'verified',
        content: [
            { type: 'heading', content: 'AssignMate Trust System' },
            { type: 'paragraph', content: 'We take trust seriously. Our multi-layer verification system ensures you connect with real, reliable students.' },
            { type: 'heading', content: 'Trust Score Components' },
            {
                type: 'list', content: [
                    '✅ Email Verified - Everyone has a verified email',
                    '🔵 ID Verified - Blue badge for ID verification',
                    '⭐ Rating - Based on completed projects',
                    '📊 XP Level - Shows experience on the platform'
                ]
            },
            { type: 'heading', content: 'Getting ID Verified' },
            {
                type: 'list', content: [
                    'Go to your Profile page',
                    'Find the "Trust Score" section',
                    'Click "Verify" next to ID Verification',
                    'Upload a clear photo of your college ID',
                    'Our team reviews it within 24-48 hours',
                    'Once approved, you get the blue verified badge!'
                ]
            },
            { type: 'tip', content: 'Your ID is only used for verification and is never shared with other users.' },
            { type: 'heading', content: 'Benefits of Verification' },
            {
                type: 'list', content: [
                    '🔵 Blue Verified Badge on your profile',
                    '📈 10x more visibility in search results',
                    '🤝 Higher connection request acceptance rate',
                    '💰 Access to higher-value projects (coming soon)',
                    '⭐ Priority support from the AssignMate team'
                ]
            },
            { type: 'heading', content: 'What We Check' },
            {
                type: 'list', content: [
                    'College name matches your profile',
                    'Photo on ID is clearly visible',
                    'ID is valid and not expired',
                    'Name matches your profile name'
                ]
            }
        ]
    },
    {
        id: 'security',
        title: 'Security & Safety',
        icon: 'security',
        content: [
            { type: 'heading', content: 'Your Safety Matters' },
            { type: 'paragraph', content: 'AssignMate is built with security at its core. Here\'s how we keep you safe.' },
            { type: 'heading', content: 'Account Security' },
            {
                type: 'list', content: [
                    '🔐 Secure authentication via Firebase Auth',
                    '🔒 Encrypted data transmission (HTTPS)',
                    '🛡️ Protected database with strict access rules',
                    '📱 Session management and secure logout'
                ]
            },
            { type: 'heading', content: 'Payment Safety (Escrow System)' },
            { type: 'paragraph', content: 'Our escrow system protects both students and writers:' },
            {
                type: 'list', content: [
                    'Money is held securely until work is completed',
                    'Writer only gets paid after you approve the work',
                    'If there\'s a dispute, our team mediates',
                    'Refunds are processed for cancelled orders'
                ]
            },
            { type: 'warning', content: 'Never pay writers directly outside the platform! Always use the official escrow system for your protection.' },
            { type: 'heading', content: 'Reporting Issues' },
            {
                type: 'list', content: [
                    'Contact support if you encounter suspicious behavior',
                    'Report fake profiles or scammers',
                    'Flag inappropriate content in chats',
                    'Our team investigates all reports within 24 hours'
                ]
            },
            { type: 'heading', content: 'Best Practices' },
            {
                type: 'list', content: [
                    'Never share your password with anyone',
                    'Don\'t click suspicious links in chats',
                    'Verify writer profiles before connecting',
                    'Keep all transactions within the platform',
                    'Log out when using shared devices'
                ]
            }
        ]
    },
    {
        id: 'faq',
        title: 'FAQs',
        icon: 'help',
        content: [
            { type: 'heading', content: 'Frequently Asked Questions' },
            { type: 'heading', content: 'Q: Is AssignMate free to use?' },
            { type: 'paragraph', content: 'A: Yes! Creating an account, browsing writers, and messaging is completely free. You only pay when you hire a writer for a project.' },
            { type: 'heading', content: 'Q: How do I know if a writer is trustworthy?' },
            { type: 'paragraph', content: 'A: Look for the blue verified badge, check their portfolio samples, read reviews from other students, and review their XP level and completion stats.' },
            { type: 'heading', content: 'Q: Can I message someone without connecting?' },
            { type: 'paragraph', content: 'A: Yes! You can message any writer directly by clicking the "Message" button on their profile. Connections are optional but recommended for building your network.' },
            { type: 'heading', content: 'Q: How do payments work?' },
            { type: 'paragraph', content: 'A: When you hire a writer, your payment goes into escrow. The writer gets paid only after you approve the completed work. This protects both parties.' },
            { type: 'heading', content: 'Q: What if I\'m not satisfied with the work?' },
            { type: 'paragraph', content: 'A: You can request revisions from the writer. If there\'s a dispute, contact our support team and we\'ll mediate a fair resolution.' },
            { type: 'heading', content: 'Q: How long does verification take?' },
            { type: 'paragraph', content: 'A: ID verification typically takes 24-48 hours. Make sure your ID photo is clear and matches your profile information.' },
            { type: 'heading', content: 'Q: Can I be both a student and a writer?' },
            { type: 'paragraph', content: 'A: Absolutely! You can toggle writer mode on/off from your profile. When it\'s on, you\'ll appear in search results for other students looking for help.' },
            { type: 'heading', content: 'Q: How do I delete my account?' },
            { type: 'paragraph', content: 'A: Go to Profile → Scroll to bottom → Click "Delete Account" → Type DELETE → Confirm. Note: This is permanent and cannot be undone.' },
            { type: 'heading', content: 'Q: Is my data safe?' },
            { type: 'paragraph', content: 'A: Yes! We use industry-standard encryption, secure authentication via Firebase, and strict database access rules. Your ID documents are only used for verification.' }
        ]
    },
    {
        id: 'tech-stack',
        title: 'Tech Stack',
        icon: 'code',
        content: [
            { type: 'heading', content: 'For Developers: Technical Overview' },
            { type: 'paragraph', content: 'AssignMate is built with modern technologies for scalability, performance, and developer experience.' },
            { type: 'heading', content: 'Frontend' },
            {
                type: 'list', content: [
                    'React 18 - Component-based UI library',
                    'TypeScript - Type-safe JavaScript',
                    'Tailwind CSS - Utility-first styling',
                    'Framer Motion - Smooth animations',
                    'React Router - Client-side routing',
                    'Vite - Fast build tool and dev server'
                ]
            },
            { type: 'heading', content: 'Backend & Database' },
            {
                type: 'list', content: [
                    'Firebase Auth - User authentication (Email/Google)',
                    'Cloud Firestore - NoSQL real-time database',
                    'Firebase Realtime DB - Presence & typing indicators',
                    'Supabase Storage - File storage for images/docs',
                    'Firebase Cloud Messaging (FCM) - Push notifications'
                ]
            },
            { type: 'heading', content: 'Project Structure' },
            {
                type: 'code', content: `assignmate/
├── pages/          # Page components (Auth, Feed, Profile, etc.)
├── components/     # Reusable UI components
│   ├── ui/         # Glass buttons, cards, inputs
│   └── dashboard/  # Sidebar, header components
├── services/       # API & database services
│   ├── firebase.ts       # Firebase config & helpers
│   ├── firestoreService.ts # Database operations
│   └── supabaseStorage.ts  # File upload service
├── contexts/       # React contexts (Auth, Toast)
├── admin/          # Admin panel pages & components
├── types.ts        # TypeScript interfaces
└── App.tsx         # Main app with routing`, language: 'text'
            },
            { type: 'heading', content: 'Key Services' },
            {
                type: 'list', content: [
                    'firestoreService.ts - All database CRUD operations',
                    'firebase.ts - Auth, notifications, presence',
                    'supabaseStorage.ts - File uploads (avatars, portfolio)',
                    'collegeService.ts - College autocomplete data',
                    'adminService.ts - Admin panel operations'
                ]
            },
            { type: 'heading', content: 'Deployment' },
            {
                type: 'list', content: [
                    'Hosted on Vercel for automatic CI/CD',
                    'Firebase hosting for static assets',
                    'Environment variables managed via .env files'
                ]
            }
        ]
    }
];

export const getDocSectionById = (id: string): DocSection | undefined => {
    return documentationData.find(section => section.id === id);
};

export const searchDocs = (query: string): DocSection[] => {
    const lowerQuery = query.toLowerCase();
    return documentationData.filter(section => {
        const titleMatch = section.title.toLowerCase().includes(lowerQuery);
        const contentMatch = section.content.some(item => {
            if (typeof item.content === 'string') {
                return item.content.toLowerCase().includes(lowerQuery);
            }
            if (Array.isArray(item.content)) {
                return item.content.some(c => c.toLowerCase().includes(lowerQuery));
            }
            return false;
        });
        return titleMatch || contentMatch;
    });
};
