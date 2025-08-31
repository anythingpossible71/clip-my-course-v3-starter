# Production Starter Template - Project Guide

## Overview

This is a production-ready Next.js starter template with authentication, admin dashboard, and role-based access control. The application uses TypeScript, Tailwind CSS, Prisma ORM with SQLite, and shadcn/ui components.

## Project Structure

```
prod-starter-template/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   │   └── admin.ts         # Admin-related server actions
│   ├── admin/               # Admin dashboard pages
│   │   ├── layout.tsx       # Admin layout with sidebar
│   │   ├── page.tsx         # Dashboard home
│   │   ├── users/           # User management
│   │   ├── roles/           # Role management
│   │   ├── database/        # Database viewer
│   │   └── settings/        # Admin settings
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── admin/          # Admin API endpoints
│   ├── auth/               # Authentication pages
│   │   ├── signin/         # Sign in page
│   │   ├── signup/         # Sign up page
│   │   └── setup-admin/    # First-time admin setup
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Authentication components
│   │   ├── SignInForm.tsx  # Sign in form (email/password + magic link)
│   │   └── SignUpForm.tsx  # Sign up form
│   └── admin/              # Admin components
│       ├── UserManagementPanel.tsx  # User list and management
│       ├── RoleManagementPanel.tsx  # Role management
│       └── DatabaseViewerPanel.tsx  # Database table viewer
├── db/                      # Database files
│   └── prod.db             # SQLite database (gitignored)
├── lib/                     # Utility functions
│   ├── auth/               # Authentication utilities
│   │   ├── auth.ts         # Core auth functions
│   │   └── permissions.ts  # Role and permission checks
│   ├── prisma.ts           # Centralized Prisma client
│   └── utils.ts            # General utilities
└── prisma/                  # Prisma configuration
    ├── schema.prisma       # Database schema
    ├── seed.ts             # Database seeding
    └── migrations/         # Database migrations
```

## Database Models

### User Model

```prisma
model User {
  id             Int       @id @default(autoincrement())
  created_at     DateTime  @default(now())
  updated_at     DateTime  @updatedAt
  deleted_at     DateTime?

  email          String    @unique
  password       String?   // Optional for magic link users
  last_signed_in DateTime?

  profile        UserProfile?
  roles          UserRole[]
}
```

### UserProfile Model

```prisma
model UserProfile {
  id         Int       @id @default(autoincrement())
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  user_id    Int       @unique
  first_name String?
  last_name  String?

  user       User      @relation(fields: [user_id], references: [id])
}
```

### Role Model

```prisma
model Role {
  id         Int       @id @default(autoincrement())
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  name       String    @unique

  users      UserRole[]
}
```

### UserRole Model (Many-to-Many)

```prisma
model UserRole {
  id         Int       @id @default(autoincrement())
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  deleted_at DateTime?

  user_id    Int
  role_id    Int

  user       User      @relation(fields: [user_id], references: [id])
  role       Role      @relation(fields: [role_id], references: [id])

  @@unique([user_id, role_id])
}
```

### Important Database Patterns

- All models include `created_at`, `updated_at`, and `deleted_at` (soft delete)
- Use soft deletes by setting `deleted_at` instead of hard deleting records
- Always filter by `deleted_at: null` when querying active records

## Authentication System

### Core Functions (lib/auth/auth.ts)

- `hashPassword(password)` - Hash passwords with bcrypt (10 salt rounds)
- `verifyPassword(password, hash)` - Verify password against hash
- `createSession(userId)` - Create user session with HTTP-only cookie (userId is number)
- `getSession(token?)` - Get current session from cookie or token
- `clearSession()` - Clear session cookie

### Token Functions (lib/auth/token.ts)

- `generateToken(userId, type)` - Generate JWT tokens (userId is number)
- `verifyToken(token)` - Verify and decode JWT tokens (returns {userId: number, type: string})
- **Token Types**: access (7d), verification (1d), reset (1h), magic_link (1d)

### Permission Functions (lib/auth/permissions.ts)

- `hasRole(userId, roleName)` - Check if user has specific role (userId is number)
- `requireRole(roleName)` - Server action that redirects if role missing
- `isAdmin(userId)` - Check if user is admin (userId is number)
- `getCurrentUser()` - Get current user with profile and roles
- `checkAdminExists()` - Check if any admin user exists

### Complete Authentication Flows

#### First-Time Setup Flow

1. **Admin Check**: `checkAdminExists()` on every page load
2. **No Admin Found**: Redirect to `/auth/setup-admin`
3. **Admin Creation**: Create first admin account with profile and admin role
4. **System Ready**: Application becomes fully functional
5. **Protection**: Once admin exists, `/auth/setup-admin` redirects to home page

#### Sign-Up Flow

1. **Registration**: `/auth/signup` with email/password
2. **Verification Token**: Generate 24-hour verification token
3. **Email Sent**: Verification email to console (dev) or email provider
4. **Email Verification**: `/auth/verify-email?token=...` validates and activates account
5. **Account Active**: User can now sign in

#### Sign-In Flows

**Email/Password**:

1. **Credentials**: User enters email/password at `/auth/signin`
2. **Verification**: `verifyPassword()` against bcrypt hash
3. **Session**: `createSession()` creates JWT token in HTTP-only cookie
4. **Redirect**: To intended page or home

**Magic Link**:

1. **Email Request**: User enters email for magic link
2. **Token Generation**: Create magic_link token (24-hour expiry)
3. **Email Sent**: Magic link email to console (dev) or email provider
4. **Auto Sign-In**: `/api/auth/magic-link?token=...` validates and creates session
5. **Redirect**: To home with success message

#### Password Reset Flow

1. **Reset Request**: User clicks "Forgot password?" → `/auth/forgot-password`
2. **Email Lookup**: Find user by email (no enumeration - always returns success)
3. **Reset Token**: Generate reset token (1-hour expiry)
4. **Email Sent**: Reset link email to console (dev) or email provider
5. **Password Reset**: `/auth/reset-password?token=...` validates token
6. **Token Verification**: Server-side validation via `/api/auth/verify-reset-token`
7. **New Password**: User sets new password via `/api/auth/reset-password`
8. **Success**: Redirect to sign-in with confirmation message

### Session Management

- **JWT Tokens**: Stored in HTTP-only cookies
- **CSRF Protection**: SameSite cookie policy
- **Expiry**: 7 days for access tokens
- **Security**: Secure flag in production
- **Logout**: Manual session termination available

## Server Actions vs API Routes

### When to Use Server Actions vs API Routes

This project uses **Server Actions** for most data mutations and form submissions, with **API Routes** reserved for specific use cases. Understanding this distinction is crucial for maintaining consistent patterns.

#### Use Server Actions For:

- **Form submissions** (sign up, sign in, password reset)
- **Database mutations** (creating, updating, deleting records)
- **Admin operations** (user management, role assignments)
- **Authentication flows** that don't require external redirects
- **Any operation that needs to revalidate cached data**

#### Use API Routes For:

- **External integrations** (webhooks, third-party API endpoints)
- **Authentication endpoints** that set cookies (magic links, OAuth callbacks)
- **File uploads** with external storage
- **Operations that need custom response headers**
- **Endpoints consumed by external services**

### Server Action Patterns

#### Basic Server Action Structure

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";

export async function createUserAction(formData: FormData) {
  // 1. Authentication check
  const currentUser = await getCurrentUser();
  if (!currentUser || !(await isAdmin(currentUser.id))) {
    redirect("/auth/signin");
  }

  // 2. Data validation
  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email");
  }

  // 3. Database operation
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  // 4. Revalidate affected pages
  revalidatePath("/admin/users");
  revalidatePath("/admin");

  // 5. Redirect or return
  redirect("/admin/users");
}
```

#### Data Mutation with Real-time Updates

```typescript
export async function toggleUserRoleAction(
  userId: number,
  roleId: number,
  action: "add" | "remove"
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !(await isAdmin(currentUser.id))) {
    throw new Error("Unauthorized");
  }

  // Prevent self-demotion
  if (userId === currentUser.id && action === "remove") {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (role?.name === "admin") {
      throw new Error("Cannot remove your own admin role");
    }
  }

  if (action === "add") {
    await prisma.userRole.create({
      data: { user_id: userId, role_id: roleId },
    });
  } else {
    await prisma.userRole.updateMany({
      where: { user_id: userId, role_id: roleId },
      data: { deleted_at: new Date() },
    });
  }

  // Revalidate all affected pages
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${userId}`);
}
```

### Authentication Patterns with Server Actions

#### Form-based Authentication

```typescript
// app/actions/auth.ts
"use server";

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email, deleted_at: null },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  await createSession(user.id);
  redirect("/");
}
```

#### Component Usage

```typescript
// components/auth/SignInForm.tsx
import { signInAction } from '@/app/actions/auth'

export function SignInForm() {
  return (
    <form action={signInAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Why Not Mix Patterns

#### ❌ Don't Do This (Mixing Client Fetch with Server Actions)

```typescript
// Bad: Using fetch to call server actions
const handleSubmit = async (formData) => {
  const response = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(formData),
  });
  // Then manually handling revalidation, errors, etc.
};
```

#### ✅ Do This (Pure Server Action)

```typescript
// Good: Direct server action usage
<form action={createUserAction}>
  <input name="email" />
  <button type="submit">Create User</button>
</form>
```

### Revalidation Strategies

#### Path Revalidation

```typescript
// Revalidate specific pages after mutations
revalidatePath("/admin/users"); // User list page
revalidatePath("/admin"); // Dashboard page
revalidatePath(`/admin/users/${id}`); // Specific user page
```

#### Tag Revalidation

```typescript
// For more complex caching scenarios
revalidateTag("users");
revalidateTag("admin-dashboard");
```

### Error Handling in Server Actions

```typescript
export async function serverActionWithErrorHandling(formData: FormData) {
  try {
    // Validation
    const validatedData = schema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Database operation
    const result = await prisma.user.create({
      data: validatedData,
    });

    revalidatePath("/users");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", details: error.errors };
    }
    return { success: false, error: "Operation failed" };
  }
}
```

### Common Anti-Patterns to Avoid

1. **Don't use middleware for auth when using Server Actions** - Check auth directly in the action
2. **Don't mix fetch() with Server Actions** - Use one pattern consistently
3. **Don't forget revalidatePath()** - UI won't update without it
4. **Don't use Server Actions for GET operations** - Use Server Components for data fetching
5. **Don't call Server Actions from useEffect** - Use form actions or event handlers

## Admin Dashboard

### Complete Admin Features

1. **Dashboard Home** (`/admin`)
   - User statistics (total, active, recent signups)
   - Recent user list with creation dates
   - Quick metrics and overview
   - Navigation to all admin functions

2. **User Management** (`/admin/users`)
   - **Search & Filter**: Real-time search users by email
   - **Pagination**: Handle large user bases efficiently
   - **User Details**: View complete profile information
   - **Password Reset**: Send reset emails to any user
   - **Role Management**:
     - View all roles assigned to a user
     - Add any available role to users (including custom roles)
     - Remove roles from users with role-specific protection
     - **Self-Protection**: Cannot remove your own admin role
     - **Real-time Updates**: UI updates immediately after role changes
     - **Visual Indicators**: Clear role badges and status

3. **Role Management** (`/admin/roles`)
   - **View All Roles**: System and custom roles with user counts
   - **Create Custom Roles**: Add new roles beyond user/admin
   - **Delete Custom Roles**: Remove roles (only if no users assigned)
   - **System Protection**: Cannot delete user/admin roles
   - **Ordering**: Roles ordered by ID for consistency
   - **Real-time Updates**: List updates immediately after changes

4. **Settings Panel** (`/admin/settings`)
   - Application configuration overview
   - Email provider status
   - Security configuration display
   - System information

5. **Database Viewer** (`/admin/database`)
   - **Table List View**: Browse all database tables with row counts
   - **Table Data View**: Inspect table contents with pagination
   - **Column Display**: View all columns and their data types
   - **Pagination**: Navigate through large tables (100 rows per page)
   - **Security**: SQL injection protection with table validation
   - **Performance**: Efficient querying with proper limits

### Admin Access Control

- **Route Protection**: All `/admin/*` routes require admin role
- **API Protection**: All `/api/admin/*` endpoints verify admin status
- **Component Protection**: Admin components check permissions
- **Navigation Guards**: Automatic redirects for non-admin users

### Admin API Routes

- `POST /api/admin/users/[id]/reset-password` - Send password reset
- `POST /api/admin/users/[id]/roles` - Add role to user
- `DELETE /api/admin/users/[id]/roles` - Remove role from user
- `POST /api/admin/roles` - Create new role
- `DELETE /api/admin/roles/[id]` - Delete role

## UI Components

### shadcn/ui Components Used

- Button, Card, Form, Input, Label
- Dialog, DropdownMenu, Table
- Toast, Alert, Tabs, Select
- Separator, Avatar, Badge

### Custom Components

#### Auth Components

- **SignInForm**: Tabbed form with email/password and magic link options
- **SignUpForm**: Registration with password confirmation

#### Admin Components

- **UserManagementPanel**: Full user management interface with search, pagination, and actions
- **RoleManagementPanel**: Role CRUD operations with protections
- **DatabaseViewerPanel**: Database table browser with data inspection

## Key Pages

### Public Pages

- `/` - Home page (shows setup, sign in, or user info based on state)
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/auth/setup-admin` - First-time admin setup (only if no admin exists)

### Protected Pages (Admin Only)

- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/roles` - Role management
- `/admin/database` - Database viewer
- `/admin/settings` - Admin settings

## Working with the Database

### Common Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name description

# Reset database and run seed
npm run db:reset

# Open Prisma Studio
npm run db:studio

# Run seed script
npm run db:seed
```

### Database Best Practices

1. Always use transactions for multi-table operations
2. Use soft deletes (set `deleted_at`) instead of hard deletes
3. Include proper indexes for frequently queried fields
4. Filter by `deleted_at: null` for active records

### CRITICAL: Database Development Flow

**ALWAYS follow this sequence when modifying `prisma/schema.prisma`:**

1. **Modify the schema** (add/remove/change models, fields, relations, etc.)
2. **Create migration FIRST**: `npx prisma migrate dev --name "descriptive-name"`
3. **Prisma generates client automatically** during migration

**Why this order matters:**

- Migrations update the actual database structure
- Prisma generate syncs TypeScript types with the database
- Running generate before migration creates type/database mismatches

### Schema Change Scenarios:

**For structural changes** (new models, fields, relations):

```bash
# 1. Edit schema.prisma
# 2. Create migration (this also runs prisma generate)
npx prisma migrate dev --name "add-user-preferences-table"
```

**For non-structural changes** (comments, formatting):

```bash
# Only regenerate client
npx prisma generate
```

**Migration Naming Conventions:**

- `add-model-name` - New models
- `update-model-field` - Field changes
- `remove-unused-table` - Deletions
- `add-indexes` - Performance improvements

**Never run migrations automatically** - they can be destructive and need review.

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./db/prod.db"
JWT_SECRET="your-secret-key"
EMAIL_FROM="noreply@example.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Development Workflow

### Adding New Features

1. Update Prisma schema if needed
2. Run migrations: `npx prisma migrate dev`
3. Create server actions in `app/actions/`
4. Create API routes in `app/api/`
5. Build UI components in `components/`
6. Add pages in `app/`
7. Update this documentation

### Security Considerations

- All admin routes check for admin role
- Users cannot remove their own admin role
- System roles (user, admin) cannot be deleted
- Cannot delete last admin user
- Passwords are hashed with bcrypt
- Sessions use HTTP-only cookies
- JWT tokens have appropriate expiry times

## ID Encoding with Sqids ✅ FULLY IMPLEMENTED

The application uses [Sqids](https://sqids.org/) to encode numeric database IDs into short, URL-safe strings for all public-facing interfaces. **This system is fully implemented and operational.**

### Why Sqids?

- **Security**: Hides internal database IDs from users
- **User-friendly**: Creates short, readable IDs instead of sequential numbers
- **URL-safe**: No special characters that need encoding
- **Reversible**: Can decode back to original numeric IDs
- **Performance**: Minimal overhead with efficient encoding/decoding

### Complete Implementation Status

#### ✅ Core Infrastructure

- **Sqids Package**: Installed and configured (`sqids@0.3.0`)
- **Environment Configuration**: `SQIDS_ALPHABET` set in both `.env` and `.env.example`
- **Utility Functions**: Complete implementation in `lib/utils/sqids.ts`
- **Transform Functions**: Full API response transformations in `lib/utils/api-transforms.ts`
- **Helper Functions**: API route helpers in `lib/utils/api-helpers.ts`

#### ✅ API Integration

- **All Admin API Routes**: Use sqids for ID encoding/decoding
  - `/api/admin/users/[id]/reset-password` - Decodes user IDs
  - `/api/admin/users/[id]/roles` - Handles user ID operations
  - `/api/admin/roles/[id]` - Manages role ID operations
  - `/api/admin/roles` - Returns encoded role IDs
- **Response Transformations**: All API responses use encoded IDs
- **Input Validation**: Proper decoding and validation of incoming IDs

#### ✅ Frontend Integration

- **Component Types**: All components use `string` IDs (already compatible)
- **Server-Side Data**: Pages transform data before sending to components
- **API Calls**: Frontend components make requests with encoded IDs
- **Type Safety**: Complete TypeScript integration throughout

### Configuration

#### Environment Setup

```env
# Required: Set unique alphabet per environment
SQIDS_ALPHABET="FxnXM1kBN6cuhsAvjW3Co7l2RePyY8DwaU04Tzt9fHQrqSVKdpimLGIJOgb5ZE"
```

#### Sqids Configuration (`lib/utils/sqids.ts`)

```typescript
const sqids = new Sqids({
  alphabet: SQIDS_ALPHABET,
  minLength: 6, // Ensures consistent ID length
});
```

### Usage Patterns

#### Server-Side Database Operations

```typescript
// Internal database operations use numeric IDs
const user = await prisma.user.findUnique({ where: { id: 123 } });

// Transform for client/API responses
const transformed = transformUserForResponse(user);
// Result: { id: "B5K7Nk", email: "user@example.com", profile: {...}, roles: [...] }
```

#### API Route Implementation

```typescript
// Decode incoming encoded IDs
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const userId = decodeId(resolvedParams.id);

  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // Use numeric ID for database operations
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Return success with encoded IDs
  return NextResponse.json({ success: true });
}
```

#### Server-Side Page Data Transformation

```typescript
// Admin pages transform data before sending to components
export default async function UsersPage({ searchParams }) {
  const { users, count } = await getUsers();

  // Transform all user data to use encoded IDs
  const transformedUsers = users.map(transformUserForResponse);

  return (
    <UserManagementPanel
      initialUsers={transformedUsers}
      currentUserId={currentUser ? encodeId(currentUser.id) : ""}
    />
  );
}
```

#### Component Integration

```typescript
// Components work with string IDs seamlessly
interface User {
  id: string; // Encoded ID
  email: string;
  roles: { role: { name: string } }[];
}

// API calls use encoded IDs directly
const handleRoleToggle = async (userId: string, roleName: string) => {
  await fetch(`/api/admin/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ roleName }),
  });
};
```

### Key Functions and Their Usage

#### Core Encoding/Decoding

```typescript
// lib/utils/sqids.ts
encodeId(123) → "B5K7Nk"              // Database ID to client ID
decodeId("B5K7Nk") → 123              // Client ID back to database ID
isValidEncodedId("B5K7Nk") → true     // Validation helper
requireDecodedId("B5K7Nk") → 123      // Decode with error handling
```

#### API Transform Functions

```typescript
// lib/utils/api-transforms.ts
transformUserForResponse(user); // Complete user transformation
encodeEntityId(entity); // Generic entity transformation
encodeEntityIds(entities); // Array transformation
encodeNestedIds(entity, ["user_id"]); // Transform specific ID fields
```

#### API Helper Functions

```typescript
// lib/utils/api-helpers.ts
decodeRouteParam(params, "id"); // Decode ID from route params
requireValidId(decodedId, "user"); // Validate decoded ID
apiResponse(data); // Standardized API responses
apiError(message); // Standardized error responses
```

### Integration Examples

#### Complete User Management Flow

1. **Page Load**: Server fetches users with numeric IDs from database
2. **Transformation**: `transformUserForResponse()` converts all IDs to encoded strings
3. **Component Render**: `UserManagementPanel` receives and displays encoded IDs
4. **User Action**: User clicks "Reset Password" for user with ID "B5K7Nk"
5. **API Call**: Frontend sends `POST /api/admin/users/B5K7Nk/reset-password`
6. **API Processing**: Route decodes "B5K7Nk" → 123, performs database operation
7. **Response**: API returns success with consistent encoded ID format

#### Role Management Flow

1. **Role Creation**: Admin creates role, API returns `{ id: "X9mK2j", name: "editor" }`
2. **Role Assignment**: Frontend calls `POST /api/admin/users/B5K7Nk/roles`
3. **Database Operation**: API decodes both user and role IDs for database operations
4. **Real-time Update**: Components refresh with newly encoded role assignment data

### Security Implementation

#### ID Obfuscation

- Sequential database IDs (1, 2, 3...) become random-looking strings
- Makes it harder to enumerate users or guess valid IDs
- Provides minimal security through obscurity

#### Validation Layers

```typescript
// Multi-layer validation in API routes
const userId = decodeId(params.id);
if (!userId || userId <= 0) {
  return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
}

// Additional authorization checks
const currentUser = await getCurrentUser();
if (!currentUser || !(await isAdmin(currentUser.id))) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Environment Security

- Unique `SQIDS_ALPHABET` per environment (dev/staging/prod)
- Different alphabets produce different encoded IDs for same numeric ID
- Prevents cross-environment ID prediction

### Performance Considerations

#### Encoding/Decoding Overhead

- **Minimal Impact**: Sqids operations are extremely fast (microseconds)
- **Memory Efficient**: No caching needed for basic operations
- **Scalable**: Performance remains constant regardless of ID size

#### Database Operations

- **No Database Changes**: Internal database operations unchanged
- **Index Performance**: Numeric ID indexes remain fully effective
- **Query Efficiency**: All database queries use original numeric IDs

### Development Workflow

#### Adding New Entities with Sqids

1. **Database Model**: Create with standard numeric ID
2. **API Routes**: Use `decodeId()` for incoming IDs, return encoded responses
3. **Transform Function**: Create entity-specific transform if needed
4. **Components**: Design to work with string IDs from the start

#### Testing Sqids Integration

```typescript
// Example test patterns
describe("Sqids Integration", () => {
  test("encodes and decodes IDs correctly", () => {
    const originalId = 123;
    const encoded = encodeId(originalId);
    const decoded = decodeId(encoded);
    expect(decoded).toBe(originalId);
  });

  test("API routes handle encoded IDs", async () => {
    const userId = encodeId(123);
    const response = await fetch(`/api/admin/users/${userId}/reset-password`);
    expect(response.ok).toBe(true);
  });
});
```

### Troubleshooting

#### Common Issues and Solutions

1. **"Invalid ID" errors**: Check that frontend is sending encoded IDs, not numeric
2. **Type mismatches**: Ensure components expect `string` IDs, not `number`
3. **Missing transforms**: Verify all API responses use transform functions
4. **Environment issues**: Confirm `SQIDS_ALPHABET` is set correctly

#### Debug Helpers

```typescript
// Add temporary logging to debug ID flow
console.log("Encoded ID:", encodeId(123));
console.log("Decoded ID:", decodeId("B5K7Nk"));
console.log("Valid ID?", isValidEncodedId("B5K7Nk"));
```

### Future Enhancements

- **Audit Logging**: Track operations by encoded IDs for security
- **Rate Limiting**: Use encoded IDs for user-specific rate limits
- **Analytics**: Aggregate data using encoded IDs while maintaining privacy
- **API Versioning**: Different encoding schemes for different API versions

## Email System

The email system uses a provider pattern for maximum flexibility and easy integration:

### Email Provider Architecture (`lib/email/email.ts`)

```typescript
interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}
```

### Current Implementation

- **ConsoleEmailProvider**: Logs emails to console (perfect for development)
- **Provider Pattern**: Easy to swap between different email services
- **Global Configuration**: Set once, use everywhere

### Email Templates (Built-in)

- **Verification Email**: `getVerificationEmailTemplate(token, appUrl)`
  - Purpose: Verify user email addresses after registration
  - Expiry: 24 hours
  - Route: `/auth/verify-email?token=...`
  - HTML + Text versions included

- **Password Reset Email**: `getPasswordResetEmailTemplate(token, appUrl)`
  - Purpose: Reset forgotten passwords
  - Expiry: 1 hour (security requirement)
  - Route: `/auth/reset-password?token=...`
  - Clear instructions and security warnings

- **Magic Link Email**: `getMagicLinkEmailTemplate(token, appUrl)`
  - Purpose: Passwordless authentication
  - Expiry: 24 hours
  - Route: `/api/auth/magic-link?token=...` (direct API for security)
  - Automatic sign-in on click

### Production Email Providers (see docs/email-providers.md)

- **SendGrid**: Enterprise-grade email delivery
- **Resend**: Developer-focused email API
- **AWS SES**: Scalable cloud email service
- **SMTP**: Traditional email servers (Gmail, custom)
- **Development Tools**: Mailtrap, Ethereal Email for testing

### Email Provider Setup

```typescript
// Initialize provider on app start
import { setEmailProvider } from "@/lib/email/email";
import { SendGridProvider } from "@/lib/email/providers/sendgrid";

setEmailProvider(new SendGridProvider(process.env.SENDGRID_API_KEY));
```

## Theme Support

The application includes full dark mode support using `next-themes`:

### Features

- Light/Dark/System theme options
- Theme toggle component in all pages
- Persistent theme preference
- No flash on page load
- Smooth transitions

### Theme Toggle Locations

- Admin dashboard (desktop and mobile)
- Home page (top right)
- All auth pages (top right)

### Implementation

- Uses `next-themes` with class-based dark mode
- CSS variables for colors that adapt to theme
- `ThemeProvider` wraps the entire application
- `ThemeToggle` component for user control

## Future Enhancements

1. **Email Service**: Implement real email sending (SendGrid, Resend, etc.)
2. **Dark Mode Toggle**: Add theme switcher component
3. **Two-Factor Authentication**: Add 2FA support
4. **API Rate Limiting**: Implement rate limiting for API routes
5. **Audit Logs**: Track admin actions
6. **User Profiles**: Expand user profile functionality
7. **File Uploads**: Add avatar/profile picture support

## Troubleshooting

### Common Issues

1. **"No admin exists" loop**: Run `npm run db:seed` to create default roles
2. **Database locked**: Stop all running processes and restart
3. **Type errors**: Run `npx prisma generate` after schema changes
4. **Auth not working**: Check JWT_SECRET environment variable

### Debug Commands

```bash
# Check database content
npm run db:studio

# Reset everything
rm -f db/prod.db && npm run db:reset

# Check for TypeScript errors
npm run build
```

## Additional Documentation

For detailed implementation guides, see the `docs/` folder:

- [Email Providers Guide](./docs/email-providers.md) - Implement SendGrid, Resend, AWS SES, etc.
- [Authentication Providers Guide](./docs/auth-providers.md) - Add Google, GitHub, Facebook OAuth
- [Theme Customization Guide](./docs/theme-customization.md) - Create custom themes and color schemes
- [Sqids ID Encoding Guide](./docs/sqids-encoding.md) - Detailed guide for encoding IDs with Sqids
- [Documentation Index](./docs/README.md) - Overview of all guides

## Cursor AI Rules

This project includes comprehensive development rules in the `.cursor/rules` folder that provide detailed guidance for Cursor AI. These rules ensure consistent implementation patterns and help maintain project integrity:

### Available Rules:

- **`project.mdc`** - Overall project architecture, supported flows, and extension points
- **`database.mdc`** - Database design patterns and Prisma workflows
- **`auth.mdc`** - Complete authentication flows, security patterns, and permission systems
- **`admin.mdc`** - Admin dashboard features, access control, and component patterns
- **`prisma.mdc`** - Schema change workflows, migration best practices, and conventions
- **`server-actions.mdc`** - Server Actions vs API Routes patterns, form integration, and revalidation
- **`themes.mdc`** - Theme system implementation, adding new themes, and customization options
- **`setup.mdc`** - Automated project setup rules for new installations

### How to Use These Rules:

1. **For Cursor AI**: The rules automatically apply based on file patterns and provide context-aware assistance
2. **For Developers**: Reference these files when implementing new features to ensure consistency
3. **For Customization**: Modify the rules to match your team's specific requirements

### Key Benefits:

- Consistent code patterns across the entire codebase
- Automatic guidance for common tasks (auth, database, themes, etc.)
- Prevention of anti-patterns and common mistakes
- Clear documentation of architectural decisions
- Context-aware assistance based on what you're working on

## Contributing

When adding new features:

1. Follow existing patterns for consistency
2. Add proper TypeScript types
3. Include error handling
4. Update this documentation
5. Test both happy and error paths
6. Consider mobile responsiveness
7. Maintain security best practices
8. Update relevant documentation in `docs/` folder
9. **IMPORTANT**: After implementing features or fixes, review and update all `.cursor/rules` files to ensure they reflect the current implementation
