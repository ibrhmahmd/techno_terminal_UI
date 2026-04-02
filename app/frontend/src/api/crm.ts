import client from './client'

export interface Student {
  id: number
  full_name: string
  birth_date?: string
  gender?: string
  phone?: string
  is_active: boolean
  notes?: string
}

export interface Parent {
  id: number
  full_name: string
  phone?: string
  email?: string
  address?: string
  is_active: boolean
}

export interface StudentWithDetails extends Student {
  parents: Parent[]
  enrollments: Enrollment[]
  balance: number
}

export interface Enrollment {
  id: number
  group_id: number
  group_name: string
  course_name: string
  level: number
  status: 'active' | 'completed' | 'dropped'
  amount_due: number
  discount: number
  enrolled_on: string
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

export async function getStudent(id: number): Promise<StudentWithDetails> {
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

export async function getParent(id: number): Promise<Parent> {
  const response = await client.get<{ data: Parent }>(`/crm/parents/${id}`)
  return response.data.data
}

export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
  const response = await client.post<{ data: Parent }>('/crm/parents', parent)
  return response.data.data
}
