import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  TaskReadDTO,
  TaskDetailDTO,
  TaskSubtaskReadDTO,
  TaskCommentReadDTO,
  TaskTimeLogReadDTO,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from './types'

export async function getTasks(filters: TaskFilters = {}): Promise<TaskReadDTO[]> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.status) params.status = filters.status
  if (filters.priority) params.priority = filters.priority
  if (filters.assigned_to) params.assigned_to = filters.assigned_to
  if (filters.is_recurring !== undefined && filters.is_recurring !== null) params.is_recurring = filters.is_recurring

  const response = await client.get<ApiResponse<TaskReadDTO[]>>('/tasks', { params })
  return response.data.data
}

export async function getTask(id: string): Promise<TaskDetailDTO> {
  const response = await client.get<ApiResponse<TaskDetailDTO>>(`/tasks/${id}`)
  return response.data.data
}

export async function createTask(data: CreateTaskInput): Promise<TaskDetailDTO> {
  const response = await client.post<ApiResponse<TaskDetailDTO>>('/tasks', data)
  return response.data.data
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<TaskDetailDTO> {
  const response = await client.patch<ApiResponse<TaskDetailDTO>>(`/tasks/${id}`, data)
  return response.data.data
}

export async function deleteTask(id: string): Promise<void> {
  await client.delete(`/tasks/${id}`)
}

// Subtasks
export async function addSubtask(taskId: string, title: string): Promise<TaskSubtaskReadDTO> {
  const response = await client.post<ApiResponse<TaskSubtaskReadDTO>>(`/tasks/${taskId}/subtasks`, { title })
  return response.data.data
}

export async function updateSubtask(subtaskId: string, data: { title?: string; is_done?: boolean }): Promise<TaskSubtaskReadDTO> {
  const response = await client.patch<ApiResponse<TaskSubtaskReadDTO>>(`/tasks/subtasks/${subtaskId}`, data)
  return response.data.data
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  await client.delete(`/tasks/subtasks/${subtaskId}`)
}

// Comments
export async function addComment(taskId: string, content: string): Promise<TaskCommentReadDTO> {
  const response = await client.post<ApiResponse<TaskCommentReadDTO>>(`/tasks/${taskId}/comments`, { content })
  return response.data.data
}

export async function deleteComment(commentId: string): Promise<void> {
  await client.delete(`/tasks/comments/${commentId}`)
}

// Time logs
export async function addTimeLog(taskId: string, hours: number, note?: string): Promise<TaskTimeLogReadDTO> {
  const response = await client.post<ApiResponse<TaskTimeLogReadDTO>>(`/tasks/${taskId}/time-logs`, { hours, note })
  return response.data.data
}
