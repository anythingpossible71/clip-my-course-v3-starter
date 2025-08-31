# Sqids ID Encoding

This application uses [Sqids](https://sqids.org/) to encode numeric database IDs into short, URL-safe strings for public-facing interfaces.

## Why Sqids?

1. **Security**: Hides internal database IDs from users
2. **User-friendly**: Creates short, readable IDs instead of sequential numbers
3. **URL-safe**: No special characters that need encoding
4. **Reversible**: Can decode back to original numeric IDs
5. **Collision-free**: Guaranteed unique encodings

## Implementation

### Configuration

The Sqids alphabet is configured via environment variable:

```env
SQIDS_ALPHABET="FxnXM1kBN6cuhsAvjW3Co7l2RePyY8DwaU04Tzt9fHQrqSVKdpimLGIJOgb5ZE"
```

**Important**: In production, use a unique alphabet to prevent ID guessing.

### Basic Usage

```typescript
import { encodeId, decodeId } from "@/lib/utils/sqids";

// Encode a database ID for client display
const encodedId = encodeId(123); // Returns something like "B5K7Nk"

// Decode back to numeric ID for database queries
const numericId = decodeId("B5K7Nk"); // Returns 123
```

### API Route Pattern

When creating API routes that accept IDs:

```typescript
// app/api/users/[id]/route.ts
import { decodeId } from "@/lib/utils/sqids";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Decode the ID from the URL
  const userId = decodeId(params.id);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // Use numeric ID for database query
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Return user with encoded ID
  return NextResponse.json(encodeEntityId(user));
}
```

### Server Component Pattern

When passing data from server to client components:

```typescript
// app/admin/users/page.tsx
import { encodeId } from "@/lib/utils/sqids";
import { transformUserForResponse } from "@/lib/utils/api-transforms";

export default async function UsersPage() {
  const users = await prisma.user.findMany();

  // Transform users to use encoded IDs
  const transformedUsers = users.map(transformUserForResponse);

  return <UserList users={transformedUsers} />;
}
```

### Client Component Pattern

Client components receive and use encoded IDs:

```typescript
// components/UserList.tsx
interface User {
  id: string; // Encoded ID
  email: string;
  // ... other fields
}

export function UserList({ users }: { users: User[] }) {
  const handleDelete = async (userId: string) => {
    // Use encoded ID directly in API calls
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE"
    });
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {/* Use encoded ID for keys and API calls */}
          <button onClick={() => handleDelete(user.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Transform Utilities

### `encodeEntityId`

Transforms a single entity to use encoded ID:

```typescript
const user = { id: 123, email: "test@example.com" };
const transformed = encodeEntityId(user);
// Result: { id: "B5K7Nk", email: "test@example.com" }
```

### `transformUserForResponse`

Transforms a user object with nested relations:

```typescript
const transformed = transformUserForResponse(userWithRelations);
// Encodes: user.id, profile.id, profile.user_id, roles[].id, etc.
```

## Security Considerations

1. **Never expose numeric IDs**: Always encode IDs before sending to clients
2. **Validate decoded IDs**: Check that decoded values are valid positive integers
3. **Use environment-specific alphabets**: Different alphabets for dev/staging/production
4. **Don't rely on obscurity**: Sqids provides obfuscation, not encryption

## Common Patterns

### URL Parameters

```
/users/B5K7Nk instead of /users/123
/admin/users/xJ9Qm2/edit instead of /admin/users/456/edit
```

### API Responses

```json
{
  "id": "B5K7Nk",
  "email": "user@example.com",
  "profile": {
    "id": "mK3Nx8",
    "user_id": "B5K7Nk"
  }
}
```

### Form Submissions

```typescript
// Client sends encoded ID
{ "userId": "B5K7Nk", "roleId": "xJ9Qm2" }

// Server decodes before database operations
const userId = decodeId(body.userId);
const roleId = decodeId(body.roleId);
```

## Troubleshooting

### Invalid ID Errors

If you get "Invalid ID" errors:

1. Check that the ID is being encoded before sending to client
2. Verify the alphabet hasn't changed between encoding/decoding
3. Ensure you're not double-encoding IDs

### Type Errors

The transform utilities handle the ID type conversion:

- Database: `id: number`
- API/Client: `id: string`

Make sure your TypeScript types reflect this difference.
