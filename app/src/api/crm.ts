import client from './client'

export interface Student {
  id: string
  full_name: string
  birth_date?: string | null
  gender?: string | null
  phone?: string | null
  is_active: boolean
  notes?: string | null
}

export interface Parent {
  id: string
  full_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  is_active: boolean
}

export interface StudentWithDetails extends Student {
  parents: Parent[]
  enrollments: Enrollment[]
  balance: number
}

export interface Enrollment {
  id: string
  student_id: string
  group_id: string
  student_name?: string
  group_name?: string
  course_name?: string
  level: number
  status: 'active' | 'completed' | 'dropped'
  amount_due: number
  discount: number
  enrolled_on: string
  notes?: string | null
}

// Students API
export async function getStudents(skip = 0, limit = 15): Promise<Student[]> {
  const response = await client.get<{ data: Student[] }>('/crm/students', {
    params: { skip, limit }
  })
  return response.data.data || []
}

export async function searchStudents(name: string): Promise<Student[]> {
  const response = await client.get<{ data: Student[] }>('/crm/students', {
    params: { name }
  })
  return response.data.data || []
}

export async function getStudent(id: string): Promise<StudentWithDetails> {
  const response = await client.get<{ data: StudentWithDetails }>(`/crm/students/${id}`)
  return response.data.data
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  const response = await client.post<{ data: Student }>('/crm/students', student)
  return response.data.data
}

// Parents API
export async function getParents(skip = 0, limit = 15): Promise<Parent[]> {
  const response = await client.get<{ data: Parent[] }>('/crm/parents', {
    params: { skip, limit }
  })
  return response.data.data || []
}

export async function searchParents(name: string): Promise<Parent[]> {
  const response = await client.get<{ data: Parent[] }>('/crm/parents', {
    params: { name }
  })
  return response.data.data || []
}

export async function getParent(id: string): Promise<Parent> {
  const response = await client.get<{ data: Parent }>(`/crm/parents/${id}`)
  return response.data.data
}

export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
  const response = await client.post<{ data: Parent }>('/crm/parents', parent)
  return response.data.data
}
