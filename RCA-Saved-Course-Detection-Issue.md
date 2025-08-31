# RCA: Saved Course Detection Issue - Why It Took 3 Attempts

## 🎯 **Issue Summary**
**Problem**: Save button showing "Save Course" instead of "In My Courses" for already saved courses
**Expected**: Save button should show "In My Courses" when course is already in user's saved courses
**Reality**: Took 3 attempts to fix due to incorrect assumptions about code structure

## 🔍 **Root Cause Analysis**

### **Attempt 1: Wrong File Assumption**
**What I Did**: Modified `lib/utils/course-helpers.ts`
**What Actually Happened**: API was importing from `lib/utils/api-transforms.ts`
**Wrong Assumption**: "There's only one transformation function in the codebase"
**Reality**: Two separate transformation functions exist:
- `lib/utils/course-helpers.ts` - Used by some APIs
- `lib/utils/api-transforms.ts` - Used by shared course API

**Why It Failed**: 
- Modified the wrong file
- No impact on the actual API being called
- Debug logs showed data was being lost but couldn't trace why

### **Attempt 2: Session Type Assumption**
**What I Did**: Added `Number()` conversion to `session.userId`
**What Actually Happened**: Session already returns numeric user ID
**Wrong Assumption**: "Session might return ULID string that needs conversion"
**Reality**: `getSession()` returns `{ userId: number }` directly

**Why It Failed**:
- Unnecessary conversion was causing query to fail
- Added complexity where none was needed
- Debug logs showed session had correct numeric user ID

### **Attempt 3: Correct Fix**
**What I Did**: 
1. Identified correct transformation function in `api-transforms.ts`
2. Added `savedCourses` field to input/output types
3. Preserved `savedCourses` data in transformation
4. Removed unnecessary `Number()` conversion

**Why It Worked**:
- Modified the actual function being used
- Preserved data through the transformation pipeline
- Used correct session data type

## 🧠 **Core Assumptions That Were Wrong**

### **1. Single Source of Truth Assumption**
**Wrong Assumption**: "There's only one transformation function for courses"
**Reality**: Multiple transformation functions exist for different use cases
**Lesson**: Always trace the actual import path, don't assume file structure

### **2. Session Type Assumption**
**Wrong Assumption**: "Session might return ULID string that needs conversion"
**Reality**: Session already returns numeric user ID
**Lesson**: Check the actual return type of functions before making assumptions

### **3. Data Loss Location Assumption**
**Wrong Assumption**: "Data loss is happening in the API query"
**Reality**: Data loss was happening in the transformation function
**Lesson**: Follow the data flow completely, don't stop at the first potential issue

## 🔧 **What Actually Fixed It**

### **Correct Approach**:
1. **Traced the actual import**: Found API uses `@/lib/utils/api-transforms`
2. **Checked function signature**: Verified input/output types
3. **Added missing field**: `savedCourses` was not in transformation function
4. **Preserved data**: Added `savedCourses: course.savedCourses || []`

### **Key Insight**:
The issue wasn't in the API query or session handling - it was in the transformation function not preserving the `savedCourses` data that was correctly fetched from the database.

## 📊 **Timeline of Attempts**

| Attempt | What I Did | Why It Failed | Time Spent |
|---------|------------|---------------|------------|
| 1 | Modified `course-helpers.ts` | Wrong file - API uses `api-transforms.ts` | 30 min |
| 2 | Added `Number()` conversion | Unnecessary - session already numeric | 20 min |
| 3 | Fixed `api-transforms.ts` | Correct file, correct approach | 15 min |

## 🎓 **Lessons Learned**

### **1. Always Trace Imports**
- Don't assume file structure
- Follow the actual import path
- Check which function is actually being called

### **2. Verify Data Types**
- Don't assume data types need conversion
- Check function signatures and return types
- Test assumptions with debug logs

### **3. Follow Complete Data Flow**
- Don't stop at the first potential issue
- Trace data from database → API → transformation → frontend
- Use debug logs at each step

### **4. Question Initial Assumptions**
- "There's only one transformation function" ❌
- "Session might need type conversion" ❌
- "Data loss is in the query" ❌

## 🚀 **Prevention Strategies**

### **For Future Similar Issues**:
1. **Start with import tracing**: Always check which function is actually imported
2. **Add comprehensive logging**: Log data at each step of the pipeline
3. **Verify assumptions**: Test each assumption with actual data
4. **Follow complete flow**: Don't stop until you've traced the entire data path

### **Code Review Checklist**:
- [ ] Verify import paths match file modifications
- [ ] Check function signatures before making changes
- [ ] Add debug logs to trace data flow
- [ ] Test assumptions with actual data

## ✅ **Final Resolution**

**Root Cause**: Transformation function in `api-transforms.ts` was not preserving `savedCourses` data
**Solution**: Added `savedCourses` field to input/output types and preserved data in transformation
**Result**: Save button now correctly shows "In My Courses" for saved courses

**Time to Resolution**: 65 minutes (could have been 15 minutes with correct initial approach)
**Key Learning**: Always trace the actual code path, don't make assumptions about file structure or data types.
