# 🔴 AssignMate Security Audit Report
**Red Team Assessment | January 18, 2026**

---

## Executive Summary

| Category | Severity | Status |
|----------|----------|--------|
| **Fake Verification** | 🔴 CRITICAL | AI exists but NOT integrated |
| **Reputation Gaming** | 🟠 HIGH | Self-like blocked, no rate limits |
| **Data Privacy (ID Cards)** | 🟢 SECURE | Proper access controls in place |
| **Content Safety** | 🔴 CRITICAL | No filtering at all |

---

## 1. Fake Verification Check 🔴

### What Should Happen
ID verification should analyze submitted ID cards via OCR/AI and queue them for human review.

### What Actually Happens

> [!CAUTION]
> **ID Verification does NOT analyze the uploaded ID card.** The AI function exists but is **never called**.

#### Verification Flow Analysis

**In `pages/Profile.tsx` (lines 294-309):**
```typescript
const handleIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ...
    const path = `verification/${profileUser.id}/${Date.now()}_${e.target.files[0].name}`;
    const url = await db.uploadFile(e.target.files[0], path);
    await db.updateProfile(profileUser.id, { is_verified: 'pending', id_card_url: url });
    success("ID uploaded for verification");
};
```

The code:
1. ✅ Uploads the file to Firebase Storage
2. ❌ **Does NOT call `ai.verifyIdCard()`** which exists in `services/ai.ts`
3. ✅ Sets status to `pending` (manual review path only)

**The Unused AI Function in `services/ai.ts`:**
```typescript
verifyIdCard: async (file: File): Promise<{ verified: boolean; confidence: number; reason: string }> => {
    // Uses Gemini 2.0 Flash to analyze:
    // - College Name
    // - Student Name  
    // - Photo presence
    // Returns verified: true if confidence > 0.85
}
```

### Can Users Bypass Verification via API?

**No direct API bypass.** The front-end is the only path. However:

| Attack Vector | Risk |
|---------------|------|
| Upload any image file | 🔴 **Works** - Any file gets `pending` status |
| Skip upload entirely | 🟢 Safe - No verification without upload |
| Direct Firestore manipulation | 🟢 Safe - Rules prevent self-verification |

### Recommendations

```diff
- await db.updateProfile(profileUser.id, { is_verified: 'pending' });
+ const aiResult = await ai.verifyIdCard(file);
+ if (aiResult.verified) {
+     await db.updateProfile(profileUser.id, { is_verified: 'pending', ai_confidence: aiResult.confidence });
+ } else {
+     error(`ID Rejected: ${aiResult.reason}`);
+     return;
+ }
```

---

## 2. Reputation Gaming (Sybil Attack) 🟠

### Like System Analysis

**In `services/firestoreService.ts` (lines 1174-1205):**

```typescript
toggleLikePost: async (postId: string, userId: string) => {
    const likes = data.likes || [];
    const ownerId = data.user_id;

    if (likes.includes(userId)) {
        await updateDoc(postRef, { likes: arrayRemove(userId) });
    } else {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
        // Send notification if not owner
        if (ownerId && ownerId !== userId) { /* ... */ }
    }
}
```

| Security Check | Status | Evidence |
|----------------|--------|----------|
| **Can user upvote own content?** | ❓ **Partially** | Self-notification prevented but like still recorded |
| **Rate limiting?** | 🔴 **NONE** | No rate limit in code or Firestore rules |
| **Mutual upvote detection?** | 🔴 **NONE** | No check for A ↔ B upvote rings |

> [!WARNING]
> **Firestore Rules allow unlimited likes:**
> ```
> allow update: if isAuthenticated() && (
>     resource.data.user_id == request.auth.uid ||
>     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'comments_count'])
> );
> ```

### XP System Vulnerabilities

| Attack | XP Gain | Prevention |
|--------|---------|------------|
| Spam posts | **50 XP/post** | 🔴 None |
| Spam comments | **10 XP/comment** | 🔴 None |
| Create 100 posts | **5000 XP** | 🔴 None |

### Sybil Attack Scenario

1. **Attacker creates 2 accounts** (A & B)
2. A posts content, B likes all of A's posts
3. B posts content, A likes all of B's posts
4. Both farm XP via posts/comments
5. Both appear as "Level 50+ trusted members"

### Recommendations

1. **Prevent self-likes:**
```diff
+ if (userId === ownerId) return; // Block self-likes entirely
```

2. **Implement cooldowns and limits in Firestore Rules**

---

## 3. Data Privacy (ID Cards) 🟢

### Storage Rules Analysis

**In `storage.rules` (lines 51-56):**

```javascript
match /verification/{userId}/{allPaths=**} {
    allow write: if isAuthenticated() && request.auth.uid == userId;
    allow read: if isAuthenticated() && request.auth.uid == userId; 
}
```

| Security Check | Status |
|----------------|--------|
| **Anonymous access to `/verification/*`** | 🟢 **BLOCKED** |
| **Cross-user access** | 🟢 **BLOCKED** |
| **URL guessing attack** | 🟢 **BLOCKED** |

> [!TIP]
> **This is correctly implemented.** ID cards are properly protected.

---

## 4. Content Safety 🔴

### Text Filtering Analysis

**Searched for:** `filter`, `sanitize`, `profanity`, `block`, `malicious`, `spam`

**Result:** ❌ **NO RESULTS FOUND**

### Post Creation Flow

**In `pages/Community.tsx`:**
```typescript
const handleCreatePost = async (content: string, scope: 'global' | 'campus') => {
    const safePostData = {
        content: content.trim() ?? '',  // No sanitization!
    };
    const newPost = await db.createCommunityPost(safePostData);
}
```

| Content Type | Filtering | Status |
|--------------|-----------|--------|
| Profanity/Abuse | ❌ None | 🔴 Vulnerable |
| Malicious URLs | ❌ None | 🔴 Vulnerable |
| Phishing links | ❌ None | 🔴 Vulnerable |
| Spam patterns | ❌ None | 🔴 Vulnerable |

### Recommendations

1. **Implement client-side pre-filter:**
```typescript
import { Filter } from 'bad-words';
const filter = new Filter();

if (filter.isProfane(content)) {
    error("Please keep discussions respectful.");
    return;
}
```

2. **Add server-side Cloud Function with Google Natural Language API**

---

## 5. Additional Findings

### API Authentication Gap

**In `api/notifications/send-connection.ts`:**

```typescript
export default async function handler(req, res) {
    const { toId, fromId, senderName, type } = req.body;
    // No token verification!
}
```

> [!IMPORTANT]
> **API endpoints don't verify Firebase Auth tokens.** Anyone can trigger push notifications to any user.

---

## Summary Risk Matrix

| Vulnerability | Severity | Priority |
|---------------|----------|----------|
| No content filtering | 🔴 Critical | **P0** |
| ID verification bypass | 🔴 Critical | **P0** |
| No like rate limits | 🟠 High | **P1** |
| Unauthenticated API | 🟠 High | **P1** |
| XP farming | 🟡 Medium | **P2** |

---

## Recommended Launch Blockers

Before launching, you **MUST** address:

1. ✅ Integrate AI ID verification OR implement mandatory manual review queue
2. ✅ Add basic profanity filter to posts/comments
3. ✅ Add rate limits to like/post/comment actions
4. ✅ Add Firebase Auth token verification to API routes

---

*Report generated by Red Team Security Assessment*  
*AssignMate | Campus-Verified Peer Learning Platform*
