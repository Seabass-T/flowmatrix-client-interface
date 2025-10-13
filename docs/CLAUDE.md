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

**Implementation:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function EditableField({ value, onSave }) {
  const [localValue, setLocalValue] = useState(value)
  const [saving, setSaving] = useState(false)

  const debouncedSave = useDebouncedCallback(async (newValue) => {
    setSaving(true)
    try {
      await onSave(newValue)
      // Show success indicator
    } catch (error) {
      // Rollback on error
      setLocalValue(value)
    } finally {
      setSaving(false)
    }
  }, 1000) // 1-second debounce

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedSave(newValue)
  }

  return (
    <div>
      <input value={localValue} onChange={handleChange} />
      {saving && <span className="text-xs text-gray-500">Saving...</span>}
    </div>
  )
}
```

### 7. Data Visualization (Recharts)

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

3. **Plan Approach**
   - Determine Server vs Client components
   - Identify database schema changes
   - Plan RLS policies needed
   - Choose state management approach

4. **Implement**
   - Follow development rules above
   - Use TypeScript strict mode
   - Implement auto-save for editable fields
   - Test mobile responsiveness

5. **Test**
   - Verify functionality works
   - Test RLS policies with multiple accounts
   - Check mobile/tablet/desktop views
   - Test error states

6. **Document**
   - Update PRD.md if requirements changed
   - Add code comments for complex logic
   - Update this CLAUDE.md if patterns changed

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

### ✅ Completed
- Next.js 15 project initialization
- TypeScript configuration with path aliases
- Tailwind CSS 4 setup
- ESLint configuration
- Supabase environment variables
- Supabase client implementation with validation
- Core utility functions (ROI calculations)
- Database type definitions
- Authentication flow (login/signup with email verification)
- Session management
- Protected route middleware with role-based access control
- Client dashboard layout and header
- Reusable metric card component
- Project cards with ROI breakdown
- TimeRangeFilter component
- **Project Detail View (PRD Section 4.2.8)** - Implemented as separate page route at `/dashboard/client/projects/[id]`:
  - Server-side rendered page with authentication & authorization
  - Back button to return to dashboard
  - Status badge
  - ROI Charts (Line and Bar charts using Recharts)
  - Time range selector for charts (7 Days, Month, Quarter, All Time)
  - Metrics Breakdown section
  - Cost Breakdown section
  - Tasks section with completion status
  - Full note history (client + FlowMatrix AI notes)
  - Associated files with download links
  - Shareable/bookmarkable URLs
  - Browser back button support
  - Reusable ProjectDetailContent component
  - Simple navigation from project cards (no complex modal state)
- **Notes Section (PRD Section 4.2.5)** - Dual-panel component for client-FlowMatrix AI communication:
  - Component: `/components/NotesPanel.tsx`
  - API Route: `/app/api/notes/route.ts` (GET, POST, PATCH, DELETE)
  - Left Panel: Client Notes with add/edit/delete functionality
  - Right Panel: FlowMatrix AI Notes (read-only for clients)
  - Real-time note fetching when project selection changes
  - Project dropdown to tag notes to specific systems
  - Character limit (500 chars) with counter
  - CRUD operations with full RLS enforcement
  - Clients can only create/edit/delete their own 'client' type notes
  - Employees can create 'flowmatrix_ai' notes and manage all notes
  - Responsive dual-panel layout (side-by-side on desktop, stacked on mobile)
  - Visual distinction: Blue theme for client notes, green for FlowMatrix AI
  - Integrated into both Client and Employee dashboards

### 🚧 In Progress (Sprint 2)
- Database table creation in Supabase
- RLS policy setup
- Real data fetching for metrics
- Outstanding tasks section

### 📋 Pending (Upcoming Sprints)
- Employee dashboard UI
- Auto-save functionality
- File upload/management

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
- ❌ **Using modals for complex detail views** ⚠️ **USE PAGE ROUTES INSTEAD** (see Section 6)
- ❌ **Spending >2 hours debugging modal rendering issues** ⚠️ **SWITCH TO PAGE ROUTE**
- ❌ Forgetting RLS policies on new tables
- ❌ Hardcoding data instead of database queries
- ❌ Skipping mobile responsiveness testing
- ❌ Not implementing auto-save debounce
- ❌ Exposing service role key to client-side

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

**End of CLAUDE.md - Ready to Build!** 🚀
