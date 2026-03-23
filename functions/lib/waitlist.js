"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWaitlistSignup = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
// Initialize Resend
// We use functions.config().resend.api_key for the secret if set via `firebase functions:config:set`
// Or process.env.RESEND_API_KEY if using Firebase Secrets Manager (v2 / recommended v1 approach)
// We'll wrap initialization so it doesn't crash on boot if the key is missing locally
let resend = null;
const initResend = () => {
    var _a;
    if (resend)
        return resend;
    const apiKey = process.env.RESEND_API_KEY || ((_a = functions.config().resend) === null || _a === void 0 ? void 0 : _a.api_key);
    if (apiKey) {
        resend = new resend_1.Resend(apiKey);
    }
    return resend;
};
/**
 * Trigger: When a new document is added to the waitlist
 * Path: waitlist/{entryId}
 */
exports.onWaitlistSignup = functions.firestore
    .document('waitlist/{entryId}')
    .onCreate(async (snap, context) => {
    var _a;
    const data = snap.data();
    const email = data === null || data === void 0 ? void 0 : data.email;
    const college = (data === null || data === void 0 ? void 0 : data.college) || 'your college';
    if (!email) {
        console.error('[onWaitlistSignup] No email provided in doc:', context.params.entryId);
        return;
    }
    const mailer = initResend();
    if (!mailer) {
        console.error('[onWaitlistSignup] Resend API key is missing. Ensure RESEND_API_KEY is configured.');
        return;
    }
    try {
        const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
                    <h2 style="color: #f97316;">Welcome to AssignMate! 🚀</h2>
                    <p>Hi there,</p>
                    <p>I'm Junaid, the founder of AssignMate. I wanted to personally reach out and say <strong>thank you</strong> for joining our waitlist!</p>
                    <p>We are building India's first hyper-local student collaboration network, and we're thrilled to have students from ${college} jumping on board early.</p>
                    <p>We're working day and night to get everything perfect for our May 20, 2026 launch. In the meantime, I have one quick favor to ask:</p>
                    <p><strong>Reply to this email and let me know the #1 struggle you face with academics or finding peers on your campus right now.</strong></p>
                    <p>I read every single reply, and it helps us build exactly what you need.</p>
                    <br/>
                    <p>Stay tuned for updates!</p>
                    <p>Best,<br/>
                    <strong>Junaid Pasha</strong><br/>
                    Founder, AssignMate</p>
                </div>
            `;
        const response = await mailer.emails.send({
            from: 'Junaid at AssignMate <founders@assignmate.com>',
            to: [email],
            subject: 'Welcome to the AssignMate Waitlist 🚀',
            html: htmlContent
        });
        console.log('[onWaitlistSignup] Successfully sent welcome email to:', email, 'Response ID:', (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.id);
    }
    catch (error) {
        console.error('[onWaitlistSignup] Failed to send email to:', email, 'Error:', error);
    }
});
//# sourceMappingURL=waitlist.js.map