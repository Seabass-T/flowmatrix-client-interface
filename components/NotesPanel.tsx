'use client'

import { useState, useEffect } from 'react'
import { Note, Project } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { Pencil, Trash2, Send } from 'lucide-react'

interface NotesPanelProps {
  projects: Project[]
  userId: string
  userRole: 'client' | 'employee'
  initialNotes?: Note[]
}

export function NotesPanel({ projects, userId, userRole, initialNotes = [] }: NotesPanelProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Separate notes by type
  const clientNotes = notes.filter((note) => note.note_type === 'client')
  const flowmatrixNotes = notes.filter((note) => note.note_type === 'flowmatrix_ai')

  // Fetch notes when project selection changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchNotes(selectedProjectId)
    } else {
      setNotes([])
    }
  }, [selectedProjectId])

  const fetchNotes = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notes?project_id=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim() || !selectedProjectId) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          author_id: userId,
          note_type: userRole === 'employee' ? 'flowmatrix_ai' : 'client',
          content: newNoteContent.trim(),
        }),
      })

      if (response.ok) {
        const newNote = await response.json()
        setNotes([...notes, newNote])
        setNewNoteContent('')
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: noteId,
          content: editContent.trim(),
        }),
      })

      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(notes.map((note) => (note.id === noteId ? updatedNote : note)))
        setEditingNoteId(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('Failed to edit note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId }),
      })

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const canEditNote = (note: Note) => {
    // Employees can edit all notes, clients can only edit their own client notes
    if (userRole === 'employee') return true
    return note.note_type === 'client' && note.author_id === userId
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT PANEL: CLIENT NOTES */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Client Notes</h3>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-6">
          <div className="mb-3">
            <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              id="note-content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note here..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {newNoteContent.length}/500 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedProjectId || !newNoteContent.trim() || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Adding Note...' : 'Add Note'}
          </button>
        </form>

        {/* Note Thread Display */}
        <div className="border-t border-gray-200 pt-4">
          {loading && (
            <div className="text-center text-gray-500 py-4">Loading notes...</div>
          )}

          {!loading && selectedProjectId && clientNotes.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No client notes yet. Add one above!
            </div>
          )}

          {!loading && !selectedProjectId && (
            <div className="text-center text-gray-500 py-4">
              Select a project to view notes
            </div>
          )}

          {!loading && clientNotes.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {clientNotes.map((note) => (
                <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-blue-800 uppercase mb-1">
                        CLIENT NOTE
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {canEditNote(note) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id)
                            setEditContent(note.content)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Edit note"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(null)
                            setEditContent('')
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 mt-2 whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: FLOWMATRIX AI NOTES */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">FlowMatrix AI Notes</h3>

        <div className="border-t border-gray-200 pt-4">
          {loading && (
            <div className="text-center text-gray-500 py-4">Loading notes...</div>
          )}

          {!loading && selectedProjectId && flowmatrixNotes.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No FlowMatrix AI notes yet.
            </div>
          )}

          {!loading && !selectedProjectId && (
            <div className="text-center text-gray-500 py-4">
              Select a project to view notes
            </div>
          )}

          {!loading && flowmatrixNotes.length > 0 && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {flowmatrixNotes.map((note) => (
                <div key={note.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-green-800 uppercase mb-1">
                        FLOWMATRIX AI
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-800 mt-2 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
