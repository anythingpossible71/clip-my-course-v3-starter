# RCA: Course Deletion Failure

## Issue Summary
User attempted to delete a course at URL `http://localhost:3000/course/vqNUjD` and received a "Failed to delete course" error.

## Error Details
- **Error Type**: Console Error
- **Error Message**: "Failed to delete course"
- **Location**: `confirmDeleteCourse` function in course page
- **URL**: `http://localhost:3000/course/vqNUjD`

## Root Cause Analysis

### 1. Authentication Issue
**Primary Cause**: User is not authenticated
- The user is trying to access a course without being logged in
- API routes require authentication (`getSession()` check)
- Course fetch fails with 401 Unauthorized
- Course object becomes null, causing delete function to fail

### 2. Course Ownership Issue
**Secondary Cause**: Course access control
- The course ID `vqNUjD` appears to be a shared course
- Regular course page (`/course/[id]`) only allows access to user's own courses
- Shared courses should be accessed via `/shared-courses/[id]`
- Delete functionality is only available for user-owned courses

### 3. Error Handling Gap
**Contributing Factor**: Insufficient error feedback
- Original error handling didn't provide clear feedback
- User couldn't understand why deletion failed
- No distinction between authentication, authorization, and ownership issues

## Technical Details

### API Route Protection
```typescript
// app/api/courses/[id]/route.ts
const session = await getSession()
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Only allow access to own courses
const course = await prisma.course.findUnique({
  where: {
    id: courseId,
    creator_id: session.userId // Only own courses
  }
})
```

### Frontend Error Flow
1. User navigates to `/course/vqNUjD`
2. Course page tries to fetch course data
3. API returns 401 Unauthorized (user not logged in)
4. Course object remains null
5. User clicks delete button
6. `confirmDeleteCourse` fails because `course` is null
7. Generic "Failed to delete course" error shown

## Fixes Implemented

### 1. Enhanced Error Handling
```typescript
// Improved error messages in course page
if (courseResponse.status === 401) {
  throw new Error('You are not authorized to access this course. This course may be shared by another user.')
}

// Better delete function error handling
if (!course) {
  console.error('❌ Cannot delete course: course object is null')
  alert('Cannot delete course: course not found or access denied')
  return
}
```

### 2. API Route Debugging
```typescript
// Added detailed logging in DELETE route
console.log(`👤 Current user ID: ${session.userId}`)
console.log(`🔍 Decoded course ID: ${courseId}`)
console.log(`✅ Found course: "${existingCourse.title}" - proceeding with deletion`)
```

### 3. User-Friendly Error Messages
- Clear distinction between authentication and authorization errors
- Helpful guidance for shared courses
- Better console logging for debugging

## Prevention Measures

### 1. Authentication Checks
- Always verify user authentication before course operations
- Redirect unauthenticated users to login page
- Clear error messages for authentication issues

### 2. Course Access Control
- Separate routes for owned vs shared courses
- Clear UI indicators for course ownership
- Disable delete functionality for non-owned courses

### 3. Error Handling Best Practices
- Specific error messages for different failure scenarios
- User-friendly alerts with actionable guidance
- Comprehensive logging for debugging

## Testing Scenarios

### 1. Unauthenticated User
- Navigate to course page → Should show login prompt
- Try to delete course → Should show authentication error

### 2. Authenticated User - Own Course
- Navigate to own course → Should load successfully
- Delete course → Should work correctly

### 3. Authenticated User - Shared Course
- Navigate to shared course → Should redirect to shared course page
- Delete button → Should not be visible

### 4. Invalid Course ID
- Navigate to invalid course → Should show "Course not found"

## Lessons Learned

1. **Authentication First**: Always check authentication before any course operations
2. **Clear Error Messages**: Users need to understand why operations fail
3. **Proper Route Separation**: Own courses and shared courses need different handling
4. **Defensive Programming**: Check for null objects before using them
5. **Comprehensive Logging**: Detailed logs help with debugging

## Future Improvements

1. **Redirect to Login**: Automatically redirect unauthenticated users to login
2. **Course Type Detection**: Automatically detect if course is shared and redirect appropriately
3. **Better UI Feedback**: Show loading states and clear error messages
4. **Access Control Indicators**: Clear visual indicators for course ownership and permissions
