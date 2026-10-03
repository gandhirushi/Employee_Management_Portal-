# Employee Management System - Project Change History

| File | Changes Made | Feature |
| --- | --- | --- |
| `backend/prisma/schema.prisma` | Added `Role` enum and `role` column to `User` and `Employee` models | Role-Based Access Control |
| `backend/src/services/auth.service.js` | Embedded role in JWT payload; updated registration, login, and user retrieval | JWT Authentication & RBAC |
| `backend/src/middleware/auth.middleware.js` | Updated `requireAuth` to extract role; created `requireRole` middleware | Authorization |
| `backend/src/routes/employee.routes.js` | Protected endpoints using `requireRole`; added `/role` PATCH route | Authorization |
| `backend/src/services/employee.service.js` | Added `role` to response formatting; created `updateEmployeeRole` | Employee Management |
| `backend/src/controllers/employee.controller.js` | Created `changeRole` controller for Super Admins | Employee Management |
| `backend/src/middleware/error.middleware.js` | Implemented centralized error handling format | Error Handling |
| `backend/src/swagger.js` | Configured Swagger API documentation | API Documentation |
| `admin-panel/src/context/AuthContext.jsx` | Updated state to persist and expose user role | Frontend Authentication |
| `admin-panel/src/routes/ProtectedRoute.jsx` | Added role-based routing checks with `allowedRoles` | Frontend Authorization |
| `admin-panel/src/App.jsx` | Applied role restrictions to employee-related routes | Frontend Authorization |
| `admin-panel/src/components/Sidebar.jsx` | Conditionally rendered navigation links based on role | Frontend RBAC UI |
| `admin-panel/src/components/Navbar.jsx` | Displayed formatted logged-in user role dynamically | Frontend RBAC UI |
| `admin-panel/src/pages/Employees.jsx` | Hid "Add employee" button for unauthorized roles | Frontend RBAC UI |
| `admin-panel/src/components/EmployeeTable.jsx` | Added Role column; added Admin role dropdown; fixed column mapping | Frontend RBAC UI |
| `admin-panel/src/pages/EmployeeDetails.jsx` | Conditionally rendered Edit/Delete action buttons | Frontend RBAC UI |
| `admin-panel/src/api/client.js` | Added frontend API method to call role update endpoint | API Integration |
| `admin-panel/src/context/DataContext.jsx` | Created global `changeEmployeeRole` function and API wrapper | State Management |
| `backend/src/socket/socket.events.js` | Defined centralized Socket.IO event name constants | Real-Time Notifications |
| `backend/src/socket/socket.server.js` | Initialized Socket.IO server with JWT handshake auth, user & role room isolation, and emitter helpers | Real-Time Notifications |
| `backend/src/server.js` | Attached Socket.IO server to HTTP server | Real-Time Notifications |
| `backend/src/services/notification.service.js` | Added real-time event broadcasting to user and role rooms on create, read, and delete | Real-Time Notifications |
| `backend/src/services/leave.service.js` | Dispatched real-time notifications to Admins on leave application and to Employees on leave approval/rejection | Real-Time Notifications |
| `backend/src/services/employee.service.js` | Dispatched real-time notification to Employee when role is updated | Real-Time Notifications |
| `admin-panel/src/context/SocketContext.jsx` | Created persistent Socket.IO client, lifecycle management, event listener, and real-time toast integration | Real-Time Notifications |
| `admin-panel/src/context/DataContext.jsx` | Added real-time notification handlers (`addNotification`, read/delete sync) | Real-Time Notifications |
| `admin-panel/src/App.jsx` | Wrapped application context with `SocketProvider` | Real-Time Notifications |
| `backend/prisma/schema.prisma` | Added `googleId`, `authProvider`, `emailVerified` and made `passwordHash` nullable | Google OAuth & Database Migration |
| `backend/prisma/migrations/20260916120600_add_google_oauth_fields/migration.sql` | Applied migration for OAuth columns & unique index | Google OAuth & Database Migration |
| `backend/src/config/google.js` | Initialized Google OAuth client and token verification helper | Google OAuth Integration |
| `backend/src/services/email.service.js` | Created Nodemailer email service with "Welcome to York" HTML template and safe dispatch | Email Notifications |
| `backend/src/services/auth.service.js` | Implemented `googleAuthService` (user lookup, linking, creation, async welcome email, JWT); replaced hardcoded static employee fields, token expiration, and bcrypt salt rounds with dynamic parameters and environment-configurable defaults | Authentication & Authorization |
| `backend/src/controllers/auth.controller.js` | Created `googleAuth` controller and forwarded dynamic employee details from `req.body` | Authentication & Authorization |
| `backend/src/routes/auth.routes.js` | Exposed `POST /api/auth/google` route | API Endpoints |
| `admin-panel/src/main.jsx` | Configured `GoogleOAuthProvider` at root level | Frontend Google OAuth |
| `admin-panel/src/api/client.js` | Added `api.googleLogin` method | API Integration |
| `admin-panel/src/context/AuthContext.jsx` | Added `loginWithGoogle` state management and session persistence | Frontend Authentication |
| `admin-panel/src/components/GoogleAuthButton.jsx` | Created branded, responsive Google Sign-In button with loading/error states | Frontend UI |
| `admin-panel/src/pages/Login.jsx` | Integrated Google Sign-In button and onboarding/role redirection | Frontend Auth Pages |
| `admin-panel/src/pages/Signup.jsx` | Integrated Google Sign-Up button and onboarding/role redirection | Frontend Auth Pages |
| `backend/package.json` | Installed `express-rate-limit` dependency | Rate Limiting |
| `backend/src/middleware/rateLimiter.middleware.js` | Created centralized rate limiting middleware with tiered limiters (global, login, signup, password reset, authenticated API) and standardized 429 error handler | Rate Limiting |
| `backend/src/server.js` | Configured `trust proxy` and mounted `globalRateLimiter` safety net on `/api` | Rate Limiting |
| `backend/src/routes/auth.routes.js` | Applied `loginRateLimiter` (with `skipSuccessfulRequests`), `signupRateLimiter`, `passwordResetRateLimiter`, and `authenticatedApiRateLimiter` | Rate Limiting |
| `backend/src/routes/employee.routes.js` | Protected employee CRUD with `authenticatedApiRateLimiter` | Rate Limiting |
| `backend/src/routes/leave.routes.js` | Applied `authenticatedApiRateLimiter` across leave routes | Rate Limiting |
| `backend/src/routes/notification.routes.js` | Applied `authenticatedApiRateLimiter` across notification routes | Rate Limiting |
| `backend/src/routes/settings.routes.js` | Applied `authenticatedApiRateLimiter` across user settings routes | Rate Limiting |
| `backend/src/services/employee.service.js` | Updated `createEmployee` to atomically create User and Employee via `prisma.$transaction`, hash default password `Admin@123`, bypass onboarding (`isOnboarded: true`), validate email format, prevent duplicate email accounts, and link `Employee.userId` | Automatic User Account Creation |
| `backend/src/controllers/employee.controller.js` | Updated `postEmployee` to return both employee and user in response; updated `onboardEmployee` to use `createEmployeeRecordForUser` | Automatic User Account Creation |
| `backend/src/services/auth.service.js` | Added input validation to `changePassword` for optional password updates via Settings | Password Management |
| `admin-panel/src/context/DataContext.jsx` | Updated `createEmployee` to propagate API error messages to UI callers | Error Handling & State Management |
| `admin-panel/src/pages/AddEmployee.jsx` | Added try-catch and informative toast indicating user account creation with default password `Admin@123` | Frontend Employee Management |
| `backend/prisma/schema.prisma` | Added `Conversation` and `ChatMessage` models with relations to `User` and `Employee` | Real-Time Chat Feature |
| `backend/prisma/migrations/20260922141700_add_chat_models/migration.sql` | Created Prisma migration for `conversations` and `chat_messages` tables, foreign keys, and indexes | Real-Time Chat Feature |
| `backend/src/socket/socket.events.js` | Defined chat events (`chat:message_sent`, `chat:message_received`, `chat:messages_read`, `chat:typing`, `chat:stop_typing`) | Real-Time Chat Feature |
| `backend/src/socket/socket.server.js` | Added real-time typing listeners and isolated user room message dispatching | Real-Time Chat Feature |
| `backend/src/services/chat.service.js` | Implemented conversation management, auto-healing for legacy employee accounts, message pagination, unread tracking, and authorization | Real-Time Chat Feature |
| `backend/src/controllers/chat.controller.js` | Implemented chat controllers for conversations, messages, read receipts, and unread counts | Real-Time Chat Feature |
| `backend/src/routes/chat.routes.js` | Created protected `/api/chat` routes with `requireAuth`, role authorization, and rate limiting | Real-Time Chat Feature |
| `backend/src/server.js` | Mounted `/api/chat` routes | Real-Time Chat Feature |
| `backend/src/services/employee.service.js` | Included `userId` in `formatEmployee` response | Real-Time Chat Feature |
| `admin-panel/src/api/client.js` | Added API methods for chat conversations, messages, read status, and unread count | Real-Time Chat Feature |
| `admin-panel/src/context/ChatContext.jsx` | Created global Chat state provider with active conversation, socket listener, optimistic messaging, and unread counters | Real-Time Chat Feature |
| `admin-panel/src/components/chat/FloatingChatBox.jsx` | Created floating bottom-right chat widget supporting minimized and expanded states | Real-Time Chat Feature |
| `admin-panel/src/components/chat/ChatHeader.jsx` | Created chat header with employee avatar, position/department, minimize, and close buttons | Real-Time Chat Feature |
| `admin-panel/src/components/chat/MessageList.jsx` | Created scrollable message list with sent/received bubble differentiation, timestamps, date dividers, and read receipts | Real-Time Chat Feature |
| `admin-panel/src/components/chat/ChatInput.jsx` | Created message input with Enter-to-send keyboard shortcut and typing indicator triggers | Real-Time Chat Feature |
| `admin-panel/src/components/EmployeeTable.jsx` | Made employee cell and added Chat button in action column to trigger real-time chat for authorized roles | Real-Time Chat Feature |
| `admin-panel/src/layouts/AdminLayout.jsx` | Mounted `FloatingChatBox` in layout for persistent availability across dashboard navigation | Real-Time Chat Feature |
| `admin-panel/src/App.jsx` | Wrapped application context with `ChatProvider` | Real-Time Chat Feature |
| `admin-panel/src/index.css` | Styled floating chat widget, bubbles, timestamps, unread badges, animations, and dark mode support | Real-Time Chat Feature |
| `admin-panel/src/components/Navbar.jsx` | Added Chat icon with dynamic real-time unread badge and toggleable ChatDropdown | Navbar Chat Feature |
| `admin-panel/src/components/chat/ChatDropdown.jsx` | Created ChatDropdown displaying active and previous conversations, unread badges, and quick-reply navigation | Navbar Chat Feature |
| `admin-panel/src/context/ChatContext.jsx` | Enhanced ChatContext with `conversations` list, `openConversation`, `fetchConversations`, and real-time badge updates | Navbar Chat Feature |
| `backend/src/services/chat.service.js` | Updated `getUserConversations` with `resolveTargetUserProfile` for accurate Admin/Manager and employee profiles | Navbar Chat Feature |
| `admin-panel/src/index.css` | Added styling for `.chat-dropdown`, conversation items, unread highlights, and role pills | Navbar Chat Feature |
| `backend/prisma/schema.prisma` | Consolidated chat schema into a single `ChatMessage` table; dropped redundant `Conversation` model and duplicate relationships | Single Table Chat Refactor |
| `backend/prisma/migrations/20260928120000_single_table_chat_refactor/migration.sql` | Executed migration removing `conversations` table and `conversationId` column, adding direct message composite indexes | Single Table Chat Refactor |
| `backend/src/services/chat.service.js` | Refactored all conversation listing, initiation, pagination, and messaging logic to use the centralized single table with canonical IDs | Single Table Chat Refactor |
| `admin-panel/src/context/ChatContext.jsx` | Updated target employee profile mapping to consistently bind target user ID for socket routing and optimistic delivery | Single Table Chat Refactor |
| `backend/package.json` | Installed `ioredis` and `compression` dependencies | Redis Caching & Performance |
| `backend/.env` | Configured Redis Cloud connection parameters (`REDIS_ENABLED`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`) | Redis Caching & Performance |
| `backend/src/config/redis.js` | Created centralized Redis client configuration with auto-reconnection backoff, ready checks, and graceful DB fallback | Redis Caching & Performance |
| `backend/src/utils/cacheKeys.js` | Built centralized cache key builders, deterministic query hashing, and invalidation pattern utilities | Redis Caching & Performance |
| `backend/src/utils/cacheMetrics.js` | Created cache metrics tracker monitoring hits, misses, hit ratio, response time savings, and Redis errors | Redis Caching & Performance |
| `backend/src/services/cache.service.js` | Implemented Cache-Aside pattern, `getOrSet`, atomic `SCAN`-based `delByPattern` eviction, and graceful degradation | Redis Caching & Performance |
| `backend/src/middleware/cache.middleware.js` | Implemented HTTP route caching middleware injecting `X-Cache: HIT/MISS` and `X-Response-Time` headers | Redis Caching & Performance |
| `backend/src/server.js` | Mounted `compression` middleware, added `/api/cache/metrics` & `/api/cache/flush` routes, initialized Redis, and registered graceful shutdown hooks | Redis Caching & Performance |
| `backend/src/services/employee.service.js` | Integrated caching on `getDashboardStats`, `getEmployeeById`, and `getEmployees`; automated cache invalidation on create, update, delete, photo, and role changes | Redis Caching & Performance |
| `backend/src/services/settings.service.js` | Cached `getSettings` with 1h TTL; invalidated cache immediately on `updateSettings` | Redis Caching & Performance |
| `backend/src/services/auth.service.js` | Cached sanitized `getUserById` for `/api/auth/me`; invalidated cache on profile and photo changes | Redis Caching & Performance |
| `backend/src/services/leave.service.js` | Optimized search filtering down to PostgreSQL query; cached `getAllLeaveApplications` and `getMyLeaveApplications`; invalidated on apply and status updates | Redis Caching & Performance |
| `backend/prisma/schema.prisma` | Added performance indexes: `User(role)`, `Employee(department, status, createdAt)`, `Leave(status, createdAt)` | Database Performance |
| `backend/prisma/migrations/20260930123500_add_performance_indexes/migration.sql` | Created Prisma migration SQL script for new database performance indexes | Database Performance |
| `admin-panel/src/api/client.js` | Implemented in-flight request deduplication and 15s client-side cache for GET requests, auto-invalidating on mutations | Frontend Performance |
| `admin-panel/src/App.jsx` | Added route-level code splitting using `React.lazy` and `Suspense` for dashboard, employee, leave, and settings views | Frontend Performance |



