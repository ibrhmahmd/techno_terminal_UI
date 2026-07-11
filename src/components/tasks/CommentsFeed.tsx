import { useState } from 'react'
import type { TaskCommentReadDTO } from '../../api/tasks'
import { useAddComment, useDeleteComment } from '../../hooks/useTasks'
import { formatDate } from '../../utils/formatting'

interface CommentsFeedProps {
  comments: TaskCommentReadDTO[]
  taskId: string
  currentUserId: number
  isAdmin: boolean
}

export function CommentsFeed({ comments, taskId, currentUserId, isAdmin }: CommentsFeedProps) {
  const [newComment, setNewComment] = useState('')
  const addMutation = useAddComment()
  const deleteMutation = useDeleteComment()

  const handleSubmit = () => {
    if (!newComment.trim()) return
    addMutation.mutate({ taskId, content: newComment.trim() }, {
      onSuccess: () => setNewComment(''),
    })
  }

  const handleDelete = (commentId: string) => {
    deleteMutation.mutate({ commentId, taskId })
  }

  const canDelete = (comment: TaskCommentReadDTO) => {
    return isAdmin || comment.author_id === currentUserId
  }

  return (
    <div className="space-y-4">
      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="group">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-slate-600">
                  {comment.author_name?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{comment.author_name ?? 'Unknown'}</span>
                  <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
              </div>
              {canDelete(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add comment form */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder="Write a comment..."
          className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || addMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
