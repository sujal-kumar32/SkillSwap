# MongoDB Index Audit Report

## Collections Analyzed: 24

---

## Existing Indexes

### `users`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `email_1` | `email` | unique field |
| `name_1` | `name` | schema.index |
| `blockedUsers_1` | `blockedUsers` | schema.index |

### `notifications`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `recipient_1_createdAt_-1` | `recipient` (asc), `createdAt` (desc) | schema.index |
| `recipient_1_read_1` | `recipient` (asc), `read` (asc) | schema.index |

### `sessions`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `title_text_description_text` | `title`, `description` | text index |

### `requests`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `reviews`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `payments`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `follows`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `follower_1_following_1` | `follower` (asc), `following` (asc) | unique compound |
| `following_1_createdAt_-1` | `following` (asc), `createdAt` (desc) | schema.index |

### `chats`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `participants_1` | `participants` | schema.index |
| `lastMessage.createdAt_-1` | `lastMessage.createdAt` (desc) | schema.index |
| `requestId_1` | `requestId` | schema.index |
| `updatedAt_-1` | `updatedAt` (desc) | schema.index |

### `disputes`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `requestId_1` | `requestId` | schema.index |
| `raisedBy_1` | `raisedBy` | schema.index |
| `status_1` | `status` | schema.index |

### `skills`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `categories`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `name_1` | `name` | unique field |
| `slug_1` | `slug` | unique field |

### `feeds`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `createdAt_-1` | `createdAt` (desc) | schema.index |
| `actor_1_createdAt_-1` | `actor` (asc), `createdAt` (desc) | schema.index |

### `mentorapplications`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `sessionmaterials`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `transactions`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| **NONE** | — | — |

### `availabilities`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `mentorId_1` | `mentorId` | unique field |

### `badges`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `key_1` | `key` | unique field |

### `calendartokens`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `userId_1` | `userId` | unique field |

### `wallets`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `userId_1` | `userId` | unique field |

### `refreshtokens`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `token_1` | `token` | field index |
| `expiresAt_1` | `expiresAt` | TTL index (expireAfterSeconds: 0) |

### `wishlists`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `userId_1_sessionId_1` | `userId` (asc), `sessionId` (asc) | unique compound |

### `broadcastmessages`
| Index | Fields | Type |
|-------|--------|------|
| `_id_` | `_id` | default primary |
| `senderId_1_createdAt_-1` | `senderId` (asc), `createdAt` (desc) | schema.index |

### `settings`, `xptransactions`
- `settings`: only `_id_` (singleton collection — acceptable)
- `xptransactions`: `_id_` + `userId_1`

---

## Missing Index Recommendations

### HIGH PRIORITY — Collections with Zero Indexes

#### 1. `requests` (HEAVIEST QUERY LOAD — zero indexes)

**Status: CRITICAL** — This is the most queried collection with the most complex filters, yet has zero secondary indexes. Every query does a full collection scan.

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ learnerId: 1, createdAt: -1 }` | `Request.find({ learnerId }).sort({ createdAt: -1 }).populate(...).skip(skip).limit(limit)` | Learner request listing (used in requestController.js:158, countDocuments at 173) |
| 2 | `{ mentorId: 1, createdAt: -1 }` | `Request.find({ mentorId }).sort({ createdAt: -1 }).populate(...).skip(skip).limit(limit)` | Mentor request listing (requestController.js:195, countDocuments at 204) |
| 3 | `{ sessionId: 1, requestStatus: 1 }` | `Request.find({ sessionId, requestStatus: { $in: ["pending","accepted"] } })` | Session capacity checks (sessionController.js:394,423,496 — called 3× per rendering) |
| 4 | `{ mentorId: 1, requestStatus: 1 }` | `Request.find({ mentorId, requestStatus: { $in: ["accepted","completed"] } }).sort({ updatedAt: -1 })` | Mentor active/completed sessions (requestController.js:229) |
| 5 | `{ learnerId: 1, requestStatus: 1 }` | `Request.countDocuments({ learnerId, requestStatus: "completed" })` | XP service queries (xpService.js:21) |

#### 2. `reviews` (zero indexes)

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ sessionId: 1, learnerId: 1 }` (unique) | `Review.findOne({ sessionId, learnerId })` | Review dedup check (reviewController.js:82) — prevents duplicate reviews |
| 2 | `{ mentorId: 1, createdAt: -1 }` | `Review.find({ mentorId }).sort(sortObj).skip(skip).limit(limit)` | Mentor review listing (reviewController.js:45, profileController.js:318) |
| 3 | `{ sessionId: 1 }` | `Review.aggregate([{ $match: { sessionId: { $in: sessionIds } } }, { $group: ... }])` | Session avg rating (sessionController.js:127,209 — called 2× per page load) |

#### 3. `payments` (zero indexes)

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ requestId: 1, paymentStatus: 1 }` | `Payment.findOne({ requestId, paymentStatus: { $ne: "success" } })` | Payment status checks (paymentController.js:71,124,209, disputeController.js:168) |
| 2 | `{ orderId: 1 }` | `Payment.findOne({ requestId, orderId })` | Order reference lookup (paymentController.js:124) |
| 3 | `{ paymentStatus: 1, createdAt: 1 }` | `Payment.aggregate([{ $match: { paymentStatus: "success", createdAt: { $gte: ... } } }, { $group: ... }])` | Revenue analytics (adminAnalyticsController.js:57,103,133) |

#### 4. `skills` (zero indexes)

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ categoryId: 1 }` | `Skill.find({ categoryId }).lean()` | Category skill listing (skillController.js:28) |

#### 5. `mentorapplications` (zero indexes)

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ userId: 1, status: 1 }` | `MentorApplication.findOne({ userId, status: "blocked" })` | Check blocked mentor (mentorApplicationController.js:37) |
| 2 | `{ status: 1, createdAt: -1 }` | `MentorApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)` | Admin application listing (mentorApplicationController.js:130) |

#### 6. `sessionmaterials` (zero indexes)

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ sessionId: 1, createdAt: -1 }` | `SessionMaterial.find({ sessionId }).sort({ createdAt: -1 })` | Session material listing (sessionMaterialController.js:28) |

### MEDIUM PRIORITY — Collections with partial indexes

#### 7. `sessions`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ mentorId: 1, status: 1, date: 1 }` | `Session.find({ mentorId, date: { $gte, $lte }, status: "active" })` | Mentor availability sessions (availabilityController.js:52) |
| 2 | `{ status: 1 }` | `Session.find({ status: "active" }).sort(sortObj).skip(skip).limit(limit)` | Browse sessions (sessionController.js:196), countDocuments (203) |
| 3 | `{ categoryId: 1, status: 1 }` | `Session.find({ status: "active", categoryId }).sort(sortObj)` | Category-based session browsing (sessionController.js:196) |

#### 8. `users`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ status: 1, roles: 1 }` | `User.find({ roles, status: "active" }).select("_id")` | Broadcast target lists (adminController.js:18-27), sidebar counts |
| 2 | `{ roles: 1 }` | `User.find({ role: "mentor" })` | Get mentors (mentor controller) |

#### 9. `disputes`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ requestId: 1, raisedBy: 1, status: 1 }` | `Dispute.findOne({ requestId, raisedBy, status: { $in: ["open","under_review"] } })` | Existing dispute check (disputeController.js:32) |

#### 10. `notifications`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ broadcastRef: 1 }` | `Notification.deleteMany({ broadcastRef })` | Broadcast edit cleanup (adminController.js:114,134) |

#### 11. `refreshtokens`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ userId: 1 }` | `RefreshToken.deleteMany({ userId })` | User logout all / cleanup (authController.js:478, userModel.js:103) |

### LOW PRIORITY

#### 12. `chats`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ participants: 1, updatedAt: -1 }` | `Chat.find({ participants }).sort({ updatedAt: -1 })` | Chat listing (chatController.js:159) — replaces two separate indexes |

#### 13. `wishlists`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ sessionId: 1 }` | `Wishlist.deleteMany({ sessionId })` | Session cleanup (sessionController.js:525) |

#### 14. `skills`

| # | Field(s) | Example Query | Benefit |
|---|----------|---------------|---------|
| 1 | `{ status: 1 }` | `Skill.countDocuments({ status: "pending" })` | Sidebar pending count (sidebarController.js) |

---

## Duplicate or Redundant Indexes

### 1. `chats` — `{ lastMessage.createdAt: -1 }` and `{ updatedAt: -1 }`
Both are sort-only indexes. The query `sort({ "lastMessage.createdAt": -1, updatedAt: -1 })` cannot use either efficiently; it would need a compound `{ lastMessage.createdAt: -1, updatedAt: -1 }`. However, they may each be used independently by different code paths. **Not strictly redundant**, but the compound index would be more useful.

### 2. `feeds` — `{ createdAt: -1 }` and `{ actor: 1, createdAt: -1 }`
The compound `{ actor: 1, createdAt: -1 }` can serve queries that filter by `actor` AND sort by `createdAt` — but it CANNOT serve queries that only sort by `createdAt` (no filter). The `{ createdAt: -1 }` standalone index is needed for the unfiltered feed. **Not redundant** — both are needed.

### 3. No truly redundant indexes detected
All defined indexes serve distinct query patterns. Some collections would benefit from compound indexes replacing multiple single-field indexes (noted above), but no existing index can be safely removed.

---

## Code Changes Required

### `server/apis/Request/requestModel.js`
```js
// Add these indexes
requestSchema.index({ learnerId: 1, createdAt: -1 });
requestSchema.index({ mentorId: 1, createdAt: -1 });
requestSchema.index({ sessionId: 1, requestStatus: 1 });
requestSchema.index({ mentorId: 1, requestStatus: 1 });
requestSchema.index({ learnerId: 1, requestStatus: 1 });
```

### `server/apis/Reviews/reviewModel.js`
```js
// Replace no-index with:
reviewSchema.index({ sessionId: 1, learnerId: 1 }, { unique: true });
reviewSchema.index({ mentorId: 1, createdAt: -1 });
reviewSchema.index({ sessionId: 1 });
```

### `server/apis/Payment/paymentModel.js`
```js
// Add these indexes
paymentSchema.index({ requestId: 1, paymentStatus: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ paymentStatus: 1, createdAt: 1 });
// Optional for admin/user payment listing:
paymentSchema.index({ learnerId: 1 });
paymentSchema.index({ mentorId: 1 });
```

### `server/apis/Skills/skillModel.js`
```js
// Add these indexes
skillSchema.index({ categoryId: 1 });
skillSchema.index({ status: 1 });
```

### `server/apis/MentorApplication/mentorApplicationModel.js`
```js
// Add these indexes
mentorApplicationSchema.index({ userId: 1, status: 1 });
mentorApplicationSchema.index({ status: 1, createdAt: -1 });
```

### `server/apis/SessionMaterial/sessionMaterialModel.js`
```js
// Add these indexes
sessionMaterialSchema.index({ sessionId: 1, createdAt: -1 });
```

### `server/apis/Session/sessionModel.js`
```js
// Add these indexes (keep existing text index)
sessionSchema.index({ mentorId: 1, status: 1, date: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ categoryId: 1, status: 1 });
```

### `server/apis/Users/userModel.js`
```js
// Add these indexes (keep existing)
userSchema.index({ status: 1, roles: 1 });
userSchema.index({ roles: 1 });
// Optional: text index for search
// userSchema.index({ name: "text", email: "text" });
```

### `server/apis/Dispute/disputeModel.js`
```js
// Add this compound index (keep existing single-field indexes)
disputeSchema.index({ requestId: 1, raisedBy: 1, status: 1 });
```

### `server/apis/Notification/notificationModel.js`
```js
// Add this index (keep existing two)
notificationSchema.index({ broadcastRef: 1 });
```

### `server/models/RefreshToken.js`
```js
// Add this index (keep existing token + expiresAt indexes)
refreshTokenSchema.index({ userId: 1 });
```

### `server/apis/Wishlist/wishlistModel.js`
```js
// Add this index (keep existing unique compound)
wishlistSchema.index({ sessionId: 1 });
```

### `server/apis/Chat/chatModel.js`
```js
// Replace { lastMessage.createdAt: -1 } and { updatedAt: -1 } with:
chatSchema.index({ participants: 1, updatedAt: -1 });
// Or just add it alongside; the compound is more efficient for the main listing query.
```

### `server/apis/Categories/categoryModel.js`
```js
// Add this index (keep existing unique name/slug)
categorySchema.index({ status: 1 });
```

---

## Summary

| Metric | Count |
|--------|-------|
| **Total collections analyzed** | **24** |
| **Current secondary indexes** (excluding `_id_`) | **23** across 16 collections |
| **Collections with zero secondary indexes** | **8** (requests, reviews, payments, skills, mentorapplications, sessionmaterials, transactions, settings) |
| **Recommended new indexes** | **26** |
| **Redundant indexes found** | **0** |
| **Indexes to remove** | **0** |

### Collections needing indexes (sorted by criticality):

| Collection | Current | Recommended | Impact |
|-----------|---------|-------------|--------|
| `requests` | 0 | 5 | **CRITICAL** — Full collection scans on every page load |
| `reviews` | 0 | 3 | **HIGH** — Full scans on profile/page loads |
| `payments` | 0 | 3-5 | **HIGH** — Analytics aggregations are slow |
| `skills` | 0 | 2 | **MEDIUM** — Category listing queries |
| `mentorapplications` | 0 | 2 | **MEDIUM** — Admin filtering |
| `sessionmaterials` | 0 | 1 | **MEDIUM** — Session material listing |
| `sessions` | 1 (text) | 3 | **MEDIUM** — Browse + availability queries |
| `users` | 3 | 2 | **LOW** — Broadcast and role lookups |
| `disputes` | 3 | 1 (compound) | **LOW** — Existing check |
| `notifications` | 2 | 1 | **LOW** — Broadcast cleanup |
| `refreshtokens` | 2 | 1 | **LOW** — User cleanup |

### Worst Offender
**`requests`** — 15+ unique query patterns, 0 secondary indexes. Every `find()`, `countDocuments()`, `aggregate()` triggers a full collection scan. Adding the 5 recommended indexes would reduce query time from O(n) to O(log n) for the most heavily used API endpoints in the application (request listing, session booking, dashboard, sidebar counts).

### Estimated Performance Impact

| Query Pattern | Before | After (with indexes) |
|--------------|--------|---------------------|
| `Request.find({ learnerId }).sort({ createdAt: -1 }).skip(20).limit(10)` | Full scan of 10K+ docs → ~50-200ms | Index scan → **~1-3ms** |
| `Request.find({ sessionId, requestStatus })` | Full scan → ~20-100ms | Index scan → **~0.5-1ms** |
| `Review.findOne({ sessionId, learnerId })` | Full scan → ~10-50ms | Unique index lookup → **~0.1ms** |
| `Payment.aggregate([$match: { paymentStatus, createdAt }])` | Full scan entire collection → ~100-500ms | Index scan → **~2-10ms** |
| `Skill.find({ categoryId })` | Full scan → ~10-50ms | Index scan → **~0.5-1ms** |
| `Session.find({ mentorId, date, status })` | Full scan → ~20-100ms | Compound index → **~0.5-2ms** |

### Final Optimized Index Strategy

The recommended 26 new indexes plus the 23 existing ones bring the total to **49 indexes across 24 collections**. This is appropriate for an application of this size with diverse query patterns. No existing indexes should be removed — each serves a distinct query pattern.
