# ClientCard Component

## Overview

The `ClientCard` component displays a summary of client account information for the Employee Dashboard. It shows key metrics, payment status, and provides quick navigation to the client's full dashboard.

**PRD Reference:** Section 4.3.4 (Client Account Cards)
**Component Location:** `/components/ClientCard.tsx`
**Example Usage:** `/components/ClientCard.example.tsx`

---

## Features Implemented ✅

- ✅ **Active Workflows** - Count of systems with status = 'active'
- ✅ **Uncompleted Tasks** - Count of tasks where is_completed = false
- ✅ **New Client Notes** - Count with red indicator (🔴) for unread client notes
- ✅ **Total ROI** - Aggregated ROI formatted as currency
- ✅ **Payment Status** - Badge with icon (Paid ✓, Overdue ⚠️, Pending ⏳)
- ✅ **Total Revenue** - Formatted currency (hardcoded $0 for MVP)
- ✅ **View Dashboard Button** - Navigates to client dashboard with edit mode enabled
- ✅ **Responsive Design** - Mobile-first with grid breakpoints
- ✅ **Hover Effects** - Card elevation and smooth transitions

---

## Usage

### Basic Usage

```tsx
import { ClientCard } from '@/components/ClientCard'

<ClientCard
  id="client-123"
  companyName="UBL Group"
  activeWorkflows={3}
  uncompletedTasks={2}
  newClientNotes={1}
  totalROI={2418}
  paymentStatus="paid"
  totalRevenue={0}
/>
```

### Grid Layout (Recommended)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {clients.map(client => (
    <ClientCard key={client.id} {...client} />
  ))}
</div>
```

### With Real Data (Server Component)

```tsx
import { ClientCard } from '@/components/ClientCard'
import { createAdminClient } from '@/lib/supabase-admin'

export default async function EmployeeDashboard() {
  const supabaseAdmin = createAdminClient()

  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select(`
      id,
      company_name,
      projects (
        id,
        status,
        tasks (id, is_completed),
        notes (id, note_type, is_read)
      )
    `)

  const clientMetrics = clients?.map(client => ({
    id: client.id,
    companyName: client.company_name,
    activeWorkflows: client.projects?.filter(p => p.status === 'active').length || 0,
    uncompletedTasks: client.projects?.flatMap(p => p.tasks)
      ?.filter(t => !t.is_completed).length || 0,
    newClientNotes: client.projects?.flatMap(p => p.notes)
      ?.filter(n => n.note_type === 'client' && !n.is_read).length || 0,
    totalROI: calculateClientROI(client.projects),
    paymentStatus: 'paid' as const,
    totalRevenue: 0
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clientMetrics?.map(client => (
        <ClientCard key={client.id} {...client} />
      ))}
    </div>
  )
}
```

---

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | ✅ Yes | - | Unique client ID |
| `companyName` | `string` | ✅ Yes | - | Client company name |
| `activeWorkflows` | `number` | ✅ Yes | - | Count of active projects |
| `uncompletedTasks` | `number` | ✅ Yes | - | Count of incomplete tasks |
| `newClientNotes` | `number` | ✅ Yes | - | Count of unread client notes |
| `totalROI` | `number` | ✅ Yes | - | Total ROI in dollars |
| `paymentStatus` | `'paid' \| 'overdue' \| 'pending'` | ❌ No | `'paid'` | Payment status badge |
| `totalRevenue` | `number` | ❌ No | `0` | Total revenue in dollars |

---

## Responsive Grid Breakpoints

| Device | Screen Size | Columns | Tailwind Class |
|--------|-------------|---------|----------------|
| Mobile | < 768px | 1 | `grid-cols-1` |
| Tablet | ≥ 768px | 2 | `md:grid-cols-2` |
| Desktop | ≥ 1024px | 3 | `lg:grid-cols-3` |

---

## Visual Indicators

### New Client Notes Indicator

When `newClientNotes > 0`, a red pulsing dot (🔴) appears next to the count:

```
New Client Notes: 3 🔴
```

### Payment Status Badges

- **Paid ✓** - Green badge (`bg-green-100`, `text-green-800`)
- **Overdue ⚠️** - Red badge (`bg-red-100`, `text-red-800`)
- **Pending ⏳** - Yellow badge (`bg-yellow-100`, `text-yellow-800`)

---

## Navigation

The "View Dashboard" button navigates to:
```
/dashboard/employee/clients/${id}
```

This route enables **edit mode**, allowing employees to:
- Update project metrics
- Add/edit FlowMatrix AI notes
- Manage tasks
- Upload files
- View client notes (read-only)

**Note:** This route is implemented in Sprint 4 (PRD Section 4.3.5).

---

## Component Structure

```
┌─────────────────────────────────────────────────────────┐
│ [Client Name: UBL Group]              [View Dashboard] │
│ ─────────────────────────────────────────────────────── │
│ Active Workflows: 3                                     │
│ Uncompleted Tasks: 2                                    │
│ New Client Notes: 1 🔴                                  │
│ Total ROI: $2,418                                       │
│ ─────────────────────────────────────────────────────── │
│ Payment Status: Paid ✓                                  │
│ Total Revenue: $0                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### Current Implementation Status

**✅ Completed:**
- Component created at `/components/ClientCard.tsx`
- Integrated into Employee Dashboard (`/app/dashboard/employee/page.tsx`)
- Responsive grid layout (1/2/3 columns)
- All metrics displaying correctly
- Payment status badges
- New notes indicator
- Hover effects and transitions

**🚧 Pending (Sprint 4):**
- Individual client dashboard route (`/dashboard/employee/clients/[id]`)
- Edit mode implementation
- Real payment status tracking (Phase 2)
- Real revenue tracking (Phase 2)

### Styling

- **Card:** `bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200`
- **Button:** `bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors`
- **Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter)
- Screen reader friendly text
- Proper focus indicators

---

## Related Files

- **Component:** `/components/ClientCard.tsx`
- **Example:** `/components/ClientCard.example.tsx`
- **Usage:** `/app/dashboard/employee/page.tsx`
- **Types:** `/types/database.ts`
- **Utilities:** `/lib/calculations.ts` (formatCurrency)

---

## Migration from ClientAccountCard

If you're updating from the previous `ClientAccountCard` component:

1. Update import:
   ```tsx
   // Old
   import { ClientAccountCard } from '@/components/ClientAccountCard'

   // New
   import { ClientCard } from '@/components/ClientCard'
   ```

2. Update component usage (props remain the same):
   ```tsx
   // Old
   <ClientAccountCard {...client} />

   // New
   <ClientCard {...client} />
   ```

3. Update grid layout (optional, for 3-column desktop):
   ```tsx
   // Old
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

   // New
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
   ```

---

## Testing Checklist

- [ ] Component renders with all required props
- [ ] Grid layout is responsive (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] "View Dashboard" button navigates correctly
- [ ] Red indicator (🔴) appears when newClientNotes > 0
- [ ] Payment status badges display correct colors and icons
- [ ] Hover effects work smoothly
- [ ] ROI and revenue display as formatted currency
- [ ] Component works with empty/zero values
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Accessible to screen readers

---

## Support

For questions or issues:
1. Check PRD Section 4.3.4 for requirements
2. Review example usage in `/components/ClientCard.example.tsx`
3. Check CLAUDE.md for component patterns
4. Verify data structure in `/types/database.ts`

---

**Last Updated:** Sprint 4 Implementation
**Status:** ✅ Complete (pending dynamic route for edit mode)
