/**
 * Example usage of TestimonialForm component
 *
 * This component allows clients to submit testimonials about their
 * experience with FlowMatrix AI. Features character limit and validation.
 *
 * PRD Reference: Section 4.2.6 - Testimonial Section
 */

import { TestimonialForm } from '@/components/TestimonialForm'

// Example 1: Basic usage in client dashboard
export function TestimonialFormExample() {
  const clientId = 'c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'
  const userId = 'user-1234-5678-90ab-cdef'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Basic usage */}
      <div>
        <h2 className="text-xl font-bold mb-4">Testimonial Form</h2>
        <TestimonialForm clientId={clientId} userId={userId} />
      </div>
    </div>
  )
}

/**
 * FEATURES:
 *
 * ✅ Text area with 300 character limit
 * ✅ Real-time character counter (changes color as limit approaches)
 * ✅ Submit button (disabled when empty)
 * ✅ Loading state during submission
 * ✅ Success message after submission (auto-dismisses after 5 seconds)
 * ✅ Error handling with user-friendly messages
 * ✅ Responsive design
 * ✅ Icon-based visual design
 *
 * CHARACTER COUNTER COLORS:
 * - Gray: 50+ characters remaining
 * - Orange: 20-49 characters remaining
 * - Red: 0-19 characters remaining (bold)
 *
 * VALIDATION:
 * - Content cannot be empty (whitespace only)
 * - Content must be 300 characters or less
 * - User must be authenticated
 * - User must have access to the client_id
 * - Only clients can submit testimonials (enforced server-side)
 *
 * API INTEGRATION:
 *
 * The form posts to /api/testimonials:
 *
 * POST /api/testimonials
 * {
 *   "client_id": "uuid",
 *   "user_id": "uuid",
 *   "content": "testimonial text"
 * }
 *
 * Response (201 Created):
 * {
 *   "message": "Testimonial submitted successfully",
 *   "testimonial": {
 *     "id": "uuid",
 *     "client_id": "uuid",
 *     "user_id": "uuid",
 *     "content": "testimonial text",
 *     "created_at": "2025-10-12T..."
 *   }
 * }
 *
 * INTEGRATION IN SERVER COMPONENT:
 *
 * // app/dashboard/client/page.tsx
 * export default async function ClientDashboard() {
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *
 *   const supabaseAdmin = createAdminClient()
 *   const { data: userClientData } = await supabaseAdmin
 *     .from('user_clients')
 *     .select('client_id')
 *     .eq('user_id', user.id)
 *     .single()
 *
 *   return (
 *     <div>
 *       <TestimonialForm
 *         clientId={userClientData.client_id}
 *         userId={user.id}
 *       />
 *     </div>
 *   )
 * }
 *
 * DATABASE SCHEMA:
 *
 * CREATE TABLE testimonials (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   content TEXT NOT NULL,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * RLS POLICY:
 *
 * CREATE POLICY "Clients can insert own testimonials"
 * ON testimonials FOR INSERT
 * WITH CHECK (
 *   user_id = auth.uid() AND
 *   client_id IN (
 *     SELECT client_id FROM user_clients WHERE user_id = auth.uid()
 *   )
 * );
 *
 * CREATE POLICY "Employees can view all testimonials"
 * ON testimonials FOR SELECT
 * USING (
 *   EXISTS (
 *     SELECT 1 FROM users WHERE id = auth.uid() AND role = 'employee'
 *   )
 * );
 */
