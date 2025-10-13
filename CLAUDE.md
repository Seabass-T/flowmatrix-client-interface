# Instructions for Claude Code

## Critical Rule: Complex Detail Views

**⚠️ NEVER spend more than 2 hours debugging modal rendering issues.**

When implementing detail views (project details, user profiles, any complex multi-section content):

1. **ALWAYS prefer page routes over modals** for complex detail views
2. **If a modal doesn't render after 2 debugging iterations, STOP**
3. **Switch to a separate page route immediately**

## Why This Matters

After 3+ hours of debugging a ProjectDetailModal that wouldn't render despite:
- ✅ Successful API calls
- ✅ Correct state management (isOpen=true, hasProject=true)
- ✅ No console errors
- ✅ All logic working correctly
- ❌ Modal simply didn't appear (unknown root cause with Next.js 15 / React 19)

**The page route solution took 45 minutes and provided BETTER UX:**
- ✅ Shareable/bookmarkable URLs
- ✅ Browser back button works
- ✅ Simpler code (90% less complexity)
- ✅ 100% reliable
- ✅ Standard Next.js patterns

## Decision Tree for Detail Views

```
Need to show detailed information?
├─ Simple/quick (confirmation, 1-3 fields)
│  └─ Use Modal ✅
└─ Complex (charts, metrics, multiple sections)
   └─ Use Separate Page Route ✅
```

## Implementation Reference

See `docs/CLAUDE.md` Section 6 for full implementation patterns.

Key files created for page route approach:
- `/app/dashboard/client/projects/[id]/page.tsx` - Server-side page
- `/components/ProjectDetailContent.tsx` - Reusable content component
- Modified `/components/ProjectCardList.tsx` - Simple navigation with `router.push()`

## When Working on This Codebase

1. **Read `docs/PRD.md` first** - Understand WHAT to build
2. **Reference `docs/CLAUDE.md`** - Understand HOW to build
3. **Follow the patterns documented** - Don't reinvent the wheel
4. **If stuck for >2 hours on UI rendering, switch approach**
5. **Document new patterns in `docs/CLAUDE.md`**

---

**Remember:** Sometimes the simplest solution is the best solution. Page routes > Modals for complex views.
