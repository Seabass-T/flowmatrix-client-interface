# Product Requirements Document (PRD) v2.0
# FlowMatrix AI Client Interface

**Document Version:** 2.0
**Last Updated:** January 2025
**Status:** Phase 1 Complete ✅ | Phase 1.5 In Progress 🚧
**Project Lead:** FlowMatrix AI Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas & Journeys](#3-user-personas--journeys)
4. [Feature Specifications](#4-feature-specifications)
   - [Phase 1: Core Features ✅](#phase-1-core-features-)
   - [Phase 1.5: Enhancements 🚧](#phase-15-enhancements-)
5. [Technical Architecture](#5-technical-architecture)
6. [Database Schema](#6-database-schema)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Design Specifications](#8-design-specifications)
9. [Testing & Validation](#9-testing--validation)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

### 1.1 Product Overview

The **FlowMatrix AI Client Interface** is a dual-portal web application designed to showcase ROI metrics, track project progress, and facilitate transparent communication between FlowMatrix AI and their clients. The platform serves two distinct user types: clients (viewing their automation ROI) and FlowMatrix AI employees (managing all client data).

### 1.2 Problem Statement

FlowMatrix AI currently manages client relationships through video calls, email, and text communication. This approach creates friction in:

- **Demonstrating tangible value** - Clients struggle to see concrete ROI from automation investments
- **Project visibility** - Lack of real-time transparency on project progress and status
- **Onboarding efficiency** - Manual processes slow down new client adoption
- **Professional credibility** - Need for a polished interface to showcase expertise

### 1.3 Solution

A web-based interface that provides:

**For Clients:**
- Real-time visibility into ROI metrics and project status
- Cost-benefit analysis with interactive visualizations
- Direct communication channel via notes and tasks
- Mobile-responsive access from anywhere

**For Employees:**
- Centralized client management dashboard
- Inline editing capabilities with auto-save
- Task tracking and note management
- Multi-client overview with aggregate metrics

### 1.4 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Client Retention | +20% increase | 🎯 Tracking |
| Onboarding Speed | 50% reduction | 🎯 Tracking |
| Client Satisfaction | 90%+ positive feedback | 🎯 Tracking |
| Operational Efficiency | 70% reduction in manual updates | ✅ Achieved |
| Active Users | 10-20 concurrent clients | 🎯 On Track |

### 1.5 Project Phases

#### ✅ Phase 1: Core MVP (Complete - Sprints 1-7)
- Authentication & multi-tenancy
- Client dashboard with ROI visualization
- Employee dashboard with multi-client management
- Project/system cards with detailed views
- Status management (Active, Dev, Proposed, Inactive)
- Dual note system (Client + FlowMatrix AI notes)
- Task management with completion tracking
- **Demo Experience** - Public showcase at `/demo` with realistic Construction ICP data

#### 🚧 Phase 1.5: Enhancements (Current - Sprints 8-10)
- **A. UI/UX Refinements** - Remove edit mode visual indicators
- **B1. File Upload System** - Document upload/download for projects
- **B2. Projected ROI Features** - Future ROI calculations and visualizations
- **B3. ROI vs Cost Ratio Chart** - Break-even analysis visualization
- **B4. Aggregate Projected ROI** - Dashboard metric for projected returns
- **B5. Payment Integration** - Stripe payment processing and invoice management

#### ⏸ Phase 2: Advanced Features (Deferred)
- Recurring billing and subscriptions
- Auto-generated invoices from project costs
- Email notifications and reminders
- Advanced reporting and exports
- n8n workflow integration
- AI-powered insights

#### ⏸ Phase 3: Scale & Optimization (Future)
- Mobile app (iOS/Android)
- Advanced role-based permissions
- White-label capability
- API for third-party integrations

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "Empower FlowMatrix AI clients with transparent, data-driven insights into their automation investments while streamlining internal client management operations."

### 2.2 Business Goals

1. **Establish Credibility** - Position FlowMatrix AI as a professional, tech-forward consultancy
2. **Improve Communication** - Reduce manual status updates by 70%
3. **Enable Scale** - Support 10-20 concurrent client accounts without operational bottlenecks
4. **Data-Driven Decisions** - Help clients visualize ROI to justify continued investment
5. **Revenue Growth** - Streamline payment processing to improve cash flow

### 2.3 User Goals

**Client Goals:**
- Understand the value they're receiving (time saved, money saved)
- Stay informed about project progress without scheduling meetings
- Communicate issues or feedback easily
- Access data anytime, anywhere (mobile-responsive)
- Pay invoices securely online

**Employee Goals:**
- Manage all clients from a centralized dashboard
- Update client data quickly with auto-save
- Identify clients needing attention (uncompleted tasks, unseen notes)
- Present professional reports to clients
- Track payments and generate invoices efficiently

---

## 3. User Personas & Journeys

### 3.1 Persona 1: The Client User

**Profile:**
- **Name:** Sarah Mitchell
- **Role:** Operations Manager at UBL Group (Construction)
- **Company Size:** $3M annual revenue, 15 employees
- **Tech Savviness:** Moderate (uses basic SaaS tools)
- **Pain Points:**
  - Unsure if automation investment is worth it
  - Too busy to attend frequent status meetings
  - Wants proof of ROI for executive buy-in

**User Journey:**

1. **Onboarding:**
   - Receives email invitation from FlowMatrix AI
   - Creates account with email/password
   - Invited to initial consultation call
   - Watches FlowMatrix AI employee populate dashboard in real-time during call

2. **Daily Usage:**
   - Logs in weekly to check ROI metrics
   - Reviews new FlowMatrix AI notes about system updates
   - Leaves feedback in Client Notes section
   - Invites CFO to view dashboard for budget approval

3. **Decision-Making:**
   - Uses aggregate ROI data to justify renewal
   - Reviews projected ROI for future planning
   - Pays invoices securely via Stripe
   - Exports testimonial to share internally

### 3.2 Persona 2: The FlowMatrix AI Employee

**Profile:**
- **Name:** Alex Rodriguez
- **Role:** Automation Specialist at FlowMatrix AI
- **Responsibilities:** Manages 5-8 client accounts
- **Pain Points:**
  - Manually updating clients via email wastes time
  - Hard to remember which clients need attention
  - Difficult to showcase value during renewal conversations
  - Invoice tracking is manual and error-prone

**User Journey:**

1. **Morning Routine:**
   - Logs into employee dashboard
   - Reviews master metrics (total ROI across all clients, outstanding tasks)
   - Identifies clients with unseen notes or overdue payments

2. **Client Management:**
   - Clicks on "UBL Group" client card
   - Updates "Email Organizer" system: changes status to "Active", inputs 1 hr/day saved, $26/hr wage
   - Adds FlowMatrix AI note: "System live as of Oct 10, monitoring performance"
   - Creates invoice for monthly maintenance

3. **Reporting:**
   - Uses aggregate dashboard to prepare monthly report for FlowMatrix AI leadership
   - Shares client dashboard link with prospects during sales calls
   - Tracks payment status across all clients

### 3.3 Persona 3: The Multi-User Client

**Profile:**
- **Name:** David Chen
- **Role:** CEO at UBL Group
- **Access:** Invited by Sarah Mitchell (Operations Manager)
- **Use Case:** High-level ROI overview for strategic decisions

**User Journey:**
- Receives invitation email from Sarah
- Creates account linked to UBL Group
- Views same dashboard as Sarah (identical data)
- Focuses on aggregate ROI and projected returns
- Can remove Sarah's access or invite others (e.g., CFO)

---

## 4. Feature Specifications

## Phase 1: Core Features ✅

### 4.1 Authentication & Multi-Tenancy ✅

#### 4.1.1 User Registration ✅

**Client Self-Service Signup:**
- Landing page with "Get Started" CTA
- Email + Password registration
- Email verification (Supabase built-in)
- Account creation triggers blank dashboard setup

**Employee Invitation System:** ✅ **IMPLEMENTED**
- Special section in employee dashboard
- Input: Email address to invite
- System sends invitation link via Supabase Auth
- New employee registers and gains employee-level access
- **Component:** `AddEmployeeModal.tsx`
- **API Route:** `/app/api/employees/invite/route.ts`

#### 4.1.2 Multi-User Per Client Account ✅

**Account Structure:**
```
Client Company (e.g., UBL Group)
├─ Master Account (First user who signs up)
├─ Additional Users (Invited by existing users)
└─ Shared Data (All users see identical dashboard)
```

**Capabilities:**
- Any client user can invite colleagues via email
- Any client user can remove other users' access
- All users have equal permissions (read + write notes)
- **Future:** Role-based access (CEO vs. Operations Manager)

**Data Isolation:**
- Client A cannot see Client B's data
- Enforced at database level via Row-Level Security (RLS) in Supabase

#### 4.1.3 Login Flow ✅

```
User enters email/password
    ↓
Supabase Auth validates
    ↓
Check user type (client vs. employee)
    ↓
Redirect to appropriate dashboard
```

**Implementation:**
- Route: `/app/login/page.tsx`
- Middleware: Route protection based on role
- Session: JWT tokens in HTTP-only cookies (7-day expiration)

---

### 4.2 Client Dashboard ✅

#### 4.2.1 Overview ✅

**Route:** `/app/dashboard/client/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [FlowMatrix AI Logo]              [Client: UBL Group]       │
│                                    [Logout] [Settings]       │
├─────────────────────────────────────────────────────────────┤
│                      OVERVIEW METRICS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Time Saved   │  │ Total ROI    │  │ Total Costs  │     │
│  │ 93 hrs/month │  │ $2,418       │  │   $0         │     │
│  │ ▲ +8 hrs     │  │ ▲ +12% MTD   │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    OUTSTANDING TASKS (3)                     │
│  [ ] Provide feedback on ERP wireframes (Due: Oct 15)       │
│  [ ] Review email automation logs for errors                │
│  [ ] Approve maintenance plan for Q4                        │
├──────────────────────┬──────────────────────────────────────┤
│   CLIENT NOTES       │    FLOWMATRIX AI NOTES               │
│  ┌─────────────────┐ │  ┌─────────────────────────────────┐│
│  │ [Add Note]      │ │  │ Oct 10: Email system now live   ││
│  │ Project: [▼]    │ │  │ monitoring performance          ││
│  │ ─────────────── │ │  │                                 ││
│  │ Oct 8: Issue    │ │  │ Oct 5: ERP dev started, eta 3wks││
│  │ with email tags │ │  │                                 ││
│  └─────────────────┘ │  └─────────────────────────────────┘│
├──────────────────────┴──────────────────────────────────────┤
│               LEAVE A TESTIMONIAL                            │
│  [Share your experience...] [Submit]                         │
├─────────────────────────────────────────────────────────────┤
│                  PROJECTS / SYSTEMS                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │ [ACTIVE] 🟢     │  │ [ACTIVE] 🟢     │  │ [DEV] 🔵     ││
│  │ Email Organizer │  │ Developer Email │  │ Company ERP  ││
│  │                 │  │ Outreach        │  │              ││
│  │ Time: 1hr/day   │  │ Time: 3hr/month │  │ Projected:   ││
│  │ ROI: $2,184     │  │ ROI: $234       │  │ 30-40hr/week ││
│  │ Cost: Free      │  │ Cost: Free      │  │ Cost: TBD    ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Header Section ✅

**Components:**
- FlowMatrix AI logo (left-aligned, links to dashboard home)
- Client company name (right side)
- User avatar/dropdown (Settings, Manage Users, Logout)

**Settings Menu:**
- Update password
- Notification preferences (email alerts for new notes)
- Invite team members

#### 4.2.3 Overview Metrics Section ✅

**Three Primary Cards:**

1. **Time Saved** ✅
   - Value: Total hours saved per month (aggregated)
   - Breakdown: Hovering shows per-system contribution
   - Trend Indicator: Compared to previous period
   - Visual: Hours + "per month" label

2. **Total ROI** ✅
   - Value: Aggregated ROI across all active systems
   - Calculation: Sum of (Hours Saved × $/hr wage) for all systems
   - Trend Indicator: Month-to-date change (▲ +12%)
   - Visual: Large number with trend arrow

3. **Total Costs** ✅
   - Value: Sum of all system costs (dev + implementation + maintenance)
   - Calculation: One-time costs + (monthly maintenance × months active)
   - Visual: Dollar amount with tooltip breakdown

**Time Range Toggle:** ✅
```
[Last 7 Days] [Last Month] [Last Quarter] [All Time]
```
- Default: "All Time"
- Dynamically recalculates metrics based on selection

#### 4.2.4 Outstanding Tasks Section ✅

**Display:**
- Shows incomplete tasks assigned to client (pulled from project details)
- Each task shows:
  - Checkbox (non-interactive for clients)
  - Task description
  - Due date
  - Associated project/system
- Limit: Show top 5, with "View All Tasks" link

**Component:** `TasksList.tsx`

#### 4.2.5 Notes Section (Dual Panel) ✅

**Left Panel: Client Notes**
- Add Note Form:
  - Text area (supports 500 characters)
  - Project dropdown (tag note to specific system)
  - Submit button
- Note Display:
  - Chronological (newest first)
  - Shows: Date, Project tag, Note content
  - Edit/Delete own notes

**Right Panel: FlowMatrix AI Notes**
- Read-Only for Clients
- Shows: Date, Note content
- Chronological display
- No editing capabilities

**Component:** `NotesPanel.tsx`

#### 4.2.6 Testimonial Section ✅

**Components:**
- Text area (300 characters)
- Submit button
- Confirmation message after submission
- Stored in database for FlowMatrix AI marketing use

**Component:** `TestimonialForm.tsx`

**Design:**
- Subtle, non-intrusive placement
- Appears after client has ≥1 active system for 30+ days (future enhancement)

#### 4.2.7 Project/System Cards ✅

**Card Layout:**
```
┌─────────────────────────┐
│ [ACTIVE] 🟢             │  ← Status Badge
│ Email Organizer         │  ← System Name
│ ─────────────────────── │
│ Time Saved: 1 hr/day    │  ← Key Metrics
│ ROI: $2,184 (12 weeks)  │
│ Cost: Free              │
│ ─────────────────────── │
│ Last Updated: Oct 10    │  ← Metadata
└─────────────────────────┘
```

**Status Badge Colors:**
- **Active:** Green (#10B981) 🟢
- **Dev:** Blue (#3B82F6) 🔵
- **Proposed:** Yellow (#F59E0B) 🟡
- **Inactive:** Gray (#6B7280) ⚫

**Card Interactions:**
- Hover: Subtle elevation/shadow effect
- Click: Opens detailed page (separate route)

**Component:** `ProjectCard.tsx` / `ProjectCardList.tsx`

#### 4.2.8 Project Detail View (Separate Page) ✅

**⚠️ IMPLEMENTATION NOTE:** Originally specified as modal, implemented as **separate page route** for better reliability and UX.

**Route:** `/app/dashboard/client/projects/[id]`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back to Dashboard]                                        │
│ Email Organizer & Summarizer                                 │
│ Status: [ACTIVE] 🟢                                          │
├─────────────────────────────────────────────────────────────┤
│                      ROI CHARTS                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Time Saved Over Time │  │ ROI Trend                │    │
│  │ (Line Chart)         │  │ (Bar Chart)              │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Time Range: [7 Days] [Month] [Quarter] [All Time]  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ METRICS BREAKDOWN                                            │
│  • Hours Saved/Day: 1 hr                                     │
│  • Employee Wage: $26/hr                                     │
│  • Daily ROI: $26                                            │
│  • Weekly ROI: $182                                          │
│  • Total ROI (12 weeks): $2,184                              │
├─────────────────────────────────────────────────────────────┤
│ COST BREAKDOWN                                               │
│  • Development Cost: $0 (Free tier)                          │
│  • Implementation Cost: $0                                   │
│  • Monthly Maintenance: $0                                   │
│  • Total Cost to Date: $0                                    │
├─────────────────────────────────────────────────────────────┤
│ TASKS (Managed by FlowMatrix AI)                             │
│  [✓] Initial setup and training (Oct 1)                      │
│  [✓] Monitor first week performance (Oct 8)                  │
│  [ ] Review client feedback on tagging (Oct 12)              │
├─────────────────────────────────────────────────────────────┤
│ FULL NOTE HISTORY                                            │
│  [CLIENT] Oct 8: Issue with email tags                       │
│  [FLOWMATRIX AI] Oct 10: System live, monitoring             │
├─────────────────────────────────────────────────────────────┤
│ ASSOCIATED FILES                                             │
│  📄 Project_Proposal_v2.pdf                                  │
│  📄 setup_guide.pdf                                          │
│  [Download] links                                            │
└─────────────────────────────────────────────────────────────┘
```

**Benefits of Page Route Implementation:**
- ✅ Shareable/bookmarkable URLs (`/dashboard/client/projects/[id]`)
- ✅ Browser back button works naturally
- ✅ Simpler code (90% less complexity than modal)
- ✅ 100% reliable
- ✅ Can open in new tabs with Cmd+Click

**Components:**
- Page: `/app/dashboard/client/projects/[id]/page.tsx`
- Content: `/components/ProjectDetailContent.tsx`
- Charts: Uses Recharts library

**See Also:** `docs/CLAUDE.md` Section 6 for implementation patterns

#### 4.2.9 Demo Experience ✅

**Route:** `/demo`

**Purpose:** Publicly accessible demonstration of FlowMatrix AI's client interface showcasing realistic Construction/Home Services ICP data.

**Demo Company:** Apex Construction Inc.

**Data Structure:**
- 8 Automation Projects (7 Active, 1 in Development)
- Total Investment: ~$135,500
- Monthly ROI: ~$44,700
- Time Saved: ~167 hours/week
- 11 months of service (Monthly Retainer: $6,500/month)

**Demo Projects:**
1. **Project Management Interface** (Active 8mo) - $10k/month ROI, 40 hrs/week saved
2. **Invoice Management System** (Active 10mo) - $4.5k/month ROI, 10 hrs/week saved
3. **Proposal Generation Tool** (Active 6mo) - $6k/month ROI, 15 hrs/week saved
4. **Job Scheduling System** (Active 5mo) - $8k/month ROI, 25 hrs/week saved
5. **Material Ordering System** (Active 4mo) - $5k/month ROI, 12 hrs/week saved
6. **Customer Follow-up System** (Active 3mo) - $7k/month ROI, 20 hrs/week saved
7. **Timesheet Automation** (Active 2mo) - $4.2k/month ROI, 10 hrs/week saved
8. **Subcontractor Management** (In Development) - 20 hrs/week projected

**Features:**
- Fully functional dashboard with all client features
- Time range filtering (7 Days, Month, Quarter, All Time)
- Interactive project detail pages with ROI charts
- Outstanding tasks display
- Investment breakdown section
- Prominent CTAs to FlowMatrix AI intake form
- Dark green branding (#10B981 theme)
- No authentication required
- Read-only demonstration

**Layout Elements:**
```
┌─────────────────────────────────────────────────────────────┐
│ Demo Banner: "Demo Account - Sample Data • Return to website"│
├─────────────────────────────────────────────────────────────┤
│ Header: FlowMatrix AI | Apex Construction Inc. [DEMO]       │
│         [Start Your Automation Journey]                      │
├─────────────────────────────────────────────────────────────┤
│ Dashboard                                                    │
│ View your automation ROI metrics and project status          │
│                                                              │
│ Time Range: [Last 7 Days] [Last Month] [Last Quarter] [All] │
│                                                              │
│ Overview Metrics:                                            │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Total ROI   │ │ Time Saved   │ │ Total Costs  │         │
│ │ $44,700     │ │ 167 hrs/week │ │ $135,500     │         │
│ │ MTD         │ │ all time     │ │ all time     │         │
│ └─────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
│ Outstanding Tasks (5)                                        │
│ [Checklist of upcoming tasks]                                │
│                                                              │
│ Demo Experience Banner:                                      │
│ "You're viewing Apex Construction Inc., a fictional company. │
│  This showcases how FlowMatrix AI tracks ROI across 8       │
│  automation projects... Get started today"                   │
│                                                              │
│ Projects & Systems (7 Active, 8 Total)                       │
│ [Grid of project cards - clickable to detail pages]          │
│                                                              │
│ Investment Breakdown:                                        │
│ Development: $52k | Implementation: $12k                      │
│ Monthly Retainer: $6,500/month | Total: $135,500            │
│ Monthly ROI: $44,700 (based on 7 active projects)            │
├─────────────────────────────────────────────────────────────┤
│ Footer CTA: "Ready to transform your business?"             │
│             [Get Started Today]                              │
└─────────────────────────────────────────────────────────────┘
```

**Technical Implementation:**
- **Data:** In-memory mock data (`lib/demo-data.ts`)
- **Isolated Routes:** `/app/demo/` directory structure
- **Custom Layout:** `app/demo/layout.tsx` with demo branding
- **Components Reused:** Same components as production (ProjectCardList, MetricCard, etc.)
- **No Database Queries:** All data from `DEMO_PROJECTS`, `DEMO_TASKS`, `DEMO_NOTES`
- **Middleware:** Public route exception in `middleware.ts`

**Cost Structure (Realistic):**
- Dev Costs: $52,000 total
- Implementation: $12,000 total
- Monthly Maintenance: $4,800/month
- Monthly Retainer: $6,500/month (11 months = $71,500)
- **Total Costs: $135,500**
- **Monthly ROI: $44,700** (from active projects)
- **Net Profit: Positive after ~3 months**

**Key Rules:**
- Maintenance costs are $0 for non-active projects (status: 'dev', 'proposed', 'inactive')
- Total Costs metric is time-range specific (Last 7 Days shows weekly costs, not all-time)
- ROI charts show cumulative ROI vs cumulative total costs over time
- Time ranges affect all metrics consistently

**Components:**
- `/app/demo/page.tsx` - Main dashboard
- `/app/demo/layout.tsx` - Demo-specific layout with branding
- `/app/demo/projects/[id]/page.tsx` - Project detail pages
- `/lib/demo-data.ts` - All mock data
- `/components/TimeRangeFilter.tsx` - Updated to use pathname for navigation

**Files Modified:**
- `middleware.ts` - Added `/demo` as public route
- `lib/calculations.ts` - Added 'quarter' timeRange support
- `components/TimeRangeFilter.tsx` - Fixed redirect issue (uses pathname)
- `components/ProjectDetailContent.tsx` - Updated ROI Trend chart to show Total ROI vs Total Costs

---

### 4.3 Employee Dashboard ✅

#### 4.3.1 Overview ✅

**Route:** `/app/dashboard/employee/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [FlowMatrix AI Logo]          EMPLOYEE PORTAL               │
│                               [Add Employee] [Logout]        │
├─────────────────────────────────────────────────────────────┤
│                   MASTER METRICS OVERVIEW                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total Clients│ │ Aggregate ROI│ │ Outstanding  │        │
│  │      8       │ │   $45,320    │ │   Tasks: 12  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                  ALL CLIENT ACCOUNTS                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ UBL Group                            [View Dashboard]│   │
│  │ ──────────────────────────────────────────────────── │   │
│  │ Active Projects: 3 | Uncompleted Tasks: 2           │   │
│  │ New Client Notes: 1 🔴 | Total ROI: $2,418          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ABC Construction                     [View Dashboard]│   │
│  │ ──────────────────────────────────────────────────── │   │
│  │ Active Projects: 5 | Uncompleted Tasks: 4           │   │
│  │ New Client Notes: 0 | Total ROI: $8,950             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.2 Header Section ✅

**Components:**
- FlowMatrix AI logo
- "Employee Portal" title
- **Add Employee Button:** ✅ IMPLEMENTED
  - Opens modal with email input
  - Sends invitation link via Supabase Auth
  - Component: `AddEmployeeModal.tsx`
  - API Route: `/app/api/employees/invite/route.ts`
- User dropdown (Logout)

#### 4.3.3 Master Metrics Overview ✅

**Three Aggregate Cards:**

1. **Total Clients** ✅
   - Count of active client accounts
   - Clickable → Filters client list

2. **Aggregate ROI** ✅
   - Sum of ROI across ALL clients
   - Trend indicator (vs. previous period)
   - Visual: Large dollar amount

3. **Outstanding Tasks** ✅
   - Total uncompleted tasks across all clients
   - Clickable → Shows task list view

#### 4.3.4 Client Account Cards ✅

**Card Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [Client Name: UBL Group]              [View Dashboard] │
│ ─────────────────────────────────────────────────────── │
│ Active Projects: 3                                      │
│ Uncompleted Tasks: 2                                    │
│ New Client Notes: 1 🔴 (Indicator for unseen notes)     │
│ Total ROI: $2,418                                       │
└─────────────────────────────────────────────────────────┘
```

**Metrics Explained:**
- **Active Projects:** Count of systems with "Active" status
- **Uncompleted Tasks:** Tasks marked incomplete across all projects
- **New Client Notes:** Red indicator (🔴) if there are unread client notes
- **Total ROI:** Aggregated ROI for this client

**Interactions:**
- Hover: Card elevates with shadow
- Click "View Dashboard": Opens that client's interface in edit mode

#### 4.3.5 Edit Mode (Client Dashboard) ✅

**Route:** `/app/dashboard/employee/clients/[id]`

**When Employee Accesses Client Dashboard:**
- ✅ All inputs become editable
- ✅ Auto-save with 1-second debounce (not on blur, but after field change)
- ✅ Visual indicator: ~~Yellow border~~ **Standard borders** (Phase 1.5 removes yellow styling)

**Implementation Details:**
- **Employee Client View:** `/app/dashboard/employee/clients/[id]` - Edit mode enabled
- **Employee Project Detail:** `/app/dashboard/employee/projects/[id]` - Full edit capabilities
- **Pattern:** 1-second debounce auto-save (saves 1 second after typing stops)
- **Error Handling:** On save failure, reverts to original value and shows error message

**Editable Fields:**

✅ **System Metrics** (Project Cards & Detail Page):
- Hours saved (daily/weekly/monthly input) - Number inputs
- $/hr wage (per-project and client default) - Number input
- Status dropdown (Active, Dev, Proposed, Inactive)
- Costs (dev, implementation, maintenance) - Number inputs
- Go-live date - Date picker
- Project name - Text input

✅ **Notes:**
- Add FlowMatrix AI notes via `NotesPanel` component
- View client notes (read-only for employees)
- Edit/delete FlowMatrix AI notes (employee-created only)

✅ **Tasks:**
- Add tasks via `AddTaskForm` component with project tagging
- Mark complete/incomplete with interactive checkboxes
- Assign due dates via date picker
- Delete tasks with confirmation

**Visual Feedback:**
- ✅ "Saving..." indicator with spinner (appears while saving)
- ✅ "Saved ✓" with green checkmark (appears for 2 seconds after successful save)
- ✅ Error message with red AlertCircle icon (appears for 5 seconds on failure)
- ✅ Real-time updates - Changes persist immediately, page refreshes after mutations

**Components:**
- `EditableProjectCard.tsx` - Editable project cards
- `EditableProjectDetailContent.tsx` - Full project detail page with editing
- `EditableWageField.tsx` - Client default wage inline editor

---

### 4.4 Status Management ✅

#### 4.4.1 Status Types ✅

- **Active:** System is live and operational
- **Dev:** System is in development
- **Proposed:** System is recommended but not yet approved/started
- **Inactive:** System was active but is now disabled/deprecated

#### 4.4.2 Status Change Workflow ✅

- Only FlowMatrix AI employees can change status
- Dropdown selector in project card or detail view
- Auto-saves after 1-second debounce
- Status changes reflected immediately across all views

#### 4.4.3 Status Impact on Metrics ✅

- **Active:** Contributes to ROI calculations
- **Dev:** Shows "Projected ROI" instead of actual
- **Proposed:** Shows "Estimated ROI"
- **Inactive:** Excluded from aggregate ROI, but historical data preserved

---

### 4.5 Data Visualization ✅

#### 4.5.1 Chart Types ✅

**Dashboard Overview Charts:**

1. **Aggregate ROI Trend (Line Chart):**
   - X-axis: Time (days/weeks/months based on selected range)
   - Y-axis: Total ROI ($)
   - Shows cumulative growth over time

2. **Time Saved Breakdown (Pie Chart):**
   - Shows contribution of each system to total time saved
   - Color-coded by system

3. **ROI vs. Cost (Bar Chart):**
   - Side-by-side comparison for each system
   - Clearly shows value proposition

**Project Detail Charts:**

1. **Time Saved Over Time (Line Chart):**
   - Tracks daily/weekly time savings for individual system

2. **ROI Accumulation (Bar Chart):**
   - Shows ROI growth week-over-week or month-over-month

#### 4.5.2 Time Range Controls ✅

**Available Options:**
- Last 7 Days
- Last Month
- Last Quarter
- All Time

**Behavior:**
- Applies to all charts and metrics simultaneously
- Persists across page navigation (stored in session)

#### 4.5.3 Chart Library ✅

**Technology:** Recharts (React charting library)

**Rationale:**
- Native React integration
- Responsive by default
- Customizable colors to match brand

---

## Phase 1.5: Enhancements 🚧

### 4.6 UI/UX Refinements 🚧

#### 4.6.1 Remove Edit Mode Visual Indicators

**Status:** 🚧 Sprint 8 (Hours 0-2)

**Current State:**
Employee-only pages currently display prominent yellow visual indicators:
- Yellow notice box at top of pages ("Edit Mode Active")
- Yellow "EDIT MODE" tag next to project titles
- Yellow borders (`border-2 border-yellow-300`) on all editable input fields

**Required Changes:**

❌ **REMOVE (Visual Elements Only):**
```tsx
// DELETE: Yellow notice box
<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
  <div className="flex items-start">
    <Pencil className="h-5 w-5 text-yellow-800 mr-3 mt-0.5" />
    <div>
      <h3 className="text-sm font-semibold text-yellow-900">Edit Mode Active</h3>
      <p className="text-sm text-yellow-800 mt-1">
        All fields are editable. Changes auto-save after 1 second...
      </p>
    </div>
  </div>
</div>

// DELETE: Yellow tag next to title
<span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
  EDIT MODE
</span>

// REMOVE: Yellow borders from inputs
// Change from:
className="border-2 border-yellow-300 focus:border-yellow-400"
// To:
className="border border-gray-300 focus:border-blue-500"
```

✅ **KEEP (Functionality - No Changes):**
- All input fields remain editable
- Auto-save with 1-second debounce
- Save state indicators (Saving.../Saved ✓/Error)
- Inline editing for all project fields
- Permission checks (employee-only editing)

**New Visual Style:**
```tsx
// Standard editable input style
<input
  type="number"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             transition-colors"
/>

// Save State Indicators (Keep As-Is)
{saveState === 'saving' && (
  <span className="text-sm text-blue-600 flex items-center gap-1">
    <Loader className="w-4 h-4 animate-spin" />
    Saving...
  </span>
)}
{saveState === 'saved' && (
  <span className="text-sm text-green-600 flex items-center gap-1">
    <Check className="w-4 h-4" />
    Saved
  </span>
)}
```

**Files to Modify:**
- `app/dashboard/employee/clients/[id]/page.tsx`
- `app/dashboard/employee/projects/[id]/page.tsx`
- `components/EditableProjectCard.tsx`
- `components/EditableProjectDetailContent.tsx`
- `components/EditableWageField.tsx`

**Acceptance Criteria:**
- ✅ No yellow visual indicators anywhere in employee interface
- ✅ All editing functionality still works (auto-save, validation, error handling)
- ✅ Standard gray borders with blue focus states on inputs
- ✅ Save state indicators remain visible (Saving.../Saved/Error)
- ✅ No regression in edit mode performance

---

### 4.7 File Upload System 🚧

#### 4.7.1 Overview

**Status:** 🚧 Sprint 8 (Hours 2-12)

Enable employees and clients to upload files (documents, images, spreadsheets, etc.) to specific projects. Files are stored in Supabase Storage and associated with projects in the database.

#### 4.7.2 Core Functionality

**Upload Method:**
- Drag-and-drop + click-to-browse file picker
- File Types: All file types allowed (no restrictions)
- File Size: Maximum 10MB per file
- Storage: Supabase Storage bucket `project-files`

**Access Control:**
- Employees can upload to any project
- Clients can upload to their own projects
- Employees can delete any file
- Clients can only delete their own uploaded files

#### 4.7.3 User Experience

**Upload Location:** Project detail pages only
- Employee view: `/dashboard/employee/projects/[id]`
- Client view: `/dashboard/client/projects/[id]`

**Upload Interface:**
```
┌─────────────────────────────────────────────────────────┐
│                   Associated Files                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │     📎 Drag & Drop Files Here                    │   │
│  │        or click to browse                        │   │
│  │        (All file types, max 10MB)               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📄 Project_Proposal_v2.pdf                       │   │
│  │ Uploaded by Employee • Oct 12, 2025 • 2.3 MB   │   │
│  │ [Download] [Delete]                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 Q3_Metrics.xlsx                               │   │
│  │ Uploaded by Client • Oct 14, 2025 • 1.8 MB     │   │
│  │ [Download] [Delete]                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Upload States:**
- **Idle:** Drag-drop zone visible with prompt
- **Dragging:** Highlighted border when file is dragged over zone
- **Uploading:** Progress bar with percentage
- **Success:** File immediately appears in list below
- **Error:** Red error message with retry option

**File Display:**
- File icon (based on file type: PDF, Excel, Word, image, generic)
- File name (clickable download link)
- File size (e.g., "2.3 MB")
- Upload metadata: "Uploaded by [Role] • [Date]"
- Actions: Download button, Delete button (conditional)

#### 4.7.4 Technical Implementation

**Supabase Storage Setup:**
- Bucket name: `project-files`
- Public access: No (files accessible only via signed URLs)
- File size limit: 10MB (enforced at bucket level)
- Allowed MIME types: All (no restrictions)

**Database Table:** (Already exists)
```sql
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER, -- Size in bytes (ADD IF MISSING)
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Routes:**
- `POST /api/files` - Upload File
- `DELETE /api/files/[id]` - Delete File

**React Components:**
- `FileUploadZone.tsx` - Drag-and-drop upload interface
- `FileItem.tsx` - Individual file display with download/delete

**Integration:**
- Add to `ProjectDetailContent.tsx` / `EditableProjectDetailContent.tsx`
- Add to "Associated Files" section on project detail pages

**Acceptance Criteria:**
- ✅ Users can drag-and-drop files onto upload zone
- ✅ Users can click upload zone to open file picker
- ✅ Upload shows progress indicator
- ✅ Files appear immediately in list after successful upload
- ✅ File size limit (10MB) enforced with error message
- ✅ Files display correct icon based on MIME type
- ✅ Upload badge shows "Employee" or "Client" role
- ✅ Download buttons work for all accessible files
- ✅ Employees can delete any file
- ✅ Clients can only delete their own files
- ✅ Files are project-specific (no cross-project bleeding)
- ✅ RLS policies enforce proper access control

---

### 4.8 Projected ROI Features 🚧

#### 4.8.1 Overview

**Status:** 🚧 Sprint 9 (Hours 12-24)

Add projected ROI calculations and visualizations that show estimated future ROI based on current performance trends. This helps clients and employees understand long-term value potential.

#### 4.8.2 Calculation Methodology

**For Active Projects (Linear Projection):**

Formula:
```
Monthly ROI Velocity = Total ROI ÷ Months Active
Projected ROI = Monthly ROI Velocity × Projection Timeframe (in months)
```

Example:
- Project has been live for 5 months
- Total ROI to date: $10,000
- Monthly velocity: $10,000 ÷ 5 = $2,000/month

Projections:
- 6 months: $2,000 × 6 = $12,000
- 1 year: $2,000 × 12 = $24,000
- 2 years: $2,000 × 24 = $48,000
- 3 years: $2,000 × 36 = $72,000

**For Dev/Proposed Projects (Potential ROI):**

Formula:
```
Potential ROI = Hours Saved Per Day × Employee Wage × Days in Timeframe
```

Example:
- Dev project with 5 hrs/day saved
- Employee wage: $50/hr
- Potential 1-year ROI: 5 × $50 × 365 = $91,250

**Inactive Projects:**
- Projects with status = 'inactive' are excluded from projected ROI calculations

#### 4.8.3 UI Components

**New Chart: Projected ROI Chart**

Location: ROI Charts section on project detail pages
Chart Type: Line chart with dashed line for projections

```tsx
<div className="bg-gray-50 rounded-lg p-4">
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-semibold text-gray-700">Projected ROI</h4>

    {/* Time range toggle */}
    <div className="flex gap-1">
      <button className="px-3 py-1 text-xs font-medium rounded-lg">6 Months</button>
      <button className="px-3 py-1 text-xs font-medium rounded-lg">1 Year</button>
      <button className="px-3 py-1 text-xs font-medium rounded-lg">2 Years</button>
      <button className="px-3 py-1 text-xs font-medium rounded-lg">3 Years</button>
    </div>
  </div>

  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={projectedROIData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />

      {/* Solid line for actual ROI */}
      <Line
        type="monotone"
        dataKey="actualROI"
        stroke="#0D9488"
        strokeWidth={2}
        name="Actual ROI"
      />

      {/* Dashed line for projected ROI */}
      <Line
        type="monotone"
        dataKey="projectedROI"
        stroke="#0D9488"
        strokeWidth={2}
        strokeDasharray="5 5"
        name="Projected ROI"
      />
    </LineChart>
  </ResponsiveContainer>

  {/* Show "Potential ROI" label for Dev/Proposed projects */}
  {(project.status === 'dev' || project.status === 'proposed') && (
    <p className="text-xs text-gray-500 mt-2 italic">
      * Showing potential ROI based on estimated hours saved
    </p>
  )}
</div>
```

**Data Structure:**
```typescript
// For Active projects
const projectedROIData = [
  // Historical actual data (solid line)
  { month: 'Month 1', actualROI: 2000, projectedROI: null },
  { month: 'Month 2', actualROI: 4000, projectedROI: null },
  { month: 'Month 3', actualROI: 6000, projectedROI: null },
  { month: 'Month 4', actualROI: 8000, projectedROI: null },
  { month: 'Month 5', actualROI: 10000, projectedROI: null },

  // Future projected data (dashed line)
  { month: 'Month 6', actualROI: null, projectedROI: 12000 },
  { month: 'Month 7', actualROI: null, projectedROI: 14000 },
  // ... continues based on selected timeframe
]

// For Dev/Proposed projects
const potentialROIData = [
  // Start at 0, show linear growth based on hours_saved
  { month: 'Month 1', actualROI: null, projectedROI: 7604 },
  { month: 'Month 2', actualROI: null, projectedROI: 15208 },
  // ... continues
]
```

#### 4.8.4 Utility Functions

**New File:** `lib/projected-roi.ts`

```typescript
export function calculateProjectedROI(
  project: Project,
  projectionRange: '6mo' | '1yr' | '2yr' | '3yr'
): ProjectedROIResult {
  // Implementation details in Phase 1.5 spec section 5.4
}

export function generateProjectedROIChartData(
  project: Project,
  projectionRange: ProjectionRange
): Array<{ month: string; actualROI: number | null; projectedROI: number | null }> {
  // Implementation details in Phase 1.5 spec section 5.4
}

export function calculateAggregateProjectedROI(
  projects: Project[],
  projectionRange: ProjectionRange = '1yr'
): number {
  // Implementation details in Phase 1.5 spec section 5.4
}
```

**Acceptance Criteria:**
- ✅ Projected ROI chart displays on all project detail pages
- ✅ Toggle buttons switch between 6mo/1yr/2yr/3yr timeframes
- ✅ Active projects show solid line (actual) transitioning to dashed line (projected)
- ✅ Dev/Proposed projects show dashed line only with "Potential ROI" label
- ✅ Inactive projects excluded from calculations
- ✅ Calculations accurate within 5% margin
- ✅ Chart data updates when toggle changes
- ✅ Works for both employee and client views

---

### 4.9 ROI vs Cost Ratio Chart 🚧

#### 4.9.1 Overview

**Status:** 🚧 Sprint 9 (Hours 20-23)

Add a new chart showing the cumulative ratio of Total ROI ÷ Total Cost over time. This visualization demonstrates how the investment payoff improves as ROI accumulates faster than ongoing costs.

#### 4.9.2 Calculation Methodology

Formula:
```
ROI/Cost Ratio at Time T = (Total ROI at Time T) ÷ (Total Cost at Time T)
```

Example Timeline:
- Month 1: ROI = $2,000, Cost = $10,000 → Ratio = 0.2x
- Month 3: ROI = $6,000, Cost = $10,300 → Ratio = 0.58x
- Month 5: ROI = $10,000, Cost = $10,500 → Ratio = 0.95x
- Month 6: ROI = $12,000, Cost = $10,600 → Ratio = 1.13x (break-even!)
- Month 12: ROI = $24,000, Cost = $11,200 → Ratio = 2.14x

**Break-even:** Ratio crosses 1.0x when Total ROI exceeds Total Cost

#### 4.9.3 UI Component

**Location:** ROI Charts section on project detail pages
**Chart Type:** Line chart with break-even indicator
**Time Range:** Uses existing toggle (7 Days / Month / Quarter / All Time)

```tsx
<div className="bg-gray-50 rounded-lg p-4">
  <h4 className="text-sm font-semibold text-gray-700 mb-3">
    ROI vs Cost Ratio
  </h4>

  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={roiCostRatioData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="period" />
      <YAxis label={{ value: 'Ratio (x)', angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={(value: number) => [`${value.toFixed(2)}x`, 'ROI/Cost Ratio']} />
      <Legend />

      {/* Break-even reference line at 1.0x */}
      <ReferenceLine
        y={1}
        stroke="#10b981"
        strokeDasharray="3 3"
        label={{ value: 'Break-even (1.0x)', position: 'right', fill: '#10b981' }}
      />

      {/* ROI/Cost ratio line */}
      <Line
        type="monotone"
        dataKey="ratio"
        stroke="#0D9488"
        strokeWidth={2}
        name="ROI/Cost Ratio"
      />
    </LineChart>
  </ResponsiveContainer>

  {/* Current ratio display */}
  <div className="mt-3 flex items-center justify-between text-sm">
    <span className="text-gray-600">Current Ratio:</span>
    <span className={`font-bold ${
      currentRatio >= 1 ? 'text-green-600' : 'text-orange-600'
    }`}>
      {currentRatio.toFixed(2)}x
    </span>
  </div>
</div>
```

#### 4.9.4 Data Generation

**New Function in `lib/calculations.ts`:**
```typescript
export function generateROICostRatioData(
  project: Project,
  timeRange: '7days' | 'month' | 'quarter' | 'all'
): RatioDataPoint[] {
  // Implementation details in Phase 1.5 spec section 6.4
}

export function getCurrentRatioForProject(project: Project): number {
  // Implementation details in Phase 1.5 spec section 6.4
}
```

**Acceptance Criteria:**
- ✅ ROI/Cost ratio chart displays on project detail pages
- ✅ Chart uses existing time range toggle (7 Days / Month / Quarter / All Time)
- ✅ Break-even line at 1.0x is visible
- ✅ Ratio values formatted to 2 decimal places (e.g., "2.45x")
- ✅ Current ratio displayed below chart with color coding (green if ≥1, orange if <1)
- ✅ Chart shows upward sloping line as ROI accumulates
- ✅ Tooltip shows ratio value on hover
- ✅ Works for both employee and client views

---

### 4.10 Aggregate Projected ROI Metric 🚧

#### 4.10.1 Overview

**Status:** 🚧 Sprint 9 (Hours 23-24)

Add a new "Projected ROI" metric card to the Overview Metrics section on dashboards. This shows the aggregated projected ROI across all projects (or all clients for employees).

#### 4.10.2 UI Component

**Location:** Overview Metrics section on both client and employee dashboards

**Current Layout:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Time Saved  │  │ Total ROI   │  │ Total Cost  │
└─────────────┘  └─────────────┘  └─────────────┘
```

**New Layout:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Time Saved  │  │ Total ROI   │  │ Projected   │  │ Total Cost  │
│             │  │             │  │    ROI      │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Metric Card Component:**
```tsx
<MetricCard
  title="Projected ROI"
  value={formatCurrency(aggregateProjectedROI)}
  subtitle={
    <div className="flex items-center gap-2">
      <select
        value={selectedProjectionRange}
        onChange={(e) => setSelectedProjectionRange(e.target.value as ProjectionRange)}
        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="6mo">6 Months</option>
        <option value="1yr">1 Year</option>
        <option value="2yr">2 Years</option>
        <option value="3yr">3 Years</option>
      </select>
    </div>
  }
  icon={<TrendingUp className="h-6 w-6" />}
  accentColor="purple"
/>
```

**Visual Example:**
```
┌─────────────────────────────────────┐
│  Projected ROI                      │
│                                     │
│  $156,000                           │
│                                     │
│  1 year [▼]                         │
└─────────────────────────────────────┘
```

**Implementation:**

Client Dashboard (`/app/dashboard/client/page.tsx`):
```tsx
'use client'

import { useState } from 'react'
import { calculateAggregateProjectedROI } from '@/lib/projected-roi'

export default function ClientDashboard({ projects }: { projects: Project[] }) {
  const [projectionRange, setProjectionRange] = useState<ProjectionRange>('1yr')

  const aggregateProjectedROI = calculateAggregateProjectedROI(projects, projectionRange)

  return (
    <div>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Time Saved */}
        <MetricCard title="Time Saved" value={formatHours(totalTimeSaved)} />

        {/* Total ROI */}
        <MetricCard title="Total ROI" value={formatCurrency(totalROI)} />

        {/* NEW: Projected ROI */}
        <MetricCard
          title="Projected ROI"
          value={formatCurrency(aggregateProjectedROI)}
          subtitle={
            <select
              value={projectionRange}
              onChange={(e) => setProjectionRange(e.target.value as ProjectionRange)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="6mo">6 Months</option>
              <option value="1yr">1 Year</option>
              <option value="2yr">2 Years</option>
              <option value="3yr">3 Years</option>
            </select>
          }
          icon={<TrendingUp className="h-6 w-6" />}
          accentColor="purple"
        />

        {/* Total Cost */}
        <MetricCard title="Total Cost" value={formatCurrency(totalCost)} />
      </div>
    </div>
  )
}
```

Employee Dashboard (`/app/dashboard/employee/page.tsx`):
```tsx
// Similar implementation, but aggregate across all clients
const allProjects = clients.flatMap(client => client.projects || [])
const aggregateProjectedROI = calculateAggregateProjectedROI(allProjects, projectionRange)
```

**Enhanced MetricCard Component:**

Update `/components/MetricCard.tsx` to support custom subtitle with interactive elements:
```typescript
interface MetricCardProps {
  title: string
  value: string
  subtitle?: string | React.ReactNode // Support both string and JSX
  icon: React.ReactNode
  accentColor: 'blue' | 'teal' | 'orange' | 'purple'
}
```

**Acceptance Criteria:**
- ✅ "Projected ROI" card appears in Overview Metrics section
- ✅ Card positioned between "Total ROI" and "Total Cost"
- ✅ Dropdown allows selection of 6mo/1yr/2yr/3yr timeframes
- ✅ Default timeframe is 1 year
- ✅ Value updates immediately when timeframe changes
- ✅ Includes all projects (Active, Dev, Proposed) but excludes Inactive
- ✅ Works on both client and employee dashboards
- ✅ Employee dashboard aggregates across all clients

---

### 4.11 Payment Integration (Stripe) 🚧

#### 4.11.1 Overview

**Status:** 🚧 Sprint 10 (Hours 24-40)

Integrate Stripe payment processing to enable invoice creation, payment tracking, and financial management. This allows employees to bill clients and clients to view/pay invoices directly through the platform.

#### 4.11.2 Feature Scope - Phase 1.5 (MVP)

**Include:**
- ✅ Create invoices manually (employee only)
- ✅ View invoices (employee + client)
- ✅ Stripe Checkout for one-time payments
- ✅ Payment status tracking (Paid, Pending, Overdue)
- ✅ Basic payment history
- ✅ Client payment dashboard
- ✅ Employee aggregate payment overview
- ✅ Employee client-specific payment management

**Defer to Phase 2:**
- ⏸ Recurring/subscription billing
- ⏸ Auto-generated invoices from project costs
- ⏸ Email invoice sending (use Stripe's built-in email)
- ⏸ n8n webhook integration
- ⏸ Refunds and payment disputes

#### 4.11.3 User Roles & Permissions

**Employees:**
- Create invoices (modal-based form)
- Edit draft invoices
- Mark invoices as sent/paid/cancelled
- View all client invoices
- Access aggregate payment metrics
- Delete draft invoices

**Clients:**
- View their own invoices
- Pay invoices via Stripe Checkout
- View payment history
- Download invoice receipts (PDF from Stripe)

#### 4.11.4 Database Schema

**New Tables:**

1. **invoices** table:
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE, -- Auto-generated (e.g., "INV-2025-001")
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **invoice_line_items** table:
```sql
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **payments** table:
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'manual', 'check', 'wire')),
  stripe_payment_id TEXT,
  stripe_payment_status TEXT,
  paid_by UUID REFERENCES users(id),
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. **clients** table update:
```sql
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

#### 4.11.5 Stripe Configuration

**Environment Variables:**
```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...              # Server-side only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Client-side

# Stripe Webhook Secret (for payment confirmations)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Stripe Setup Script:**

File: `lib/stripe.ts`
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function getOrCreateStripeCustomer(
  clientId: string,
  clientEmail: string,
  clientName: string
): Promise<string> {
  // Implementation details in Phase 1.5 spec section 8.4.2
}

export async function createCheckoutSession(
  invoiceId: string,
  amount: number,
  clientEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  // Implementation details in Phase 1.5 spec section 8.4.2
}
```

#### 4.11.6 API Routes

**Invoice Management:**
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List invoices (filtered by role)
- `PATCH /api/invoices/[id]` - Update invoice

**Payment Processing:**
- `POST /api/payments/create-checkout-session` - Create Stripe Checkout
- `POST /api/webhooks/stripe` - Stripe webhook handler (payment confirmations)

#### 4.11.7 UI Components

**Client Payment Dashboard:**

Route: `/app/dashboard/client/payments/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Payments                                                     │
├─────────────────────────────────────────────────────────────┤
│                      INVOICES                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ INV-2025-001            [SENT] 🔵        $500.00    │   │
│  │ Due: Dec 31, 2025                                   │   │
│  │ Items: Monthly maintenance (Nov 2025)               │   │
│  │ [Pay Now]                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ INV-2025-002            [PAID] 🟢        $1,200.00  │   │
│  │ Paid: Jan 5, 2025                                   │   │
│  │ Items: Development costs (Dec 2025)                 │   │
│  │ [Download Receipt]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   PAYMENT HISTORY                            │
│  Jan 5, 2025  - $1,200.00 - INV-2025-002 (Stripe)          │
│  Dec 1, 2024  - $500.00   - INV-2024-012 (Stripe)          │
└─────────────────────────────────────────────────────────────┘
```

Components:
- `InvoiceList.tsx` - List of invoices with pay/download actions
- `PaymentHistory.tsx` - Historical payment records

**Employee Payment Dashboard:**

Route: `/app/dashboard/employee/payments/page.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Payment Dashboard                [Create Invoice]            │
├─────────────────────────────────────────────────────────────┤
│                   METRICS OVERVIEW                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total Revenue│ │ Outstanding  │ │ Paid Invoices│        │
│  │   $25,400    │ │   $2,500     │ │      18      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                  REVENUE BY CLIENT                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ UBL Group                                           │   │
│  │ 5 invoices • $8,500 paid • $500 outstanding         │   │
│  │ [View Details]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ABC Construction                                    │   │
│  │ 8 invoices • $12,400 paid • $1,200 outstanding      │   │
│  │ [View Details]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Components:
- `CreateInvoiceModal.tsx` - Modal for creating new invoices
- Employee dashboard with aggregate metrics

**Invoice Status Badges:**
- **Draft:** Gray badge (not sent to client)
- **Sent:** Blue badge (waiting for payment)
- **Paid:** Green badge (payment received)
- **Overdue:** Red badge (past due date)
- **Cancelled:** Gray badge (cancelled/voided)

#### 4.11.8 Payment Flow

**Client Payment Process:**
1. Client views invoice with status "Sent"
2. Client clicks "Pay Now" button
3. System creates Stripe Checkout Session
4. Client redirected to Stripe hosted payment page
5. Client enters card details and completes payment
6. Stripe processes payment
7. Stripe webhook notifies application
8. Invoice status updated to "Paid"
9. Client redirected to success page
10. Payment record created in database

**Employee Invoice Creation:**
1. Employee clicks "Create Invoice" button
2. Modal opens with form fields:
   - Client selection (dropdown)
   - Amount (number input)
   - Due date (date picker)
   - Line items (optional)
   - Notes (optional)
3. Employee submits form
4. Invoice number auto-generated (INV-2025-001)
5. Invoice created with status "Draft"
6. Employee can mark as "Sent" when ready

**Acceptance Criteria:**
- ✅ Employees can create invoices via modal
- ✅ Invoice numbers auto-generate (INV-2025-001 format)
- ✅ Invoices support multiple line items
- ✅ Invoice status tracks draft/sent/paid/overdue/cancelled
- ✅ Overdue status auto-applies when past due date
- ✅ Clients can pay invoices via Stripe Checkout
- ✅ Payment confirmation redirects to success page
- ✅ Webhook updates invoice status to "paid" automatically
- ✅ Payment records created in database
- ✅ Client payment page shows invoices and history
- ✅ Employee payment dashboard shows aggregate metrics
- ✅ Employee can view client-specific payments
- ✅ Status badges color-coded (green=paid, blue=sent, red=overdue)
- ✅ "Pay Now" button only shows for sent/overdue invoices
- ✅ RLS policies enforce access control
- ✅ Clients can only see their own invoices
- ✅ Employees can see all invoices
- ✅ Stripe webhook signature verified

---

## 5. Technical Architecture

### 5.1 Tech Stack

#### 5.1.1 Frontend
- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **React:** 19.1.0
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4 with PostCSS
- **Charts:** Recharts 3.x
- **State Management:** Zustand 5.x
- **Icons:** Lucide React
- **Dates:** date-fns 4.x

#### 5.1.2 Backend
- **Database:** Supabase (PostgreSQL)
  - Built-in auth
  - Real-time subscriptions
  - Row-level security (RLS)
  - Storage for file uploads
- **Authentication:** Supabase Auth (email/password, session management)
- **API:** Next.js API Routes + Supabase Client
- **Payment Processing:** Stripe (Checkout, Webhooks)

#### 5.1.3 Hosting & Deployment
- **Frontend Hosting:** Vercel (native Next.js support, automatic deployments)
- **Database Hosting:** Supabase Cloud (managed infrastructure, automatic backups)
- **File Storage:** Supabase Storage (managed object storage)

#### 5.1.4 Development Tools
- **IDE:** Cursor with Claude Code
- **Version Control:** GitHub
- **Package Manager:** pnpm (faster than npm)
- **Database Tools:** PostgreSQL MCP (direct SQL access via Claude Code)

### 5.2 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React)                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │  │
│  │  │ Client      │  │ Employee    │  │ Shared       │ │  │
│  │  │ Dashboard   │  │ Dashboard   │  │ Components   │ │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕ API Calls                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes (Server-Side)              │  │
│  │  • /api/projects  • /api/metrics  • /api/notes       │  │
│  │  • /api/files  • /api/invoices  • /api/payments      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  • users  • clients  • projects  • notes  • tasks    │  │
│  │  • files  • invoices  • payments                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Supabase Auth                            │  │
│  │  • Email/Password  • Session Management  • RLS       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Supabase Storage                         │  │
│  │  • project-files bucket  • RLS policies              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      STRIPE API                              │
│  • Checkout Sessions  • Payment Intents  • Webhooks         │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Security Architecture

#### 5.3.1 Row-Level Security (RLS) in Supabase

**Policy: Clients can only see their own data**
```sql
CREATE POLICY "Clients can view own data"
ON projects
FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM user_clients WHERE client_id = projects.client_id
));
```

**Policy: Employees can see all data**
```sql
CREATE POLICY "Employees can view all data"
ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'employee'
  )
);
```

#### 5.3.2 Server-Side Database Access (CRITICAL)

**⚠️ THE RULE:** Always use `SERVICE_ROLE_KEY` (admin client) for server-side database queries.

**Why:**
- `ANON_KEY` enforces Row-Level Security (RLS) on EVERY query
- RLS policies can block legitimate queries in server-side contexts
- Server Components run on the server where security is controlled by Next.js/middleware
- Using `SERVICE_ROLE_KEY` bypasses RLS entirely, preventing permission errors

**Three Client Types:**

1. **Browser Client (`lib/supabase-browser.ts`)** - ANON_KEY
   - For: Client Components only
   - Enforces: RLS on all queries

2. **Server Client (`lib/supabase-server.ts`)** - ANON_KEY + Cookies
   - For: Authentication checks only (`auth.getUser()`, `auth.getSession()`)
   - Enforces: RLS on all queries

3. **Admin Client (`lib/supabase-admin.ts`)** - SERVICE_ROLE_KEY ⭐
   - For: ALL data queries in Server Components, layouts, API routes
   - Bypasses: ALL RLS policies

**Correct Usage Pattern:**
```typescript
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function Page() {
  // 1. Auth check with regular client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. ALL data queries with admin client
  const supabaseAdmin = createAdminClient()
  const { data } = await supabaseAdmin.from('projects').select('*')

  return <div>{/* render */}</div>
}
```

**See Also:** `docs/CLAUDE.md` Section 3 for detailed implementation

#### 5.3.3 Authentication Flow

- Email verification required on signup
- JWT tokens stored in HTTP-only cookies (XSS protection)
- Session expiration after 7 days (configurable)
- Password reset via email link

#### 5.3.4 API Security

- All API routes validate Supabase session token
- CORS configured for production domain only
- Rate limiting on auth endpoints (prevent brute force)
- Stripe webhook signature verification

#### 5.3.5 File Upload Security

- File size limit enforced (10MB)
- Supabase Storage RLS policies:
  - Employees can upload to any project
  - Clients can upload to their own projects only
  - Employees can delete any file
  - Clients can only delete their own files
- Files accessible only via signed URLs (not publicly accessible)

#### 5.3.6 Payment Security

- Stripe Checkout for PCI-compliant card processing
- Webhook signatures verified to prevent tampering
- Customer data never stored locally (only Stripe customer IDs)
- Invoice access controlled by RLS policies

---

## 6. Database Schema

### 6.1 Core Tables (Phase 1) ✅

#### users
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### clients
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  default_employee_wage DECIMAL(10,2),
  stripe_customer_id TEXT, -- Phase 1.5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### user_clients (Multi-user mapping)
```sql
CREATE TABLE public.user_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);
```

#### projects
```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'dev', 'proposed', 'inactive')),

  -- Time savings
  hours_saved_daily DECIMAL(10,2),
  hours_saved_weekly DECIMAL(10,2),
  hours_saved_monthly DECIMAL(10,2),

  -- Costs
  employee_wage DECIMAL(10,2),
  dev_cost DECIMAL(10,2) DEFAULT 0,
  implementation_cost DECIMAL(10,2) DEFAULT 0,
  monthly_maintenance DECIMAL(10,2) DEFAULT 0,

  -- Dates
  go_live_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### notes
```sql
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  note_type TEXT NOT NULL CHECK (note_type IN ('client', 'flowmatrix_ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### tasks
```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### testimonials
```sql
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### files
```sql
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER, -- Phase 1.5: Size in bytes
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Payment Tables (Phase 1.5) 🚧

#### invoices
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### invoice_line_items
```sql
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### payments
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'manual', 'check', 'wire')),
  stripe_payment_id TEXT,
  stripe_payment_status TEXT,
  paid_by UUID REFERENCES users(id),
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Database Functions

#### Invoice Number Generation
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  max_number INTEGER;
  new_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());

  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)),
    0
  )
  INTO max_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';

  new_number := 'INV-' || current_year || '-' || LPAD((max_number + 1)::TEXT, 3, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

#### Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Similar triggers for other tables...)
```

### 6.4 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_author_id ON notes(author_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
```

---

## 7. Implementation Roadmap

### 7.1 Phase 1: Core MVP ✅ (Complete)

**Sprints 1-7** (48+ hours)

#### Sprint 1: Foundation ✅
- [x] Project setup (Next.js 15, TypeScript, Tailwind CSS 4)
- [x] Supabase configuration
- [x] Database schema creation
- [x] Authentication flow (login, signup, logout)

#### Sprint 2: Client Dashboard ✅
- [x] Client dashboard layout
- [x] Overview metrics (Time Saved, Total ROI, Total Costs)
- [x] Project cards with status badges
- [x] Time range toggle

#### Sprint 3: Project Detail View ✅
- [x] Project detail page (separate route, not modal)
- [x] ROI charts (Line and Bar charts)
- [x] Metrics breakdown
- [x] Cost breakdown
- [x] Tasks section
- [x] Full note history
- [x] Associated files display

#### Sprint 4: Employee Dashboard ✅
- [x] Employee dashboard layout
- [x] Master metrics overview
- [x] Client account cards
- [x] Employee invitation system

#### Sprint 5: Edit Mode ✅
- [x] Editable project cards (`EditableProjectCard.tsx`)
- [x] Editable project detail content (`EditableProjectDetailContent.tsx`)
- [x] Auto-save with 1-second debounce
- [x] Visual feedback (Saving.../Saved/Error)
- [x] Yellow borders on editable fields
- [x] Error handling and rollback

#### Sprint 6: Notes & Tasks ✅
- [x] Dual notes panel (`NotesPanel.tsx`)
- [x] Client notes (create, edit, delete)
- [x] FlowMatrix AI notes (employee-only create/edit)
- [x] Task creation (`AddTaskForm.tsx`)
- [x] Task completion tracking
- [x] Outstanding tasks section

#### Sprint 7: Polish & Testing ✅
- [x] Loading skeletons (`LoadingSkeletons.tsx`)
- [x] Empty states (`EmptyStates.tsx`)
- [x] Button component system (`Button.tsx`)
- [x] Error handling patterns (`lib/errors.ts`, `lib/validation.ts`)
- [x] Testimonial form (`TestimonialForm.tsx`)
- [x] Cross-browser testing
- [x] Mobile responsiveness
- [x] Performance optimization

---

### 7.2 Phase 1.5: Enhancements 🚧 (Current)

**Sprints 8-10** (32-40 hours)

#### Sprint 8: UI Refinements & File Upload 🚧 (12 hours)
**Hours 0-2:** Edit Mode UI Cleanup
- [ ] Remove yellow notice boxes from employee pages
- [ ] Remove yellow "EDIT MODE" tags
- [ ] Replace yellow borders with standard gray borders
- [ ] Update focus states to blue
- [ ] Test all editing functionality still works

**Hours 2-5:** File Upload Infrastructure
- [ ] Add `file_size` column to `files` table (migration)
- [ ] Create Supabase Storage bucket `project-files`
- [ ] Configure Storage RLS policies
- [ ] Create `POST /api/files` route (upload)
- [ ] Create `DELETE /api/files/[id]` route

**Hours 5-9:** File Upload UI Components
- [ ] Create `FileUploadZone.tsx` component
- [ ] Create `FileItem.tsx` component
- [ ] Add drag-and-drop functionality
- [ ] Add progress indicators
- [ ] Implement error handling (size limit, network errors)
- [ ] Add upload badge (Employee/Client)

**Hours 9-12:** Integration & Testing
- [ ] Integrate `FileUploadZone` into project detail pages
- [ ] Test upload from client view
- [ ] Test upload from employee view
- [ ] Test delete permissions
- [ ] Test file size limit enforcement
- [ ] Test download functionality
- [ ] Fix bugs and edge cases

---

#### Sprint 9: Projected ROI Features 🚧 (12 hours)
**Hours 12-16:** Projected ROI Calculations
- [ ] Create `lib/projected-roi.ts` utility file
- [ ] Implement `calculateProjectedROI()` function
- [ ] Implement `generateProjectedROIChartData()` function
- [ ] Implement `calculateAggregateProjectedROI()` function
- [ ] Write unit tests for calculations
- [ ] Test with sample project data

**Hours 16-20:** Projected ROI Chart Component
- [ ] Create `ProjectedROIChart` component
- [ ] Add time range toggle (6mo/1yr/2yr/3yr)
- [ ] Implement chart with Recharts (solid + dashed lines)
- [ ] Add "Potential ROI" indicator for Dev/Proposed projects
- [ ] Style chart with brand colors
- [ ] Test chart updates when toggle changes

**Hours 20-23:** ROI/Cost Ratio Chart
- [ ] Implement `generateROICostRatioData()` function
- [ ] Create `ROICostRatioChart` component
- [ ] Add break-even reference line at 1.0x
- [ ] Display current ratio below chart
- [ ] Integrate with existing time range toggle
- [ ] Test calculations with manual verification

**Hours 23-24:** Aggregate Projected ROI Metric
- [ ] Update `MetricCard` component to support dropdown subtitle
- [ ] Add "Projected ROI" card to Overview Metrics section
- [ ] Implement dropdown for timeframe selection (6mo/1yr/2yr/3yr)
- [ ] Default to 1-year projection
- [ ] Test on client dashboard
- [ ] Test on employee dashboard (aggregate across all clients)

---

#### Sprint 10: Payment Integration 🚧 (16 hours)
**Hours 24-26:** Database Schema & Stripe Setup
- [ ] Run database migration (invoices, payments tables)
- [ ] Verify tables created with correct constraints
- [ ] Add Stripe API keys to environment variables
- [ ] Create `lib/stripe.ts` configuration file
- [ ] Test Stripe connection
- [ ] Install Stripe CLI for webhook testing

**Hours 26-30:** Invoice Management API
- [ ] Create `POST /api/invoices` route (create invoice)
- [ ] Create `GET /api/invoices` route (list invoices)
- [ ] Create `PATCH /api/invoices/[id]` route (update invoice)
- [ ] Implement invoice number generation
- [ ] Add validation for all routes
- [ ] Test with Postman/curl

**Hours 30-34:** Payment Processing API
- [ ] Create `POST /api/payments/create-checkout-session` route
- [ ] Implement Stripe Checkout Session creation
- [ ] Create `POST /api/webhooks/stripe` route
- [ ] Implement webhook signature verification
- [ ] Implement payment confirmation handler
- [ ] Test webhook with Stripe CLI

**Hours 34-37:** Client Payment Dashboard
- [ ] Create `/app/dashboard/client/payments/page.tsx`
- [ ] Create `InvoiceList.tsx` component
- [ ] Create `PaymentHistory.tsx` component
- [ ] Add "Pay Now" button with Stripe Checkout integration
- [ ] Add payment success/cancel handling
- [ ] Style with Tailwind CSS
- [ ] Test end-to-end payment flow

**Hours 37-40:** Employee Payment Dashboard
- [ ] Create `/app/dashboard/employee/payments/page.tsx`
- [ ] Display aggregate payment metrics
- [ ] Show revenue by client
- [ ] Create `CreateInvoiceModal.tsx` component
- [ ] Add client-specific payment view
- [ ] Implement invoice status management
- [ ] Test with multiple clients
- [ ] Final testing and bug fixes

---

### 7.3 Phase 2: Advanced Features ⏸ (Deferred)

**Estimated:** 60-80 hours

- Recurring billing and subscriptions
- Auto-generated invoices from project costs
- Email notifications (invoice sent, payment received, overdue reminders)
- Advanced reporting and data exports (PDF, CSV)
- n8n workflow integration (webhooks on project/payment events)
- AI-powered insights (ROI trends, anomaly detection)
- Advanced role-based permissions (read-only users, approval workflows)
- White-label capability for resellers

---

### 7.4 Phase 3: Scale & Optimization ⏸ (Future)

**Estimated:** 80-120 hours

- Mobile app (iOS/Android with React Native)
- Advanced analytics dashboard
- API for third-party integrations
- Multi-language support (i18n)
- Advanced caching and performance optimization
- Custom domain support
- Enterprise features (SSO, audit logs)

---

## 8. Design Specifications

### 8.1 Color Palette

**Primary Colors:**
```css
--primary-blue:     #1E3A8A  /* Deep Blue (primary actions) */
--teal:             #0D9488  /* Teal (ROI, success) */
--orange:           #F97316  /* Orange (costs, warnings) */
--purple:           #9333EA  /* Purple (projected ROI) */
```

**Status Colors:**
```css
--status-active:    #10B981  /* Green */
--status-dev:       #3B82F6  /* Blue */
--status-proposed:  #F59E0B  /* Yellow */
--status-inactive:  #6B7280  /* Gray */
```

**Semantic Colors:**
```css
--success:          #10B981  /* Green */
--warning:          #F59E0B  /* Yellow */
--error:            #EF4444  /* Red */
--info:             #3B82F6  /* Blue */
```

**Neutral Colors:**
```css
--gray-50:          #F9FAFB
--gray-100:         #F3F4F6
--gray-200:         #E5E7EB
--gray-300:         #D1D5DB
--gray-400:         #9CA3AF
--gray-500:         #6B7280
--gray-600:         #4B5563
--gray-700:         #374151
--gray-800:         #1F2937
--gray-900:         #111827
```

### 8.2 Typography

**Font Family:**
- System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

**Font Sizes:**
```css
--text-xs:    0.75rem   /* 12px */
--text-sm:    0.875rem  /* 14px */
--text-base:  1rem      /* 16px */
--text-lg:    1.125rem  /* 18px */
--text-xl:    1.25rem   /* 20px */
--text-2xl:   1.5rem    /* 24px */
--text-3xl:   1.875rem  /* 30px */
--text-4xl:   2.25rem   /* 36px */
```

**Font Weights:**
```css
--font-normal:    400
--font-medium:    500
--font-semibold:  600
--font-bold:      700
```

### 8.3 Spacing

```css
--space-1:  0.25rem   /* 4px */
--space-2:  0.5rem    /* 8px */
--space-3:  0.75rem   /* 12px */
--space-4:  1rem      /* 16px */
--space-5:  1.25rem   /* 20px */
--space-6:  1.5rem    /* 24px */
--space-8:  2rem      /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
```

### 8.4 Shadows

```css
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow:     0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

### 8.5 Border Radius

```css
--rounded-sm:   0.125rem  /* 2px */
--rounded:      0.25rem   /* 4px */
--rounded-md:   0.375rem  /* 6px */
--rounded-lg:   0.5rem    /* 8px */
--rounded-xl:   0.75rem   /* 12px */
--rounded-2xl:  1rem      /* 16px */
--rounded-full: 9999px    /* Full circle */
```

### 8.6 Component Patterns

**Card:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
  {/* Content */}
</div>
```

**Primary Button:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
  Action
</button>
```

**Status Badge:**
```tsx
<span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800">
  Active
</span>
```

**Input Field:**
```tsx
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             transition-colors"
/>
```

---

## 9. Testing & Validation

### 9.1 Testing Strategy

**Unit Tests:**
- Calculation functions (`calculateROI`, `calculateProjectedROI`, `generateROICostRatioData`)
- Validation functions (`validateEmail`, `validateUUID`, `validateTaskCreate`)
- Utility functions (date formatting, currency formatting)

**Integration Tests:**
- API routes (`/api/projects`, `/api/invoices`, `/api/payments`)
- Database queries with RLS policies
- Stripe webhook handler

**End-to-End Tests:**
- User authentication flow (signup, login, logout)
- Client dashboard data display
- Employee edit mode (create, update, delete operations)
- File upload and download
- Invoice creation and payment processing

**Manual Testing:**
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iOS Safari, Android Chrome)
- Accessibility (keyboard navigation, screen readers)
- Performance (page load times, chart rendering)

### 9.2 Acceptance Criteria Checklist

#### Phase 1: Core Features ✅

**Authentication:**
- [x] Users can sign up with email/password
- [x] Users can log in and log out
- [x] Clients can only access client dashboard
- [x] Employees can access both employee and client dashboards
- [x] Multi-user accounts work (multiple users per client)

**Client Dashboard:**
- [x] Overview metrics display correctly (Time Saved, Total ROI, Total Costs)
- [x] Project cards show correct status badges
- [x] Time range toggle updates all metrics
- [x] Outstanding tasks section shows incomplete tasks
- [x] Notes panel allows adding/editing notes
- [x] Testimonial form submits successfully

**Project Detail View:**
- [x] Page route works (`/dashboard/client/projects/[id]`)
- [x] ROI charts display correctly (Line and Bar charts)
- [x] Metrics breakdown shows all calculations
- [x] Cost breakdown displays itemized costs
- [x] Tasks section shows completion status
- [x] Full note history displays chronologically
- [x] Associated files section shows file list

**Employee Dashboard:**
- [x] Master metrics overview displays correctly
- [x] Client account cards show all metrics
- [x] "View Dashboard" button navigates to client view
- [x] Add Employee button opens modal and sends invitation

**Edit Mode:**
- [x] All input fields are editable for employees
- [x] Auto-save triggers after 1-second debounce
- [x] Visual feedback shows Saving.../Saved/Error states
- [x] Error handling reverts to original value on failure
- [x] Changes persist after page refresh

#### Phase 1.5: Enhancements 🚧

**UI Refinements:**
- [ ] No yellow visual indicators anywhere
- [ ] All editing functionality still works
- [ ] Standard gray borders with blue focus states
- [ ] Save state indicators remain visible

**File Upload:**
- [ ] Drag-and-drop upload works
- [ ] Click-to-browse file picker works
- [ ] Progress indicator shows during upload
- [ ] Files appear immediately after upload
- [ ] 10MB size limit enforced with error message
- [ ] Download buttons work for all accessible files
- [ ] Delete permissions enforced correctly

**Projected ROI:**
- [ ] Projected ROI chart displays on project detail pages
- [ ] Toggle switches between 6mo/1yr/2yr/3yr timeframes
- [ ] Active projects show actual + projected lines
- [ ] Dev/Proposed projects show potential ROI
- [ ] Calculations accurate within 5% margin

**ROI/Cost Ratio:**
- [ ] Chart displays on project detail pages
- [ ] Break-even line at 1.0x is visible
- [ ] Current ratio displays with color coding
- [ ] Chart updates with time range toggle

**Aggregate Projected ROI:**
- [ ] Card appears in Overview Metrics section
- [ ] Dropdown switches timeframes
- [ ] Default timeframe is 1 year
- [ ] Value updates immediately when timeframe changes

**Payment Integration:**
- [ ] Employees can create invoices
- [ ] Invoice numbers auto-generate correctly
- [ ] Clients can view invoices
- [ ] Clients can pay via Stripe Checkout
- [ ] Payment confirmation redirects to success page
- [ ] Webhook updates invoice status automatically
- [ ] Employee dashboard shows payment metrics
- [ ] RLS policies enforce access control

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **Aggregate ROI** | Sum of ROI across all active projects |
| **Auto-save** | Automatic saving of changes after 1-second debounce (no manual save button) |
| **Break-even** | Point where Total ROI equals Total Cost (ratio = 1.0x) |
| **Client** | User with role 'client' (can view their own dashboard) |
| **Edit Mode** | State where employee can edit all fields in client dashboard |
| **Employee** | User with role 'employee' (can view/edit all client dashboards) |
| **Multi-tenancy** | Multiple client accounts with isolated data |
| **Potential ROI** | Theoretical ROI for Dev/Proposed projects based on estimated hours saved |
| **Projected ROI** | Estimated future ROI based on linear projection of current performance |
| **RLS (Row-Level Security)** | Database-level access control enforced by Supabase |
| **ROI (Return on Investment)** | Hours Saved × Employee Wage |
| **ROI/Cost Ratio** | Total ROI ÷ Total Cost (indicates payback multiple) |
| **SERVICE_ROLE_KEY** | Supabase key that bypasses RLS (server-side only, never exposed to browser) |
| **Stripe Checkout** | Stripe's hosted payment page for secure card processing |
| **Webhook** | HTTP callback that delivers real-time payment status updates |

### 10.2 Related Documents

- **CLAUDE.md** - Technical implementation guide (HOW to build)
- **Database Schema Documentation** - Complete schema reference with RLS policies
- **Supabase Documentation** - https://supabase.com/docs
- **Stripe Documentation** - https://stripe.com/docs
- **Recharts Documentation** - https://recharts.org/en-US/

### 10.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2024 | Initial PRD - Phase 1 Core MVP | FlowMatrix AI Team |
| 2.0 | Jan 2025 | Added Phase 1.5 Enhancements (File Upload, Projected ROI, Payments) | FlowMatrix AI Team |

### 10.4 Contact & Support

**For Questions:**
- Product Owner: FlowMatrix AI Team
- Technical Lead: Claude Code
- Repository: GitHub (private)

**Resources:**
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard

---

## Document Approval

**Version:** 2.0
**Status:** Ready for Implementation (Phase 1.5)
**Last Updated:** January 2025

**Phase 1 Status:** ✅ Complete
**Phase 1.5 Status:** 🚧 In Progress (Sprint 8 starting)

---

**End of PRD v2.0**

This document should be read in conjunction with:
- **`docs/CLAUDE.md`** - Technical implementation guide (HOW to build)
- **Database Schema** - `supabase/migrations/` (SQL migration files)
- **Wireframes** - Embedded in feature specifications above

For implementation, proceed with **Sprint 8** (Section 7.2) and reference the technical specifications in **Sections 4.6-4.11**.
