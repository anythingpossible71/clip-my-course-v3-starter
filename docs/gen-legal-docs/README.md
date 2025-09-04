# Legal Document Generation System

## 🚨 CRITICAL RULES - NO OVER-GENERATION

**ONLY generate documents for EXISTING codebase features. NEVER create documents for non-existent or future features.**

### ✅ CORRECT APPROACH
- **Scan codebase first** to identify actual features
- **Generate only** documents for features that exist
- **Create markdown files** in `legal/` folder
- **Create dynamic pages** that read from markdown files
- **Update user** with new page links and file locations

### ❌ WRONG APPROACH
- **DO NOT** generate documents for features that don't exist
- **DO NOT** create documents for "future" or "planned" features
- **DO NOT** assume features exist without codebase verification
- **DO NOT** create documents for non-existent payment systems, affiliate programs, etc.

## 📋 Implementation Workflow

### **Step 1: Codebase Analysis**
```bash
# Scan for actual features
grep -r "payment\|billing\|subscription" app/ components/ lib/
grep -r "affiliate\|referral\|commission" app/ components/ lib/
grep -r "social.*media\|facebook\|twitter\|instagram" app/ components/ lib/
```

### **Step 2: Generate Required Documents**
Based on codebase analysis, generate ONLY these documents:

#### **Core Legal Documents (Always Required)**
- `legal/terms-of-use.md` - Terms of Service
- `legal/privacy-policy.md` - Privacy Policy

#### **Conditional Documents (Only if features exist)**
- `legal/cookie-policy.md` - Only if cookies are used
- `legal/dmca-policy.md` - Only if user content is hosted
- `legal/general-disclaimer.md` - Only if disclaimers are needed

#### **Documents to NEVER Generate (Unless explicitly exist)**
- ❌ Returns & Refunds Policy (no payment system)
- ❌ Affiliate Disclosure (no affiliate program)
- ❌ Shipping Policy (no physical products)
- ❌ Warranty Policy (no hardware/software warranties)

### **Step 3: Create Dynamic Pages**
For each markdown file, create a corresponding page:

```typescript
// app/[page-name]/page.tsx
import { readFileSync } from 'fs'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function [PageName]Page() {
  const markdown = readFileSync('./legal/[filename].md', 'utf-8')
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
        
        <MarkdownRenderer 
          content={markdown}
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-strong prose-a:text-primary hover:prose-a:text-primary/80"
        />
      </div>
    </div>
  )
}
```

### **Step 4: Update User Documentation**
After implementation, provide the user with:

1. **List of new page URLs**
2. **Location of markdown files**
3. **Instructions for editing content**

## 🔍 Feature Detection Examples

### **✅ Features That Exist (Generate Documents)**
```typescript
// Found in codebase - generate cookie policy
import { CookieConsent } from "@/components/cookie-consent"

// Found in codebase - generate DMCA policy  
const userContent = await prisma.course.findMany()

// Found in codebase - generate disclaimer
<div className="disclaimer">Content for educational purposes only</div>
```

### **❌ Features That DON'T Exist (Skip Documents)**
```typescript
// NOT found in codebase - skip returns policy
// No payment processing, no refunds

// NOT found in codebase - skip affiliate disclosure  
// No referral programs, no commissions

// NOT found in codebase - skip shipping policy
// No physical products, no delivery
```

## 📁 File Structure After Implementation

```
legal/                           ← 📁 Legal Documents (Markdown)
├── terms-of-use.md             ← 📄 Terms of Use
├── privacy-policy.md           ← 📄 Privacy Policy
├── general-disclaimer.md       ← 📄 General Disclaimer
├── cookie-policy.md            ← 📄 Cookie Policy
└── dmca-policy.md              ← 📄 DMCA Policy

app/                             ← 📁 Dynamic Pages
├── terms/page.tsx              ← 🌐 /terms (reads terms-of-use.md)
├── privacy/page.tsx            ← 🌐 /privacy (reads privacy-policy.md)
├── disclaimer/page.tsx         ← 🌐 /disclaimer (reads general-disclaimer.md)
├── cookies/page.tsx            ← 🌐 /cookies (reads cookie-policy.md)
└── dmca/page.tsx               ← 🌐 /dmca (reads dmca-policy.md)
```

## 🎯 User Instructions After Implementation

### **New Legal Pages Available:**
- **Terms of Use:** `/terms`
- **Privacy Policy:** `/privacy`
- **General Disclaimer:** `/disclaimer`
- **Cookie Policy:** `/cookies`
- **DMCA Policy:** `/dmca`

### **Where to Edit Content:**
1. **Open the `legal/` folder** in your project
2. **Edit any `.md` file** (e.g., `terms-of-use.md`)
3. **Save the file**
4. **Refresh the corresponding page** in your browser
5. **Changes appear instantly!** ✨

### **Example Workflow:**
1. **Edit:** `legal/terms-of-use.md`
2. **Save file**
3. **Visit:** `http://localhost:3000/terms`
4. **See changes immediately**

## 🚫 Prohibited Actions

- **NEVER** generate documents for non-existent features
- **NEVER** assume future features will exist
- **NEVER** create documents without codebase verification
- **NEVER** generate more than 5 legal documents total
- **ALWAYS** verify features exist before generating documents

## ✅ Success Criteria

After implementation, the user should have:
1. **5 or fewer legal documents** (based on actual features)
2. **Dynamic pages** that read from markdown files
3. **Clear instructions** on where to find and edit files
4. **Working system** where editing MD files updates live pages

---

**Remember:** When in doubt, generate FEWER documents rather than more. It's better to have 3 accurate documents than 7 incorrect ones.
