# Firebase to MySQL Migration Guide

## Overview
Your project has been successfully migrated from Firebase to MySQL. Here's what has been completed and what patterns to follow for the remaining files.

## Completed Tasks

### ✅ 1. Database Setup
- **MySQL Schema Created** in `shared/schema.ts`
  - Tables: users, snippets, notes, checklists, projects, folders, tags, premium_requests
  - All using Drizzle ORM for MySQL
  
- **Database Configuration** in `drizzle.config.ts`
  - Connected to your MySQL database at sv63.ifastnet12.org

- **Database Connection** in `server/db.ts`
  - MySQL connection pool configured

### ✅ 2. Backend (Server)
- **Storage Layer** in `server/storage.ts`
  - Complete CRUD operations for all entities
  - Password hashing with bcrypt
  - ID generation with nanoid

- **API Routes** in `server/routes.ts`
  - JWT-based authentication
  - RESTful API endpoints for all resources
  - Middleware for authentication

### ✅ 3. Frontend Core
- **API Client** in `client/src/lib/api.ts`
  - Helper functions for all API calls
  - Token management in localStorage

- **Auth Module** in `client/src/lib/auth.ts`
  - Replaced Firebase Auth with custom auth
  - JWT token-based authentication

- **App Component** in `client/src/App.tsx`
  - Removed Firebase imports
  - Updated to use new API

- **Example Migration** in `client/src/pages/Home.tsx`
  - Shows the pattern for migrating Firebase calls

## Migration Patterns

### Pattern 1: Replace Firebase Firestore Queries

**OLD (Firebase):**
\`\`\`typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const q = query(
  collection(db, 'snippets'),
  where('userId', '==', user.uid)
);
const querySnapshot = await getDocs(q);
const items = querySnapshot.docs.map(doc => ({ 
  id: doc.id,
  ...doc.data()
}));
\`\`\`

**NEW (MySQL API):**
\`\`\`typescript
import { snippetAPI } from '@/lib/api';

const items = await snippetAPI.getAll();
\`\`\`

### Pattern 2: Replace Firebase Document Operations

**OLD (Firebase):**
\`\`\`typescript
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Get
const docRef = doc(db, 'snippets', id);
const docSnap = await getDoc(docRef);
const item = { id: docSnap.id, ...docSnap.data() };

// Update
await updateDoc(doc(db, 'snippets', id), { title: 'New Title' });

// Delete
await deleteDoc(doc(db, 'snippets', id));
\`\`\`

**NEW (MySQL API):**
\`\`\`typescript
import { snippetAPI } from '@/lib/api';

// Get
const item = await snippetAPI.getById(id);

// Update
await snippetAPI.update(id, { title: 'New Title' });

// Delete
await snippetAPI.delete(id);
\`\`\`

### Pattern 3: Replace Firebase Create Operations

**OLD (Firebase):**
\`\`\`typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const docRef = await addDoc(collection(db, 'snippets'), {
  title: 'New Snippet',
  content: 'Code here',
  userId: user.uid,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
\`\`\`

**NEW (MySQL API):**
\`\`\`typescript
import { snippetAPI } from '@/lib/api';

const newSnippet = await snippetAPI.create({
  title: 'New Snippet',
  content: 'Code here',
  language: 'javascript',
  tags: []
});
// Note: userId, createdAt, updatedAt are automatically added by the server
\`\`\`

### Pattern 4: Replace User ID References

**OLD (Firebase):**
\`\`\`typescript
user.uid
\`\`\`

**NEW (MySQL):**
\`\`\`typescript
user.id
\`\`\`

### Pattern 5: Replace Firebase Storage

**OLD (Firebase Storage):**
\`\`\`typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const storageRef = ref(storage, \`avatars/\${user.uid}\`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
\`\`\`

**NEW (Options):**
1. **Use server-side file upload** - Create a file upload endpoint
2. **Use a different storage service** - AWS S3, Cloudinary, etc.
3. **Store files in MySQL** - As BLOB (not recommended for large files)

## Files That Need Migration

### Pages (Priority Order)
1. ✅ `client/src/pages/Home.tsx` - DONE (example)
2. ⚠️ `client/src/pages/Projects.tsx` - Use `projectAPI`
3. ⚠️ `client/src/pages/Settings.tsx` - Use `userAPI`, `snippetAPI`, `noteAPI`, `checklistAPI`
4. ⚠️ `client/src/pages/Profile.tsx` - Use `userAPI` + handle file uploads differently
5. ⚠️ `client/src/pages/SnippetDetail.tsx` - Use `snippetAPI`
6. ⚠️ `client/src/pages/NoteDetail.tsx` - Use `noteAPI`
7. ⚠️ `client/src/pages/ChecklistDetail.tsx` - Use `checklistAPI`
8. ⚠️ `client/src/pages/TagDetail.tsx` - Use `snippetAPI`, `noteAPI`, `checklistAPI` with tag filtering
9. ⚠️ `client/src/pages/Search.tsx` - Use `searchAPI`
10. ⚠️ `client/src/pages/AdminDashboard.tsx` - Use `userAPI`, `premiumRequestAPI`
11. ⚠️ `client/src/pages/MobileAdminDashboard.tsx` - Same as AdminDashboard
12. ⚠️ `client/src/pages/UserDetail.tsx` - Use `userAPI`

### Components
1. ⚠️ `client/src/components/layout/Sidebar.tsx` - Use `folderAPI`, `projectAPI`
2. ⚠️ `client/src/components/layout/FolderContent.tsx` - Use `snippetAPI.getByFolder()`, etc.
3. ⚠️ `client/src/components/layout/ProjectContent.tsx` - Use `snippetAPI.getByProject()`, etc.
4. ⚠️ `client/src/components/snippet/SnippetCard.tsx` - Use `snippetAPI.delete()`
5. ⚠️ `client/src/components/note/NoteCard.tsx` - Use `noteAPI.delete()`
6. ⚠️ `client/src/components/checklist/ChecklistCard.tsx` - Use `checklistAPI`
7. ⚠️ `client/src/components/ai/AIBar.tsx` - Use `snippetAPI.create()`
8. ⚠️ `client/src/components/admin/PremiumRequestsManager.tsx` - Use `premiumRequestAPI`
9. ⚠️ `client/src/components/dialogs/CreateItemDialog.tsx` - Use appropriate APIs
10. ⚠️ `client/src/components/dialogs/EditItemDialog.tsx` - Use appropriate APIs
11. ⚠️ `client/src/components/dialogs/PremiumRequestDialog.tsx` - Use `premiumRequestAPI`

### Hooks
1. ⚠️ `client/src/hooks/use-theme.ts` - Use `userAPI.update()`
2. ⚠️ `client/src/hooks/use-font-size.ts` - Use `userAPI.update()`
3. ⚠️ `client/src/hooks/use-user-role.ts` - Use `userAPI.getById()`

## Quick Reference: API Methods

### Authentication
\`\`\`typescript
authAPI.signup(email, password)
authAPI.signin(email, password)
authAPI.me()
\`\`\`

### Users
\`\`\`typescript
userAPI.getAll()
userAPI.getById(id)
userAPI.update(id, data)
userAPI.delete(id)
\`\`\`

### Snippets
\`\`\`typescript
snippetAPI.getAll()
snippetAPI.getById(id)
snippetAPI.getByFolder(folderId)
snippetAPI.getByProject(projectId)
snippetAPI.create(data)
snippetAPI.update(id, data)
snippetAPI.delete(id)
\`\`\`

### Notes
\`\`\`typescript
noteAPI.getAll()
noteAPI.getById(id)
noteAPI.getByFolder(folderId)
noteAPI.getByProject(projectId)
noteAPI.create(data)
noteAPI.update(id, data)
noteAPI.delete(id)
\`\`\`

### Checklists
\`\`\`typescript
checklistAPI.getAll()
checklistAPI.getById(id)
checklistAPI.getByFolder(folderId)
checklistAPI.getByProject(projectId)
checklistAPI.create(data)
checklistAPI.update(id, data)
checklistAPI.delete(id)
\`\`\`

### Projects
\`\`\`typescript
projectAPI.getAll()
projectAPI.getById(id)
projectAPI.create(data)
projectAPI.update(id, data)
projectAPI.delete(id)
\`\`\`

### Folders
\`\`\`typescript
folderAPI.getAll()
folderAPI.getById(id)
folderAPI.create(data)
folderAPI.delete(id)
\`\`\`

### Tags
\`\`\`typescript
tagAPI.getAll()
tagAPI.create(data)
tagAPI.delete(id)
\`\`\`

### Premium Requests
\`\`\`typescript
premiumRequestAPI.getAll()
premiumRequestAPI.create(data)
premiumRequestAPI.update(id, data)
premiumRequestAPI.delete(id)
\`\`\`

### Search
\`\`\`typescript
searchAPI.search(query)
// Returns: { snippets: [], notes: [], checklists: [] }
\`\`\`

## Testing the Migration

1. **Start the server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Test authentication:**
   - Sign up a new user
   - Sign in with existing credentials
   - Check that JWT token is stored in localStorage

3. **Test data operations:**
   - Create a snippet/note/checklist
   - Update items
   - Delete items
   - Search functionality

4. **Test admin features:**
   - Make a user admin by updating the database directly
   - Test premium request management

## Common Issues and Solutions

### Issue: "Authentication required" errors
**Solution:** Make sure the JWT token is being sent in the Authorization header. Check `client/src/lib/api.ts`.

### Issue: CORS errors
**Solution:** The server should be on the same domain/port in development. Make sure you're running on port 5001.

### Issue: User ID mismatch
**Solution:** Remember to change `user.uid` to `user.id` everywhere.

### Issue: serverTimestamp() not working
**Solution:** Timestamps are now handled server-side automatically. Remove all `serverTimestamp()` calls.

### Issue: Real-time updates not working
**Solution:** Firebase's real-time listeners are no longer available. You'll need to:
- Use `refetchOnMount: true` in React Query
- Manually invalidate queries after mutations
- Consider implementing WebSocket for real-time features if needed

## Next Steps

1. **Systematically update each file** following the patterns above
2. **Test each page** after migration
3. **Remove Firebase package** after all migrations:
   \`\`\`bash
   npm uninstall firebase
   \`\`\`
4. **Remove** `client/src/lib/firebase.ts`

## Notes

- All database operations now go through REST API endpoints
- Authentication uses JWT tokens instead of Firebase Auth
- File uploads need a new solution (Firebase Storage replacement)
- No more real-time listeners - use polling or WebSockets if needed
- Server handles timestamps and ID generation automatically

Good luck with your migration! 🚀
