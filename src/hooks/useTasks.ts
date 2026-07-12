import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  addComment,
  deleteComment,
  addTimeLog,
} from '../api/tasks'
import type { TaskFilters, CreateTaskInput, UpdateTaskInput } from '../api/tasks'

export function useTaskList(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => getTasks(filters),
  })
}

export function useTaskDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id ?? ''),
    queryFn: () => getTask(id as string),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => updateTask(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export function useAddSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) => addSubtask(taskId, title),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}

export function useToggleSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ subtaskId, is_done }: { subtaskId: string; is_done: boolean; taskId: string }) =>
      updateSubtask(subtaskId, { is_done }),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}

export function useDeleteSubtask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { subtaskId: string; taskId: string }) =>
      deleteSubtask(vars.subtaskId),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) => addComment(taskId, content),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}

export function useDeleteComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { commentId: string; taskId: string }) =>
      deleteComment(vars.commentId),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}

export function useAddTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, hours, note }: { taskId: string; hours: number; note?: string }) =>
      addTimeLog(taskId, hours, note),
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.taskId) })
    },
  })
}
