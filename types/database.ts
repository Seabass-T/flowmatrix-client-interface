/**
 * Database types for FlowMatrix AI Client Interface
 * Based on Supabase PostgreSQL schema
 */

// Enums
export type UserRole = 'client' | 'employee'
export type ProjectStatus = 'active' | 'dev' | 'proposed' | 'inactive'
export type NoteType = 'client' | 'flowmatrix_ai'

// Table: users
export interface User {
  id: string // UUID, references auth.users
  email: string
  role: UserRole
  created_at: string // timestamp
  last_login: string | null // timestamp
}

// Table: clients
export interface Client {
  id: string // UUID
  company_name: string
  industry: string | null
  avg_employee_wage: number | null // decimal(10,2)
  created_at: string // timestamp
  updated_at: string // timestamp
}

// Table: user_clients (junction table)
export interface UserClient {
  id: string // UUID
  user_id: string // UUID, foreign key to users.id
  client_id: string // UUID, foreign key to clients.id
  created_at: string // timestamp
}

// Table: projects
export interface Project {
  id: string // UUID
  client_id: string // UUID, foreign key to clients.id
  name: string
  status: ProjectStatus
  hours_saved_daily: number | null // decimal(10,2)
  hours_saved_weekly: number | null // decimal(10,2)
  hours_saved_monthly: number | null // decimal(10,2)
  employee_wage: number | null // decimal(10,2)
  dev_cost: number // decimal(10,2), default 0
  implementation_cost: number // decimal(10,2), default 0
  monthly_maintenance: number // decimal(10,2), default 0
  go_live_date: string | null // date
  created_at: string // timestamp
  updated_at: string // timestamp
}

// Table: notes
export interface Note {
  id: string // UUID
  project_id: string // UUID, foreign key to projects.id
  author_id: string // UUID, foreign key to users.id
  note_type: NoteType
  content: string
  is_read: boolean // default false
  created_at: string // timestamp
}

// Table: tasks
export interface Task {
  id: string // UUID
  project_id: string // UUID, foreign key to projects.id
  description: string
  is_completed: boolean // default false
  due_date: string | null // date
  created_at: string // timestamp
  completed_at: string | null // timestamp
}

// Table: files
export interface File {
  id: string // UUID
  project_id: string // UUID, foreign key to projects.id
  file_name: string
  file_url: string
  file_type: string | null
  uploaded_by: string // UUID, foreign key to users.id
  created_at: string // timestamp
}

// Table: testimonials
export interface Testimonial {
  id: string // UUID
  client_id: string // UUID, foreign key to clients.id
  user_id: string // UUID, foreign key to users.id
  content: string
  created_at: string // timestamp
}

// Supabase Database type (for typed client)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<User, 'id'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Client, 'id'>>
      }
      user_clients: {
        Row: UserClient
        Insert: Omit<UserClient, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<UserClient, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
          dev_cost?: number
          implementation_cost?: number
          monthly_maintenance?: number
        }
        Update: Partial<Omit<Project, 'id'>>
      }
      notes: {
        Row: Note
        Insert: Omit<Note, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          is_read?: boolean
        }
        Update: Partial<Omit<Note, 'id'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          is_completed?: boolean
        }
        Update: Partial<Omit<Task, 'id'>>
      }
      files: {
        Row: File
        Insert: Omit<File, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<File, 'id'>>
      }
      testimonials: {
        Row: Testimonial
        Insert: Omit<Testimonial, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Testimonial, 'id'>>
      }
    }
  }
}

// Extended types with relationships (for queries with joins)
export interface ProjectWithRelations extends Project {
  client?: Client
  notes?: Note[]
  tasks?: Task[]
  files?: File[]
}

export interface ClientWithProjects extends Client {
  projects?: Project[]
}

export interface NoteWithAuthor extends Note {
  author?: User
}

export interface TaskWithProject extends Task {
  project?: Project
}

// Utility types for common operations
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
