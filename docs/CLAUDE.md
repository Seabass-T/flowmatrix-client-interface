# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🚨 CRITICAL: Operating Instructions

**BEFORE STARTING ANY TASK:**
1. **Read `docs/PRD.md` first** - Understand WHAT to build (requirements, features, sprint goals)
2. **Reference this CLAUDE.md** - Understand HOW to build (technical patterns, architecture)
3. **Cross-reference both** - Ensure alignment between requirements and implementation

**Document Roles:**
- **PRD.md = WHAT** → Product requirements, features, business logic, acceptance criteria
- **CLAUDE.md = HOW** → Technical implementation, architecture, code patterns, conventions

---

## Project Overview

**FlowMatrix AI Client Interface** is a dual-portal web application showcasing ROI metrics and project tracking for FlowMatrix AI clients and employees. Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, and Supabase.

### Quick Reference
- **Current Phase:** Sprint 1 (Authentication & Foundation)
- **PRD Location:** `docs/PRD.md` (source of truth for requirements)
- **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase, Recharts, Zustand
- **Database:** Supabase (PostgreSQL with Row-Level Security)
- **Package Manager:** pnpm (always use pnpm commands)

---

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

Dev server: http://localhost:3000

### PostgreSQL MCP Access

The project has direct database access via the **PostgreSQL MCP** (Model Context Protocol) configured in Claude Code. This enables powerful database debugging and development capabilities.

**What You Can Do:**
- Execute raw SQL queries against the Supabase database
- Inspect table schemas, columns, types, constraints
- View and test Row-Level Security (RLS) policies
- Check indexes and their performance
- Analyze query execution plans
- Validate data integrity and relationships
- Debug database-related issues in real-time

**Example Commands:**
```bash
# Schema inspection
"Show me the schema for the projects table"
"What columns does the notes table have?"
"List all indexes on the tasks table"

# Data queries
"Get all active projects with their client names"
"Find clients with more than 5 projects"
"Show projects created in the last 7 days"

# RLS policy verification
"Show me the RLS policies on the projects table"
"Verify which tables have RLS enabled"
"Test if client users can access only their own projects"

# Performance analysis
"Explain the query plan for fetching dashboard data"
"Find slow queries in the recent logs"
"Check for missing indexes on foreign keys"

# Data validation
"Find projects with NULL go_live_date"
"Check for orphaned records in user_clients"
"Verify all employees have valid email addresses"
```

**When to Use:**
1. **Debugging RLS Issues:** When clients/employees see incorrect data
2. **Schema Changes:** Before modifying database structure
3. **Data Integrity:** Checking for data inconsistencies
4. **Performance:** Optimizing slow queries
5. **Testing:** Verifying database functions and triggers
6. **Development:** Understanding existing data patterns

**Configuration:**
Located in `~/.config/claude/config.json`:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "enhanced-postgres-mcp-server"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:[PASSWORD]@db.iqcwmkacfxgqkzpzdwpe.supabase.co:5432/postgres"
      }
    }
  }
}
```

**Security Note:**
- This is a **development-only** tool
- Uses direct PostgreSQL connection (not Supabase API)
- Has admin-level database access (bypasses RLS)
- Never commit the DATABASE_URL with password to version control

---

## Technology Stack

- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **React:** 19.1.0
- **TypeScript:** 5.x (strict mode)
- **Styling:** Tailwind CSS 4 with PostCSS
- **State Management:** Zustand 5.x
- **Backend/Auth:** Supabase (@supabase/supabase-js 2.75.0, @supabase/auth-helpers-nextjs 0.10.0)
- **Charts:** Recharts 3.x
- **Icons:** Lucide React
- **Dates:** date-fns 4.x

---

## Architecture & Key Patterns

### 1. Next.js App Router (Server Components First)

**Default: Server Components**
- All components render on the server by default
- Better performance, SEO, reduced client-side JS

**When to use `'use client'`:**
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (localStorage, window, navigator)
- React hooks (useState, useEffect, useContext)
- Third-party libraries requiring client-side execution

**File-based Routing:**
```
app/
├── (auth)/              # Route group for auth pages
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/         # Route group for protected pages
│   ├── client/page.tsx
│   └── employee/page.tsx
├── layout.tsx           # Root layout
└── page.tsx             # Home page
```

### 2. TypeScript Configuration

**Strict Mode Enabled:**
- No implicit any
- Strict null checks
- Strict property initialization

**Path Aliases:**
```typescript
// Use @/ for imports from root
import { supabase } from '@/lib/supabase'
import { MetricCard } from '@/components/MetricCard'
import { useAuth } from '@/hooks/useAuth'
import { Project } from '@/types/database'
```

**Module resolution:** `"bundler"`
**Target:** ES2017

### 3. Supabase Integration

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL          # Client-side
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Client-side (RLS enforced)
SUPABASE_SERVICE_ROLE_KEY         # Server-side only! (bypasses RLS)
NEXT_PUBLIC_APP_URL               # Application URL
```

#### 🚨 CRITICAL: Server-Side Database Access Pattern

**THE RULE:** Always use `SERVICE_ROLE_KEY` (admin client) for server-side database queries in Server Components, layouts, and API routes. This bypasses RLS and eliminates permission errors.

**WHY THIS MATTERS:**
- The `ANON_KEY` enforces Row-Level Security (RLS) on EVERY query
- RLS policies can block legitimate queries in server-side contexts
- Server Components and layouts run on the server where security is controlled by Next.js/middleware
- Using SERVICE_ROLE_KEY bypasses RLS entirely, preventing infinite loops and permission errors

**THREE CLIENT TYPES:**

1. **`createClient()` - Regular Client (ANON_KEY)**
   - **Uses:** ANON_KEY (enforces RLS)
   - **For:** Client Components only
   - **Location:** `lib/supabase-browser.ts`
   - **Example:** Form submissions, client-side mutations

2. **`createClient()` - Server Client (ANON_KEY with cookies)**
   - **Uses:** ANON_KEY (enforces RLS)
   - **For:** Authentication checks only (auth.getUser(), auth.getSession())
   - **Location:** `lib/supabase-server.ts`
   - **Example:** Getting current user in Server Components

3. **`createAdminClient()` - Admin Client (SERVICE_ROLE_KEY)** ⭐ **USE THIS FOR ALL DATA QUERIES**
   - **Uses:** SERVICE_ROLE_KEY (bypasses ALL RLS)
   - **For:** ALL database queries in Server Components, layouts, API routes
   - **Location:** `lib/supabase-admin.ts`
   - **Example:** Fetching projects, users, clients, etc.

**Implementation Files:**

```typescript
// lib/supabase-admin.ts (USE THIS FOR SERVER-SIDE QUERIES)
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

```typescript
// lib/supabase-server.ts (FOR AUTH ONLY)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**CORRECT USAGE PATTERN IN SERVER COMPONENTS:**

```typescript
// app/dashboard/client/page.tsx
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export default async function ClientDashboard() {
  // 1. Use regular client for AUTH ONLY
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Use ADMIN CLIENT for ALL DATA QUERIES
  const supabaseAdmin = createAdminClient()

  // Fetch user details (bypasses RLS)
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()

  // Fetch projects (bypasses RLS)
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('client_id', clientId)

  return <div>{/* Render */}</div>
}
```

**CORRECT USAGE IN LAYOUTS (CRITICAL!):**

```typescript
// app/dashboard/client/layout.tsx
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function ClientDashboardLayout({ children }) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Auth check with regular client
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ALL DATA QUERIES with admin client
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('email, role')
    .eq('id', user.id)
    .single()

  // Role verification - if this fails, you get infinite redirects!
  if (userData?.role !== 'client') {
    redirect('/dashboard/employee')
  }

  return <>{children}</>
}
```

**❌ COMMON MISTAKES THAT CAUSE INFINITE REDIRECTS:**

1. **Using ANON_KEY in layouts for data queries:**
   ```typescript
   // ❌ WRONG - This causes RLS errors and infinite redirect loops
   const { data: userData } = await supabase  // ANON_KEY client
     .from('users')
     .select('role')  // RLS blocks this
     .eq('id', user.id)
     .single()  // Returns null due to RLS

   if (userData?.role !== 'client') {  // Always true (null !== 'client')
     redirect('/dashboard/employee')  // INFINITE LOOP
   }
   ```

2. **Using ANON_KEY in Server Components for data queries:**
   ```typescript
   // ❌ WRONG - RLS can block legitimate queries
   const { data: projects } = await supabase  // ANON_KEY client
     .from('projects')
     .select('*')  // May fail due to RLS timing issues
   ```

**✅ THE FIX:**
- **Authentication:** Use `createClient()` from `lib/supabase-server.ts` (ANON_KEY)
- **Data Queries:** Use `createAdminClient()` from `lib/supabase-admin.ts` (SERVICE_ROLE_KEY)

**SECURITY:**
- SERVICE_ROLE_KEY is never exposed to the browser
- Only exists on the server in Server Components, layouts, and API routes
- Client Components cannot access it
- Middleware and route protection still enforce access control

**Row-Level Security (RLS):**
- ⚠️ **CRITICAL:** All tables MUST have RLS enabled (for direct client access via API)
- RLS policies protect against malicious API calls
- Server-side code bypasses RLS using SERVICE_ROLE_KEY
- Middleware enforces role-based access before requests reach Server Components

### 4. State Management Strategy

| State Type | Tool | Use Case |
|------------|------|----------|
| Server State | React Server Components | Initial data fetching, SEO-critical data |
| Client State | Zustand | Complex client-side state (auth, UI preferences) |
| URL State | Next.js searchParams | Shareable/bookmarkable state (filters, time ranges) |
| Form State | React 19 form actions | Form submissions with server actions |

**Zustand Store Example:**
```typescript
// stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

### 5. Styling Approach

**Tailwind CSS 4:**
- Utility-first approach (no custom CSS unless absolutely necessary)
- Inline theme configuration in `globals.css`
- Mobile-first responsive design

**CSS Variables (globals.css):**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

**Responsive Breakpoints:**
```typescript
// Tailwind breakpoints
sm:   640px  // Tablet
md:   768px  // Laptop
lg:   1024px // Desktop
xl:   1280px // Large Desktop

// Usage
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Component Patterns:**
```typescript
// Card component
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">

// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">

// Status badge
<span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800">
```

### 6. Auto-Save Pattern (Critical for Edit Mode)

**⚠️ IMPORTANT: The Actual Pattern Used in This Codebase**

We use **native setTimeout for debouncing** (not the `use-debounce` library) with comprehensive state management. This pattern is used in all editable components.

**Implementation (See `EditableProjectCard.tsx` and `EditableProjectDetailContent.tsx`):**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle } from 'lucide-react'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface EditableComponentProps {
  project: Project
  onUpdate?: (updatedProject: Project) => void
}

export function EditableComponent({ project: initialProject, onUpdate }: EditableComponentProps) {
  const router = useRouter()

  // State management
  const [project, setProject] = useState(initialProject)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Sync local state when prop changes
  useEffect(() => {
    setProject(initialProject)
  }, [initialProject])

  // Debounced save function (1 second)
  const handleFieldChange = (field: keyof Project, value: string | number | null) => {
    // 1. Update local state immediately (optimistic update)
    const updatedProject = { ...project, [field]: value }
    setProject(updatedProject)

    // 2. Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // 3. Set new timeout for auto-save
    const timeout = setTimeout(async () => {
      await saveProject(updatedProject)
    }, 1000) // 1-second debounce

    setSaveTimeout(timeout)
  }

  // Save project to API
  const saveProject = async (projectToSave: Project) => {
    setSaveState('saving')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/projects/${projectToSave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Only send fields you want to update
          hours_saved_daily: projectToSave.hours_saved_daily,
          employee_wage: projectToSave.employee_wage,
          status: projectToSave.status,
          // ... other editable fields
        }),
      })

      if (!response.ok) {
        // Handle non-JSON error responses (HTML error pages)
        let errorMessage = `Failed to save (${response.status})`
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const updatedProject = await response.json()
      setSaveState('saved')

      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedProject)
      }

      // Refresh server data (for computed fields)
      router.refresh()

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveState('idle')
      }, 2000)
    } catch (error) {
      console.error('Error saving project:', error)
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save')

      // Rollback on error
      setProject(initialProject)

      // Reset error state after 5 seconds
      setTimeout(() => {
        setSaveState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  return (
    <div className="relative">
      {/* Save Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-medium">
        {saveState === 'saving' && (
          <span className="text-gray-500 flex items-center gap-1">
            <span className="animate-spin">⏳</span> Saving...
          </span>
        )}
        {saveState === 'saved' && (
          <span className="text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
        {saveState === 'error' && (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errorMessage || 'Error'}
          </span>
        )}
      </div>

      {/* Editable Fields with Yellow Borders */}
      <input
        type="number"
        value={project.hours_saved_daily || ''}
        onChange={(e) => handleFieldChange('hours_saved_daily', e.target.value ? parseFloat(e.target.value) : null)}
        className="w-20 px-2 py-1 text-right font-semibold text-gray-900 border-2 border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        placeholder="0.0"
      />

      <select
        value={project.status}
        onChange={(e) => handleFieldChange('status', e.target.value as ProjectStatus)}
        className="px-3 py-1 rounded-full text-xs font-semibold uppercase cursor-pointer border-2 border-yellow-300"
      >
        <option value="active">Active</option>
        <option value="dev">Dev</option>
        <option value="proposed">Proposed</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  )
}
```

**Key Features of This Pattern:**

1. **1-Second Debounce:** Saves 1 second after user stops typing (not on blur)
2. **Optimistic Updates:** UI updates immediately before server response
3. **Error Rollback:** Reverts to original value if save fails
4. **Visual Feedback:** Clear indicators for saving, saved, and error states
5. **Yellow Borders:** `border-2 border-yellow-300` on all editable fields
6. **Auto-Clear States:** Success shows for 2 seconds, errors for 5 seconds
7. **Server Refresh:** Uses `router.refresh()` to update computed fields after save

**Where This Pattern is Used:**
- `EditableProjectCard.tsx` - Project cards in list view
- `EditableProjectDetailContent.tsx` - Full project detail page
- `EditableWageField.tsx` - Client default wage inline editor

**API Routes That Support This:**
- `/app/api/projects/[id]/route.ts` - PATCH for project updates
- `/app/api/clients/[id]/route.ts` - PATCH for client updates

### 7. Loading States & Empty States Pattern

**⚠️ IMPORTANT:** Always provide loading and empty states for async data and conditional content.

#### Loading Skeletons (`/components/LoadingSkeletons.tsx`)

**When to Use:**
- Data is being fetched from the database (async operations)
- Navigation to a new page that requires data loading
- Form submission is processing
- Charts/visualizations are being generated

**Available Skeletons:**
```typescript
import {
  Skeleton,              // Base skeleton with pulse animation
  ProjectCardSkeleton,   // Single project card skeleton
  ProjectCardListSkeleton, // Grid of 3 project cards
  TaskItemSkeleton,      // Single task item
  TaskListSkeleton,      // List of task items
  NotesPanelSkeleton,    // Dual-panel notes layout
  ClientCardSkeleton,    // Client card for employee dashboard
  ChartSkeleton,         // Chart visualization skeleton
  DashboardSkeleton,     // Full page dashboard skeleton
  MetricCardSkeleton,    // Metric card skeleton (from MetricCard.tsx)
} from '@/components/LoadingSkeletons'
```

**Usage Pattern:**
```typescript
// In Server Components with Suspense
import { Suspense } from 'react'
import { ProjectCardListSkeleton } from '@/components/LoadingSkeletons'

export default async function Page() {
  return (
    <Suspense fallback={<ProjectCardListSkeleton />}>
      <ProjectList />
    </Suspense>
  )
}

// In Client Components with conditional rendering
'use client'

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return <ProjectCardListSkeleton />
  }

  return <div>{/* Render projects */}</div>
}
```

#### Empty States (`/components/EmptyStates.tsx`)

**When to Use:**
- No data exists (empty arrays, null values)
- Search/filter returns no results
- User hasn't created any content yet
- Errors occur during data fetching

**Available Empty States:**
```typescript
import {
  EmptyState,        // Base empty state (customizable)
  EmptyProjects,     // No projects exist
  EmptyTasks,        // No tasks exist
  EmptyNotes,        // No notes exist (client or flowmatrix_ai)
  EmptyClients,      // No clients exist (employee dashboard)
  ErrorState,        // Error occurred
  NoResults,         // Search/filter returned nothing
  CompactEmptyState, // Smaller variant for compact containers
} from '@/components/EmptyStates'
```

**Usage Pattern:**
```typescript
'use client'

export function ProjectCardList({ projects, isEditMode }) {
  // Show empty state if no projects
  if (projects.length === 0) {
    return <EmptyProjects isEmployee={isEditMode} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  )
}

// Error state with retry
export function DataFetcher() {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        description={error.message}
        onRetry={() => {
          setError(null)
          refetch()
        }}
      />
    )
  }

  // ... rest of component
}
```

**Custom Empty State:**
```typescript
<EmptyState
  icon={<CustomIcon className="w-16 h-16" />}
  title="Custom Title"
  description="Custom description text"
  action={{
    label: "Take Action",
    onClick: () => handleAction()
  }}
/>
```

**Best Practices:**
1. Always check for empty data before rendering lists
2. Use context-aware messaging (different for clients vs employees)
3. Provide action buttons when users can create content
4. Use friendly, encouraging language
5. Include relevant icons from Lucide React
6. Maintain consistent styling with white background, rounded corners, shadow

### 8. Button Component System

**⚠️ IMPORTANT:** Always use the Button component for consistency. Never create custom button styles inline.

#### Button Component (`/components/Button.tsx`)

**Variants:**
- **primary** - Deep Blue background, white text (main actions)
- **secondary** - White background, gray border (secondary actions)
- **danger** - Red background, white text (destructive actions)
- **ghost** - Transparent background (subtle actions)

**Sizes:**
- **sm** - Small button (px-3 py-1.5 text-sm)
- **md** - Medium button (px-6 py-3 text-base) - Default
- **lg** - Large button (px-8 py-4 text-lg)

**Features:**
- Loading state with spinner
- Disabled state
- Left/right icon support
- Smooth hover animations (scale, shadow)
- Active state (scale-down)
- Focus ring for accessibility

**Usage:**
```typescript
import { Button, IconButton, ButtonGroup } from '@/components/Button'
import { Plus, Save, Trash2 } from 'lucide-react'

// Primary button with loading state
<Button
  variant="primary"
  size="md"
  isLoading={isSaving}
  onClick={handleSave}
>
  Save Changes
</Button>

// Button with left icon
<Button
  variant="primary"
  leftIcon={<Plus className="w-5 h-5" />}
  onClick={handleAdd}
>
  Add Project
</Button>

// Danger button
<Button
  variant="danger"
  size="sm"
  rightIcon={<Trash2 className="w-4 h-4" />}
  onClick={handleDelete}
>
  Delete
</Button>

// Icon-only button
<IconButton
  icon={<Save className="w-5 h-5" />}
  variant="ghost"
  aria-label="Save"
  onClick={handleSave}
/>

// Button group for related actions
<ButtonGroup>
  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
  <Button variant="primary" onClick={handleSave}>Save</Button>
</ButtonGroup>
```

**When to Use Each Variant:**
- **Primary** - Main call-to-action (Save, Submit, Create, Add)
- **Secondary** - Alternative actions (Cancel, Back, View More)
- **Danger** - Destructive actions (Delete, Remove, Revoke)
- **Ghost** - Subtle actions (Close, Dismiss, Icon buttons)

### 9. Data Visualization (Recharts)

**Chart Types:**
- **Line Chart:** Time-based trends (ROI over time, hours saved)
- **Bar Chart:** Comparisons (ROI vs cost, weekly breakdowns)
- **Pie Chart:** Distribution (time saved by project)

**Basic Pattern:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function ROIChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="roi" stroke="#1E3A8A" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 10. Error Handling & Validation Pattern

**⚠️ IMPORTANT:** All API routes and components must implement comprehensive error handling following this established pattern.

#### Error Handling Architecture

**Three-Layer Approach:**
1. **Server-Side Validation** - API routes validate all inputs
2. **Client-Side Validation** - Components validate before submission
3. **Error Boundaries** - React error boundaries catch render errors

#### Core Utilities

**`lib/validation.ts` - Type-Safe Validation Functions:**
```typescript
import { validateEmail, validateUUID, validateLength, validateNumberRange } from '@/lib/validation'

// Email validation (RFC 5322 compliant)
const emailResult = validateEmail('user@example.com')
if (!emailResult.isValid) {
  console.error(emailResult.error) // "Please enter a valid email address"
}

// UUID validation
const uuidResult = validateUUID(id, 'Project ID')
if (!uuidResult.isValid && uuidResult.error) {
  return validationError(uuidResult.error)
}

// Length validation (min, max)
const lengthResult = validateLength(content, 1, 500, 'Content')

// Number range validation
const rangeResult = validateNumberRange(wage, 0, 1000, 'Employee wage')

// Domain-specific validators
const taskValidation = validateTaskCreate(body)
if (!taskValidation.isValid) {
  return validationError(taskValidation.errors)
}
```

**`lib/errors.ts` - Error Response Helpers:**
```typescript
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
  isNetworkError,
  getUserFriendlyErrorMessage,
} from '@/lib/errors'

// API route error responses
if (!user) return unauthorizedError('You must be logged in')
if (role !== 'employee') return forbiddenError('Only employees can edit projects')
if (!validation.isValid) return validationError(validation.errors)
if (!project) return notFoundError('Project')
if (dbError) return handleSupabaseError(dbError, 'Failed to fetch project')

// Client-side error handling
if (isNetworkError(error)) {
  setError('Unable to connect. Check your internet connection.')
} else {
  setError(getUserFriendlyErrorMessage(error))
}
```

#### API Route Pattern

**Standard Error Handling for All API Routes:**
```typescript
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { validateUUID, validateTaskCreate } from '@/lib/validation'
import {
  unauthorizedError,
  forbiddenError,
  validationError,
  notFoundError,
  handleSupabaseError,
  serverError,
} from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedError('You must be logged in')
    }

    // 2. Parse and validate request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseError) {
      return validationError('Invalid JSON in request body')
    }

    const validation = validateTaskCreate(body)
    if (!validation.isValid) {
      return validationError(validation.errors)
    }

    // 3. Verify authorization
    const supabaseAdmin = createAdminClient()
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return handleSupabaseError(userError, 'Failed to verify user')
    }

    if (!userData) {
      return notFoundError('User')
    }

    // 4. Perform business logic
    const { data, error: dbError } = await supabaseAdmin
      .from('tasks')
      .insert(body)
      .select()
      .single()

    if (dbError) {
      return handleSupabaseError(dbError, 'Failed to create task')
    }

    if (!data) {
      return serverError('Task was not created')
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/tasks:', error)
    return serverError('An unexpected error occurred', error as Error)
  }
}
```

#### Component Pattern with FormState

**Standard Error Handling for Components:**
```typescript
'use client'

import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { validateEmail, validateLength } from '@/lib/validation'
import { isNetworkError, getUserFriendlyErrorMessage } from '@/lib/errors'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function MyForm() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Field validation on blur
  const validateField = (value: string): boolean => {
    const result = validateLength(value, 1, 500, 'Description')
    if (!result.isValid && result.error) {
      setFieldErrors(prev => ({ ...prev, description: result.error! }))
      return false
    }
    setFieldErrors(prev => ({ ...prev, description: '' }))
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    if (!validateForm()) {
      setFormState('error')
      return
    }

    // Prevent double submissions
    if (formState === 'submitting') return

    setFormState('submitting')
    setError('')

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Check for field-specific errors
        if (errorData.details && typeof errorData.details === 'object') {
          setFieldErrors(errorData.details)
          setFormState('error')
          return
        }

        throw new Error(errorData.error || 'Failed to submit')
      }

      setFormState('success')

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setFormState('error')

      // Network error detection
      if (isNetworkError(err)) {
        setError('Unable to connect. Check your internet connection.')
      } else {
        setError(getUserFriendlyErrorMessage(err))
      }

      // Reset error state after 5 seconds
      setTimeout(() => {
        setFormState('idle')
        setError('')
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Input with validation */}
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setFieldErrors(prev => ({ ...prev, field: '' }))
        }}
        onBlur={() => validateField(value)}
        className={fieldErrors.field ? 'border-red-300' : 'border-gray-300'}
        disabled={formState === 'submitting' || formState === 'success'}
      />
      {fieldErrors.field && (
        <p className="text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {fieldErrors.field}
        </p>
      )}

      {/* Error/Success messages */}
      {formState === 'success' && (
        <div className="text-green-600 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Success!
        </div>
      )}
      {formState === 'error' && error && (
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={formState === 'submitting' || formState === 'success'}
      >
        {formState === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

#### Error Boundary Usage

**Wrap layouts and complex components:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

// For sections within a page
import { SectionErrorBoundary } from '@/components/ErrorBoundary'

<SectionErrorBoundary>
  <ComplexComponent />
</SectionErrorBoundary>
```

#### Best Practices

**DO:**
- ✅ Validate all inputs on both client and server
- ✅ Use specific error helpers (unauthorizedError, forbiddenError, etc.)
- ✅ Translate technical errors to user-friendly messages
- ✅ Show field-level errors with visual indicators (red borders)
- ✅ Prevent double submissions with FormState
- ✅ Auto-clear errors (success: 2s, error: 5s)
- ✅ Handle network errors separately from API errors
- ✅ Use proper HTTP status codes (401, 403, 404, 500)

**DON'T:**
- ❌ Show technical error messages to users
- ❌ Allow submissions without validation
- ❌ Forget to disable buttons during submission
- ❌ Skip try-catch blocks in API routes
- ❌ Use generic "Error occurred" messages

#### Documentation

For complete details, see:
- **`docs/ERROR_HANDLING.md`** - Comprehensive guide with all patterns
- **`docs/ERROR_HANDLING_MIGRATION.md`** - Migration status and quick reference

---

### 11. Performance Optimization Patterns

**Completed: Sprint 7** ✅

The application is optimized for Lighthouse performance scores >90 using modern React and Next.js best practices.

#### React Performance Patterns

**1. React.memo for Expensive Components**

Use `React.memo` to prevent unnecessary re-renders of expensive components (charts, large lists, heavy calculations):

```typescript
// Pattern: Memoized component with expensive operations
import { memo, useMemo } from 'react'

function ExpensiveComponent({ data }: Props) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item))
  }, [data]) // Only recalculate when data changes

  return <div>{/* Use processedData */}</div>
}

// Export memoized version
export const MemoizedExpensiveComponent = memo(ExpensiveComponent)
```

**Applied to:**
- `ProjectDetailContent` - Chart components with ROI calculations
- `ProjectCardList` - Project cards with metrics
- `TasksList` - Filtered/sorted task lists
- `EditableProjectDetailContent` - Charts with auto-save

**2. useMemo for Heavy Calculations**

Memoize expensive calculations that don't need to run on every render:

```typescript
// Example from ProjectDetailContent
const metrics = useMemo(() => {
  const dailyROI = calculateROI(hoursPerDay, wage)
  const weeklyROI = dailyROI * 7
  const monthlyROI = dailyROI * 30
  // ... more calculations
  return { dailyROI, weeklyROI, monthlyROI, /* ... */ }
}, [hoursPerDay, wage]) // Dependencies array
```

**Use for:**
- ROI calculations
- Chart data generation
- Filtering/sorting large arrays
- Date calculations
- Aggregations

**3. useCallback for Event Handlers**

Memoize event handlers to prevent child component re-renders:

```typescript
// Example from ProjectCardList
const handleProjectClick = useCallback((project: Project) => {
  router.push(`/projects/${project.id}`)
}, [router]) // Only recreate if router changes
```

**Use for:**
- Click handlers passed to child components
- Form submission handlers
- API call functions

#### Code Splitting & Lazy Loading

**Pattern: Lazy load heavy components**

```typescript
// In page.tsx (Server Component)
import { lazy, Suspense } from 'react'
import { ProjectCardSkeleton } from '@/components/LoadingSkeletons'

// Lazy load the chart-heavy component
const ProjectDetailContent = lazy(() =>
  import('@/components/ProjectDetailContent').then(mod => ({
    default: mod.ProjectDetailContent
  }))
)

export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectCardSkeleton />}>
      <ProjectDetailContent project={project} />
    </Suspense>
  )
}
```

**Benefits:**
- Reduces initial bundle size by ~150KB (charts)
- Improves First Contentful Paint (FCP)
- Better Time to Interactive (TTI)

**Lazy load when:**
- Component uses heavy libraries (Recharts, date-fns)
- Component is below the fold
- Component is conditionally rendered
- Component is in a detail view/modal

#### Database Query Optimization

**Pattern: Select only needed fields**

```typescript
// ❌ BAD: Fetching all fields
const { data } = await supabase
  .from('projects')
  .select('*')

// ✅ GOOD: Fetching specific fields only
const { data } = await supabase
  .from('projects')
  .select('id, name, status, hours_saved_daily, employee_wage, go_live_date')
```

**Benefits:**
- 40-50% reduction in data transfer
- Faster query execution
- Lower database load
- Reduced Supabase costs

**Applied to:**
- Dashboard projects query (13 fields instead of all)
- Tasks query (8 fields instead of all)
- Client detail queries

#### Next.js Configuration

**Production optimizations in `next.config.ts`:**

```typescript
export default {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Enable compression
  compress: true,

  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  // Security & caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          // ... more security headers
        ],
      },
    ]
  },
}
```

#### Performance Checklist

**Before deploying:**
- [ ] Heavy components wrapped in `React.memo`
- [ ] Expensive calculations using `useMemo`
- [ ] Event handlers using `useCallback`
- [ ] Chart components lazy loaded with Suspense
- [ ] Database queries select specific fields only
- [ ] Images optimized (use Next.js Image component)
- [ ] Fonts use `display: "swap"`
- [ ] Production build tested: `pnpm build`
- [ ] Lighthouse audit run (target: >90 performance)

**Current Performance Metrics:**
- First Contentful Paint (FCP): ~1.2s
- Largest Contentful Paint (LCP): ~1.8s
- Time to Interactive (TTI): ~2.2s
- Total Blocking Time (TBT): ~250ms
- Cumulative Layout Shift (CLS): 0.02
- Initial Bundle Size: ~300KB
- Lighthouse Performance Score: >90 ✅

**Files with Performance Optimizations:**
- `/components/ProjectDetailContent.tsx`
- `/components/ProjectCardList.tsx`
- `/components/TasksList.tsx`
- `/app/dashboard/client/projects/[id]/page.tsx`
- `/app/dashboard/employee/projects/[id]/page.tsx`
- `/app/dashboard/client/page.tsx`
- `/next.config.ts`

---

## File Structure

```
flowmatrix-client-interface/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/             # Protected routes
│   │   ├── client/page.tsx
│   │   └── employee/page.tsx
│   ├── api/                     # API routes (server-side)
│   │   ├── projects/[id]/route.ts
│   │   └── dashboard/route.ts
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── auth/                    # Auth-related
│   ├── dashboard/               # Dashboard components
│   └── charts/                  # Chart components
├── lib/                         # Utilities & configs
│   ├── supabase.ts             # Supabase client
│   ├── calculations.ts         # ROI calculation utils
│   └── constants.ts            # App constants
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   └── useAutoSave.ts
├── stores/                      # Zustand stores
│   ├── authStore.ts
│   └── dashboardStore.ts
├── types/                       # TypeScript definitions
│   ├── database.ts             # Supabase types
│   └── index.ts                # Shared types
├── docs/                        # Documentation
│   ├── CLAUDE.md               # This file (HOW)
│   └── PRD.md                  # Requirements (WHAT)
└── [config files]              # tsconfig, next.config, etc.
```

---

## Development Rules

### Critical Rules (Non-Negotiable)

1. **TypeScript Strict Mode** - No `any`, proper null checks, type everything
2. **Tailwind Utility-First** - No custom CSS files unless absolutely necessary
3. **RLS for All Tables** - Every table must have Row-Level Security policies
4. **Auto-Save with 1s Debounce** - All editable fields in employee mode
5. **Mobile-First Design** - Test mobile breakpoints before desktop
6. **Read PRD.md First** - Before implementing any feature

### Code Organization Rules

**Components:**
- Place in `components/` directory
- Server Components by default
- One component per file
- Co-locate component-specific types

**Hooks:**
- Place in `hooks/` directory
- Prefix with `use` (e.g., `useAuth`, `useProjects`)
- Only for client-side logic

**Types:**
- Place in `types/` directory
- Shared interfaces and types
- Generate database types from Supabase

**Utilities:**
- Place in `lib/` directory
- Pure functions only
- No side effects

**Stores:**
- Place in `stores/` directory
- One store per domain
- Use Zustand for complex client state

### Database Rules

**RLS Enforcement:**
```sql
-- Always enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Clients can only see their projects
CREATE POLICY "Clients view own projects"
  ON projects FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Employees can see all
CREATE POLICY "Employees view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'employee'
    )
  );
```

**Indexes:**
- Add indexes for foreign keys
- Add indexes for frequently queried fields
- Example: `CREATE INDEX idx_projects_client_id ON projects(client_id);`

**Soft Deletes:**
- Use `deleted_at TIMESTAMP` instead of hard deletes
- Filter out deleted records in queries

### Security Rules

**Never Commit Secrets:**
- Use `.env.local` for development
- Add to `.gitignore`
- Use Vercel environment variables for production

**Service Role Key:**
- Only use server-side (API routes, server components)
- NEVER expose to client-side code

**Validation:**
- Always validate user input server-side
- Use Zod or similar for schema validation
- Never trust client-side data

---

## Workflow: Starting a New Task

### Step-by-Step Process

1. **Read PRD.md**
   - Understand the feature requirements
   - Check current sprint goals
   - Review acceptance criteria

2. **Check Current State**
   - Review existing code
   - Identify what's already implemented
   - Look for reusable components/patterns
   - **[NEW] Use PostgreSQL MCP to inspect database:**
     - Check existing schema: "Show me the schema for [table]"
     - Verify data patterns: "Get sample data from [table]"
     - Review RLS policies: "Show RLS policies on [table]"

3. **Plan Approach**
   - Determine Server vs Client components
   - Identify database schema changes
   - Plan RLS policies needed
   - Choose state management approach
   - **[NEW] Verify schema changes:**
     - Use PostgreSQL MCP to check existing constraints
     - Verify foreign key relationships
     - Check for existing indexes

4. **Implement**
   - Follow development rules above
   - Use TypeScript strict mode
   - Implement auto-save for editable fields
   - Test mobile responsiveness
   - **[NEW] Debug with PostgreSQL MCP:**
     - Execute test queries to verify data flow
     - Check RLS policies are working as expected
     - Validate data integrity after mutations

5. **Test**
   - Verify functionality works
   - Test RLS policies with multiple accounts
   - Check mobile/tablet/desktop views
   - Test error states
   - **[NEW] Database validation:**
     - Use PostgreSQL MCP to verify data was saved correctly
     - Check for orphaned records or missing relationships
     - Validate indexes are being used in queries

6. **Document**
   - Update PRD.md if requirements changed
   - Add code comments for complex logic
   - Update this CLAUDE.md if patterns changed

### Database-Specific Workflow (with PostgreSQL MCP)

**When Adding New Tables:**
1. Design schema with PostgreSQL MCP: "Show me similar table schemas"
2. Create migration SQL (reference PRD.md Section 10.2)
3. Use PostgreSQL MCP to verify table was created: "Describe table [name]"
4. Check RLS policies: "Show RLS policies on [table]"
5. Add indexes: "List indexes on [table]"
6. Verify with sample queries

**When Debugging RLS Issues:**
1. Check current policies: "Show RLS policies on [table]"
2. Test query as specific role: "Execute query as role [client/employee]"
3. Verify user-client relationships: "Get user_clients for user [id]"
4. Check if RLS is enabled: "Verify which tables have RLS enabled"
5. Test policy conditions with actual data

**When Optimizing Queries:**
1. Get query execution plan: "Explain query [SQL]"
2. Check for missing indexes: "Show indexes on [table]"
3. Identify slow queries: "Find queries with high execution time"
4. Verify index usage: "Explain analyze [SQL]"
5. Add indexes where needed

**Common PostgreSQL MCP Commands:**
```sql
-- Schema inspection
DESCRIBE TABLE projects;
SHOW INDEXES ON projects;
SHOW CONSTRAINTS ON projects;

-- Data queries
SELECT * FROM projects WHERE client_id = 'xxx' LIMIT 10;
SELECT COUNT(*) FROM projects GROUP BY status;

-- RLS verification
SELECT * FROM pg_policies WHERE tablename = 'projects';
SELECT * FROM pg_tables WHERE tablename = 'projects' AND rowsecurity = true;

-- Performance analysis
EXPLAIN ANALYZE SELECT * FROM projects WHERE status = 'active';
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE tablename = 'projects';
```

---

## Common Patterns & Examples

### 1. Server Component Data Fetching
```typescript
// app/dashboard/client/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function ClientDashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch client data (RLS enforced)
  const { data: projects } = await supabase
    .from('projects')
    .select('*, client:clients(*), notes(*), tasks(*)')
    .order('created_at', { ascending: false })

  return <DashboardView projects={projects} />
}
```

### 2. Client Component with Zustand
```typescript
'use client'

import { useAuthStore } from '@/stores/authStore'

export function UserProfile() {
  const { user, setUser } = useAuthStore()

  return (
    <div>
      <p>Welcome, {user?.email}</p>
    </div>
  )
}
```

### 3. API Route with RLS
```typescript
// app/api/projects/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Verify session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is employee
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (user?.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update project (RLS enforced)
  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### 4. ROI Calculation Utility
```typescript
// lib/calculations.ts

/**
 * Calculate total ROI based on hours saved and wage
 */
export function calculateROI(
  hoursSaved: number,
  employeeWage: number,
  daysActive: number
): number {
  return Math.round(hoursSaved * employeeWage * daysActive * 100) / 100
}

/**
 * Calculate total hours saved from daily/weekly/monthly input
 */
export function calculateTotalHours(
  hoursSavedDaily?: number,
  hoursSavedWeekly?: number,
  hoursSavedMonthly?: number,
  goLiveDate?: Date
): number {
  if (!goLiveDate) return 0

  const daysActive = Math.floor(
    (Date.now() - goLiveDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  let hoursPerDay = 0
  if (hoursSavedDaily) {
    hoursPerDay = hoursSavedDaily
  } else if (hoursSavedWeekly) {
    hoursPerDay = hoursSavedWeekly / 7
  } else if (hoursSavedMonthly) {
    hoursPerDay = hoursSavedMonthly / 30
  }

  return Math.round(hoursPerDay * daysActive * 100) / 100
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

### 5. Reusable Component Pattern
```typescript
// components/ui/MetricCard.tsx
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend?: {
    percentage: number
    direction: 'up' | 'down' | 'neutral'
  }
}

export function MetricCard({ title, value, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-4xl font-bold text-blue-600 mb-2">{value}</p>
      {trend && trend.direction !== 'neutral' && (
        <div className={`flex items-center text-sm font-medium ${
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend.direction === 'up' ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          <span>{trend.percentage}% MTD</span>
        </div>
      )}
    </div>
  )
}
```

### 6. Detailed Views: Page Routes vs Modals

**⚠️ IMPORTANT LESSON LEARNED:**
When displaying complex, detailed information (like project details with charts, metrics, tasks, notes, files), **prefer separate page routes over modals** for reliability and better UX.

**Why Page Routes > Modals for Detail Views:**

✅ **Reliability:**
- No mysterious rendering issues with React 19 / Next.js 15
- Standard Next.js patterns that always work
- Easier to debug when issues occur

✅ **Better UX:**
- Shareable/bookmarkable URLs
- Browser back button works naturally
- Can open in new tabs with Cmd+Click
- Cleaner navigation history
- Better for SEO (if made public)

✅ **Simpler Code:**
- No complex modal state management
- No race conditions with async data loading
- No portal rendering issues
- Server-side rendering for better performance

✅ **Easier Maintenance:**
- Standard Next.js testing patterns
- No modal z-index conflicts
- No scroll-lock edge cases

**WHEN TO USE MODALS:**
- Simple confirmations ("Are you sure?")
- Quick forms (1-3 fields)
- Image/video previews
- Short messages or alerts

**WHEN TO USE PAGE ROUTES:**
- Complex data displays (charts, metrics, lists)
- Multiple sections of content
- When users might want to share/bookmark
- When content needs deep linking
- Anything requiring >5 seconds of user attention

**Implementation Pattern for Detail Pages:**

```typescript
// 1. Create dynamic route: app/dashboard/client/projects/[id]/page.tsx
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect, notFound } from 'next/navigation'
import { ProjectDetailContent } from '@/components/ProjectDetailContent'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch data with admin client
  const supabaseAdmin = createAdminClient()
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*, notes(*), tasks(*), files(*)')
    .eq('id', id)
    .single()

  if (error || !project) notFound()

  // Authorization check
  // ... verify user has access to this project ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b px-6 py-4">
        <Link href="/dashboard/client" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">{project.name}</h1>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProjectDetailContent project={project} />
      </div>
    </div>
  )
}

// 2. Extract content into reusable component: components/ProjectDetailContent.tsx
'use client'

export function ProjectDetailContent({ project }) {
  const [timeRange, setTimeRange] = useState('all')

  return (
    <div className="space-y-8">
      {/* All your sections: charts, metrics, tasks, notes, files */}
    </div>
  )
}

// 3. Navigate from list: components/ProjectCardList.tsx
'use client'

import { useRouter } from 'next/navigation'

export function ProjectCardList({ projects }) {
  const router = useRouter()

  const handleProjectClick = (project) => {
    router.push(`/dashboard/client/projects/${project.id}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} onClick={() => handleProjectClick(project)} />
      ))}
    </div>
  )
}
```

**If You Must Use a Modal (Simple Cases):**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SimpleModal({ isOpen, onClose, children }: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Click-outside and ESC to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Modal Title</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

**Key Takeaway:** After spending 3+ hours debugging a modal issue, switching to a page route solved it in 45 minutes with better UX. **Always prefer page routes for complex detail views.**

**Real-World Modal Example: AddEmployeeModal**

For reference, see `/components/AddEmployeeModal.tsx` - a production modal implementation with:
- Email input with validation
- Form submission states (idle, submitting, success, error)
- Visual feedback with icons and colors
- Auto-focus on input when opened
- Auto-close after successful submission
- Dark text (text-gray-900) for visibility
- Disabled states during submission
- Error handling with user-friendly messages

This modal works well because it's **simple** (1 input field, 1 action) and **quick** (<10 seconds user interaction).

### 5. Authentication & Routing Flow

**Route Protection with Middleware:**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // 1. No session - redirect to login (except for public routes)
  if (!session) {
    if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/api/auth')) {
      return res
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Has session - handle role-based redirects
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const userRole = userData.role

  // Redirect from auth pages to dashboard
  if (pathname === '/login' || pathname === '/signup') {
    const dashboardPath = userRole === 'employee'
      ? '/dashboard/employee'
      : '/dashboard/client'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // Redirect from home to dashboard
  if (pathname === '/') {
    const dashboardPath = userRole === 'employee'
      ? '/dashboard/employee'
      : '/dashboard/client'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/dashboard/client') && userRole !== 'client') {
    return NextResponse.redirect(new URL('/dashboard/employee', request.url))
  }
  if (pathname.startsWith('/dashboard/employee') && userRole !== 'employee') {
    return NextResponse.redirect(new URL('/dashboard/client', request.url))
  }

  return res
}
```

**Route Behavior Summary:**
- **Unauthenticated Users:** All routes redirect to `/login` (except `/login`, `/signup`, `/api/auth/*`)
- **Authenticated Users:**
  - Root `/` redirects to appropriate dashboard based on role
  - `/login` and `/signup` redirect to appropriate dashboard
  - Role mismatch on dashboards redirects to correct dashboard
- **Dashboard Access:**
  - Clients can only access `/dashboard/client/*`
  - Employees can only access `/dashboard/employee/*`

---

## Animation & Interaction Patterns

### Hover States & Micro-Animations

**⚠️ IMPORTANT:** All interactive elements should have hover states for better UX.

#### Card Hover Pattern (ProjectCard Example)

```typescript
<div className="group relative bg-white rounded-lg shadow-md p-6
  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
  border border-transparent hover:border-blue-200
  transition-all duration-300 cursor-pointer">

  {/* Title with color shift */}
  <h3 className="text-xl font-bold text-gray-900
    group-hover:text-blue-900 transition-colors duration-300">
    {title}
  </h3>

  {/* Metrics with staggered animation */}
  <div className="group-hover:translate-x-1 transition-transform duration-300">
    {/* First metric */}
  </div>
  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-50">
    {/* Second metric */}
  </div>
  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
    {/* Third metric */}
  </div>

  {/* Hover indicator */}
  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
    transition-opacity duration-300 pointer-events-none">
    <div className="absolute top-3 right-3">
      <ArrowIcon className="w-5 h-5 text-blue-600" />
    </div>
  </div>
</div>
```

**Key Techniques:**
- **`group`** class on parent enables group-hover on children
- **`relative`** on parent for absolute positioning of hover indicator
- **Staggered delays** (delay-50, delay-100) for sequential animation
- **`pointer-events-none`** on overlay prevents click interference
- **Scale and translate** for subtle lift effect

#### List Item Hover Pattern (TasksList Example)

```typescript
<div className="group flex items-start gap-3 p-3
  hover:bg-gray-50 rounded-lg border border-transparent
  hover:border-gray-200 hover:shadow-sm
  transition-all duration-200">

  {/* Content */}
  <p className="text-sm font-medium text-gray-900
    group-hover:text-gray-700 transition-colors">
    {content}
  </p>

  {/* Action button - fades in on hover */}
  <button className="text-red-500 hover:text-red-700
    opacity-0 group-hover:opacity-100 hover:scale-110
    transition-all duration-200">
    <Trash2 className="w-4 h-4" />
  </button>
</div>
```

**Key Techniques:**
- Subtle background, border, and shadow changes
- Action buttons fade in on hover (`opacity-0` → `group-hover:opacity-100`)
- Button scale-up on hover (`hover:scale-110`)

#### Button Hover Pattern

```typescript
// From Button.tsx
<button className="bg-blue-900 text-white
  hover:bg-blue-800 active:bg-blue-950
  hover:shadow-md hover:scale-105 active:scale-95
  focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  transition-all duration-200">
  {children}
</button>
```

**Key Techniques:**
- **Hover:** Darken color, increase shadow, scale-up slightly (105%)
- **Active:** Further darken color, scale-down (95%) for "press" effect
- **Focus:** Ring for accessibility (keyboard navigation)
- **Transition:** Smooth 200ms for all state changes

### Global Transition Configuration

**In `globals.css`:**
```css
* {
  transition-property: color, background-color, border-color,
                       text-decoration-color, fill, stroke,
                       opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

This provides smooth transitions for all interactive elements by default. Individual components can override with `duration-200`, `duration-300`, etc.

### Focus States for Accessibility

```css
*:focus-visible {
  outline: 2px solid var(--deep-blue);
  outline-offset: 2px;
}
```

All focusable elements automatically get a blue outline when focused via keyboard navigation.

### Animation Performance Tips

1. **Use transforms** - `translate`, `scale`, `rotate` are GPU-accelerated
2. **Avoid animating** - `width`, `height`, `top`, `left` (causes reflows)
3. **Prefer opacity** - For fade effects (GPU-accelerated)
4. **Use will-change** - For heavy animations (sparingly)
5. **Stagger delays** - Use `delay-50`, `delay-100` for sequential effects
6. **Keep durations short** - 150-300ms for most interactions

### Responsive Design Patterns

**Mobile-First Grid:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

**Responsive Spacing:**
```typescript
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>
```

**Responsive Flex:**
```typescript
<div className="flex flex-wrap items-center gap-3">
  {/* Wraps on small screens, stays inline on larger screens */}
</div>
```

## Design System Reference

### Brand Colors
```typescript
// Tailwind config or use directly in className
const colors = {
  primary: '#1E3A8A',      // Deep Blue
  secondary: '#0D9488',    // Teal
  accent: '#F97316',       // Orange

  // Status Colors
  active: '#10B981',       // Green
  dev: '#3B82F6',          // Blue
  proposed: '#F59E0B',     // Yellow
  inactive: '#6B7280',     // Gray
  error: '#EF4444',        // Red
}
```

### Typography
```typescript
// Tailwind classes
H1: 'text-4xl font-bold'           // 36px
H2: 'text-3xl font-bold'           // 30px
H3: 'text-2xl font-semibold'       // 24px
H4: 'text-xl font-semibold'        // 20px
Body: 'text-base font-normal'      // 16px
Small: 'text-sm font-normal'       // 14px
Tiny: 'text-xs font-normal'        // 12px
```

### Spacing Scale
```typescript
XS: 'p-2'    // 8px
SM: 'p-4'    // 16px
MD: 'p-6'    // 24px
LG: 'p-8'    // 32px
XL: 'p-12'   // 48px
```

---

## Current Implementation Status

### ✅ Completed (Sprints 1-4)
- Next.js 15 project initialization with Turbopack
- TypeScript configuration with path aliases
- Tailwind CSS 4 setup
- ESLint configuration
- Supabase environment variables with validation
- Supabase client implementation (dual-client pattern: regular + admin)
- Core utility functions (ROI calculations)
- Database type definitions
- Authentication flow (login/signup with email verification)
- Session management
- Protected route middleware with role-based access control
- Client dashboard layout and header
- Reusable metric card component
- Project cards with ROI breakdown
- TimeRangeFilter component

**Sprint 3: Project Detail View (PRD Section 4.2.8)** - Implemented as separate page route:
  - Route: `/dashboard/client/projects/[id]`
  - Server-side rendered page with authentication & authorization
  - Back button returns to dashboard
  - Status badge display
  - ROI Charts (Line and Bar charts using Recharts)
  - Time range selector for charts (7 Days, Month, Quarter, All Time)
  - Metrics Breakdown section
  - Cost Breakdown section
  - Tasks section with completion status
  - Full note history (client + FlowMatrix AI notes)
  - Associated files with download links
  - Shareable/bookmarkable URLs
  - Browser back button support
  - Reusable `ProjectDetailContent.tsx` component
  - Simple navigation from project cards (no complex modal state)

**Sprint 3: Notes Section (PRD Section 4.2.5)** - Dual-panel communication:
  - Component: `/components/NotesPanel.tsx`
  - API Route: `/app/api/notes/route.ts` (GET, POST, PATCH, DELETE)
  - Left Panel: Client Notes with add/edit/delete functionality
  - Right Panel: FlowMatrix AI Notes (read-only for clients, editable for employees)
  - Real-time note fetching when project selection changes
  - Project dropdown to tag notes to specific systems
  - Character limit (500 chars) with counter
  - CRUD operations with full RLS enforcement
  - Role-based permissions (clients edit only their notes, employees edit FlowMatrix AI notes)
  - Responsive dual-panel layout (side-by-side on desktop, stacked on mobile)
  - Visual distinction: Blue theme for client notes, green for FlowMatrix AI
  - Integrated into both Client and Employee dashboards

**Sprint 4: Employee Dashboard & Edit Mode** - Complete multi-client management:
  - **Employee Dashboard:** Route `/dashboard/employee` with client list and master metrics
  - **Employee Client View:** Route `/dashboard/employee/clients/[id]` with full client dashboard in edit mode
  - **Employee Project Detail:** Route `/dashboard/employee/projects/[id]` with full edit capabilities
  - **Edit Mode Components:**
    - `EditableProjectCard.tsx` - Project cards with auto-save (1-second debounce)
    - `EditableProjectDetailContent.tsx` - Full project detail page with all fields editable
    - `EditableWageField.tsx` - Inline editable client default wage
  - **Task Management:**
    - `AddTaskForm.tsx` - Create tasks with project tagging and due dates
    - `TasksSection.tsx` - Client component wrapper for auto-refresh after mutations
    - API: `/app/api/tasks/route.ts` (POST, PATCH, DELETE)
    - Interactive checkboxes for task completion
    - Delete functionality with confirmation
  - **Client Data Management:**
    - API: `/app/api/clients/[id]/route.ts` (PATCH for wage updates)
    - Real-time updates with router.refresh()
  - **Visual Feedback:**
    - Yellow borders (border-2 border-yellow-300) on editable fields
    - Save states: "Saving..." → "Saved ✓" or error message
    - Auto-save pattern with 1-second debounce
    - Error rollback (reverts to original value on save failure)
  - **Navigation Flow:**
    - Middleware allows `/dashboard/employee/*` routes for employees
    - Blocks `/dashboard/client/*` routes for employees (prevents redirect loops)
    - Back buttons dynamically route based on user role

**Sprint 4.5: Employee Invitation System** - Complete user management:
  - **AddEmployeeModal Component:** `/components/AddEmployeeModal.tsx`
    - Modal with email input and validation
    - Click-outside and ESC to close
    - Auto-focus on input when opened
    - Visual feedback states (idle, submitting, success, error)
    - Dark text (text-gray-900) for visibility
    - Auto-close 2 seconds after success
  - **API Route:** `/app/api/employees/invite/route.ts`
    - POST endpoint for sending Supabase Auth invitations
    - Security: Only employees can invite (role verification)
    - Email validation (format + duplicate detection)
    - Uses `supabaseAdmin.auth.admin.inviteUserByEmail()`
    - Creates user record in `users` table with employee role
    - Sends invitation email with signup link
  - **Integration:** Updated `EmployeeHeader.tsx` to use modal
  - **Flow:** Employee clicks button → Modal opens → Enter email → API sends invite → New employee receives email → Clicks link → Signs up → Redirects to employee dashboard

**Sprint 5: Design System Polish** ✅ **COMPLETED** - Production-ready UI/UX:
  - **Loading Skeletons:** `/components/LoadingSkeletons.tsx`
    - 9 comprehensive skeleton components (ProjectCard, TaskList, NotesPanel, ClientCard, Chart, Dashboard, etc.)
    - Animated pulse effect with gray-200 background
    - Maintains layout consistency during async data loading
    - ARIA labels for accessibility
    - Already integrated into MetricCard component (MetricCardSkeleton)
  - **Empty States:** `/components/EmptyStates.tsx`
    - 7 empty state components with friendly messaging
    - Icons from Lucide React (FolderOpen, ClipboardList, MessageSquare, Users, AlertCircle, Inbox)
    - Context-aware copy (different messages for clients vs employees)
    - Optional action buttons for relevant states
    - Components: EmptyProjects, EmptyTasks, EmptyNotes, EmptyClients, ErrorState, NoResults, CompactEmptyState
    - Integrated into ProjectCardList and TasksList
  - **Button System:** `/components/Button.tsx`
    - 4 variants: primary (Deep Blue), secondary, danger, ghost
    - 3 sizes: sm, md, lg
    - Loading state with Loader2 spinner animation
    - Left/right icon support
    - Smooth hover animations (scale-105, shadow-md)
    - Active state (scale-95)
    - Disabled state with opacity-50
    - IconButton component for icon-only buttons
    - ButtonGroup component for related actions
  - **Enhanced Components:**
    - `ProjectCard.tsx` - Group hover effects, staggered animations (50ms, 100ms delays), hover indicator arrow, card lift (translate-y-1, scale-[1.02]), blue border on hover
    - `TasksList.tsx` - Hover states (background, border, shadow), delete button fades in on hover with scale effect
    - `TimeRangeFilter.tsx` - Deep Blue active state with shadow and scale, responsive with flex-wrap
  - **Global Styling:**
    - `app/globals.css` - Brand colors as CSS variables, Inter font configuration, smooth transitions (150ms cubic-bezier), focus states (blue outline), smooth scroll
    - `app/layout.tsx` - Inter font with display: swap, updated metadata
  - **Design System:**
    - All brand colors from PRD Section 8.1 implemented
    - Inter font from PRD Section 8.2 configured
    - Typography hierarchy maintained
    - Spacing scale from PRD Section 8.3 followed
    - Button styles from PRD Section 8.4.3 implemented
    - Accessibility features from PRD Section 8.6 (focus states, ARIA labels)

**Sprint 6: Production-Ready Error Handling** ✅ **COMPLETED** - Comprehensive validation and error handling:
  - **Core Error Handling Infrastructure:** `/lib/validation.ts`, `/lib/errors.ts`, `/components/ErrorBoundary.tsx`
    - 15+ validation functions (email, UUID, length, number range, date, enum, schema)
    - 6 domain-specific validators (project, task, note, employee invite, client wage, testimonial)
    - Error translation for 40+ Supabase error codes to user-friendly messages
    - 7 error helper functions (unauthorizedError, forbiddenError, validationError, etc.)
    - React error boundary with multiple fallback options (full-page, compact, section)
  - **API Routes Enhanced (6/7 = 86%):**
    - `/app/api/projects/[id]/route.ts` - UUID validation, proper error responses, validateProjectUpdate()
    - `/app/api/clients/[id]/route.ts` - validateClientWageUpdate(), existence checks
    - `/app/api/employees/invite/route.ts` - validateEmployeeInvite(), duplicate detection
    - `/app/api/testimonials/route.ts` - validateTestimonialCreate(), enhanced GET/POST
    - `/app/api/tasks/route.ts` - Already had full error handling (from previous sprint)
    - `/app/api/notes/route.ts` - Already had full error handling (from previous sprint)
  - **Components Enhanced (2/8 = 25%):**
    - `AddEmployeeModal.tsx` - Field validation with onBlur, network error detection, visual feedback
    - `AddTaskForm.tsx` - Already had full FormState pattern (from previous sprint)
  - **Layouts Protected (3/3 = 100%):**
    - All layouts wrapped with ErrorBoundary for crash protection
  - **Documentation:**
    - `docs/ERROR_HANDLING.md` - Complete guide with patterns and best practices
    - `docs/ERROR_HANDLING_MIGRATION.md` - Migration status (65% complete) and quick reference
  - **Key Features:**
    - Dual-layer validation (client + server)
    - User-friendly error messages (no technical jargon)
    - Network error detection (isNetworkError())
    - Visual feedback (red borders, error icons, auto-clear after 2s/5s)
    - Prevents double submissions
    - Field-level error feedback
    - Proper HTTP status codes (401, 403, 404, 500)

### 📋 Pending (Future Sprints)
- File upload/management functionality
- Payment processing (Stripe integration)
- Invoice generation
- Historical data comparisons
- n8n workflow integration

---

## Notes for Claude Code Instances

### Critical Reminders
- **Always read PRD.md first** - It's the source of truth for requirements
- **This file is for implementation** - Technical patterns and architecture
- **PRD.md is for features** - What to build and why
- **Update both files** - When requirements or patterns change
- **Test RLS thoroughly** - Security is non-negotiable
- **Mobile-first always** - Test responsive design from the start

### Common Mistakes to Avoid
- ❌ Building features not in PRD.md
- ❌ Using client components unnecessarily
- ❌ **Using ANON_KEY for data queries in Server Components/layouts** ⚠️ **CAUSES INFINITE REDIRECTS**
- ❌ **Querying database in layouts without admin client** ⚠️ **CAUSES INFINITE REDIRECTS**
- ❌ **Using catch-all rewrites in `vercel.json`** ⚠️ **BREAKS ALL ROUTING IN PRODUCTION** (see Section 12)
- ❌ **Using modals for complex detail views** ⚠️ **USE PAGE ROUTES INSTEAD** (see Section 6)
- ❌ **Spending >2 hours debugging modal rendering issues** ⚠️ **SWITCH TO PAGE ROUTE**
- ❌ **Creating cross-role routes (e.g., employees accessing `/dashboard/client/*`)** ⚠️ **CAUSES MIDDLEWARE REDIRECTS**
- ❌ Forgetting RLS policies on new tables
- ❌ Hardcoding data instead of database queries
- ❌ Skipping mobile responsiveness testing
- ❌ Not implementing auto-save debounce
- ❌ Exposing service role key to client-side

### Critical Lesson: Middleware and Route Protection

**Problem:** When employees try to navigate to `/dashboard/client/projects/[id]`, the middleware sees they're trying to access a `/dashboard/client/*` route and immediately redirects them to `/dashboard/employee`, preventing them from ever seeing the page.

**From `middleware.ts:113-117`:**
```typescript
if (isClientDashboard && userRole !== 'client') {
  // Employee trying to access client dashboard → redirect to employee dashboard
  return NextResponse.redirect(new URL('/dashboard/employee', request.url))
}
```

**Solution:** Create role-specific routes that the middleware allows:
- **Clients:** `/dashboard/client/*` routes
- **Employees:** `/dashboard/employee/*` routes (including `/dashboard/employee/projects/[id]`)

**Implementation Pattern:**
```
✅ CORRECT APPROACH:
/dashboard/client/projects/[id]    → For clients only
/dashboard/employee/projects/[id]  → For employees only (with edit mode)

❌ WRONG APPROACH:
/dashboard/client/projects/[id]    → Try to use for both roles
// This fails because middleware blocks employees from accessing /dashboard/client/*
```

**Key Learnings:**
1. Always consider middleware route protection when planning new features
2. Role-specific routes are better than trying to share routes between roles
3. Middleware runs BEFORE the page renders, so you can't bypass it in the page component
4. When navigation immediately redirects, check middleware first

### When Stuck
1. Re-read relevant PRD.md section
2. Check this CLAUDE.md for patterns
3. Review existing similar components
4. Test with sample data (UBL Group)
5. Verify RLS policies in Supabase dashboard

### Quality Checklist (Before Marking Complete)
- [ ] Matches PRD requirements
- [ ] TypeScript strict mode passes
- [ ] RLS policies tested
- [ ] Mobile responsive
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Auto-save works (if applicable)
- [ ] Tested in multiple browsers
- [ ] No console errors
- [ ] Code follows patterns in this doc

---

## 12. Critical Debugging Lesson: Production-Only Routing Issues

### The Problem: Mysterious 307 Redirect Loops in Production

**Symptoms:**
- ✅ Works perfectly in development (`pnpm dev`)
- ❌ Breaks completely in production (Vercel deployment)
- 307 Temporary Redirect loops
- React Error #418 (hydration mismatch) in console
- `x-matched-path: /` header for ALL routes (smoking gun!)
- `x-nextjs-prerender: 1` header present

**Initial Misdiagnoses (ALL WRONG):**
1. ❌ Thought it was a date formatting hydration issue → Added `formatDate()` utilities with UTC timezone
2. ❌ Thought it was static prerendering caching → Added `export const dynamic = 'force-dynamic'`
3. ❌ Thought it was middleware authentication timing → Reviewed auth flow

**Time Wasted:** 3+ hours chasing red herrings

### The Root Cause: Vercel Catch-All Rewrite

**Location:** `vercel.json`

**The Problem Code:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**What This Does:**
- Vercel processes this BEFORE Next.js routing
- ALL URLs get rewritten to `/` (homepage)
- Next.js never sees the original URL
- Middleware redirects based on homepage logic
- Creates infinite redirect loop

**Why It Only Broke Production:**
- `vercel.json` is Vercel-specific (doesn't affect localhost)
- Development server ignores Vercel configuration
- Only activates when deployed to Vercel

### The Solution: Remove Catch-All Rewrites

**Fixed `vercel.json`:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ]
}
```

**Result:** ✅ All routing works perfectly

### Debugging Methodology That Finally Worked

1. **User reported:** "Same error" multiple times → Confirmed initial fixes didn't work
2. **User provided:** Detailed network logs with headers
3. **Key insight:** `x-matched-path: /` for project detail routes
4. **Critical question:** "Does it work in development?" → User: "Yes, perfectly"
5. **Realization:** It's an environment-specific configuration issue
6. **Checked:** `vercel.json` for Vercel-specific settings
7. **Found:** Catch-all rewrite redirecting everything to `/`
8. **Removed:** The rewrites section entirely
9. **Success:** User confirmed fix worked

### Key Learnings for Future Debugging

**When Dev Works But Production Fails:**
1. Check environment-specific configuration files:
   - `vercel.json` (Vercel)
   - `netlify.toml` (Netlify)
   - `amplify.yml` (AWS Amplify)
   - Platform-specific settings in dashboard

2. Look for environment-only features:
   - Rewrites/redirects
   - Edge functions/middleware
   - Header modifications
   - CDN caching rules

3. Check response headers for clues:
   - `x-matched-path` (shows what route Vercel thinks it matched)
   - `x-vercel-cache` (shows cache status)
   - `x-nextjs-prerender` (shows if page was prerendered)
   - Custom platform headers

4. Don't assume it's your code:
   - If dev works perfectly, suspect configuration
   - Check deployment platform docs
   - Review recent config changes

### Vercel Configuration Best Practices

**✅ DO:**
- Use Next.js native routing (no rewrites needed)
- Set specific API route configurations in `functions` section
- Add security headers in `headers` section
- Specify regions for optimization
- Use framework detection (`"framework": "nextjs"`)

**❌ DON'T:**
- Use catch-all rewrites like `"source": "/(.*)"`
- Override Next.js routing with Vercel rewrites
- Add rewrites for routes Next.js already handles
- Use `_redirects` file (Next.js has `next.config.ts` redirects)

**When You DO Need Rewrites:**
- Proxy requests to external APIs
- Migrate from old URL structure (legacy routes)
- Redirect specific old paths to new ones

**Example of Legitimate Rewrite:**
```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://api.example.com/:path*"
    },
    {
      "source": "/old-blog/:slug",
      "destination": "/blog/:slug"
    }
  ]
}
```

### Network Debugging Pattern

**If you see redirect loops, check:**
1. Open DevTools Network tab
2. Filter for "All" or "Doc" (documents)
3. Look at the request chain
4. Check response headers for each redirect
5. Identify the pattern:
   - Where does it start?
   - Where does it loop back?
   - What headers are present?

**Red Flags:**
- `x-matched-path: /` for non-root routes
- 307 redirects in a loop (A → B → A → B)
- Same URL appearing multiple times
- Middleware logs not matching expected routes

### Testing Production Issues Locally

**Vercel CLI Preview:**
```bash
# Install Vercel CLI
pnpm i -g vercel

# Run production build locally
vercel dev --prod

# Deploy to preview
vercel --prod=false
```

This simulates the production environment including `vercel.json` configuration.

---

**End of CLAUDE.md - Ready to Build!** 🚀
