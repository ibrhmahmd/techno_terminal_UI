import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateGroup,
  deleteGroup,
  archiveGroup,
  progressGroupLevel,
  deleteGroupLevel,
  updateGroupLevel,
  cancelGroupLevel,
  type Group,
  type UpdateGroupDTO,
  type ProgressGroupLevelRequest,
  type ProgressGroupLevelResult,
  type UpdateLevelInput,
  type DeleteLevelResponse,
  type CancelLevelResult,
  type GroupLevelPublic,
} from "../api/academics";
import { queryKeys } from "./queryKeys";

type MutationStatus = "idle" | "loading" | "success" | "error";

interface UseGroupMutationsReturn {
  updateGroup: (data: UpdateGroupDTO) => Promise<Group>;
  deleteGroup: () => Promise<void>;
  archiveGroup: () => Promise<Group>;
  levelUp: () => Promise<ProgressGroupLevelResult>;
  createNewLevel: (
    data: ProgressGroupLevelRequest,
  ) => Promise<ProgressGroupLevelResult>;
  deleteLevel: (levelNumber: number) => Promise<DeleteLevelResponse>;
  updateLevel: (
    levelNumber: number,
    data: UpdateLevelInput,
  ) => Promise<GroupLevelPublic>;
  cancelLevel: (
    levelNumber: number,
    reason: string,
  ) => Promise<CancelLevelResult>;
  status: MutationStatus;
  error: string | null;
  clearError: () => void;
}

export function useGroupMutations(groupId: number): UseGroupMutationsReturn {
  const queryClient = useQueryClient();

  // Invalidate groups cache helper
  const invalidateGroups = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    await queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.groupLevels(groupId),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.groupSessions(groupId),
    });
  }, [queryClient, groupId]);

  // Update group mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateGroupDTO): Promise<Group> => {
      return updateGroup(groupId, data);
    },
    onSuccess: invalidateGroups,
  });

  // Delete group mutation
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      return deleteGroup(groupId);
    },
    onSuccess: invalidateGroups,
  });

  // Archive group mutation
  const archiveMutation = useMutation({
    mutationFn: async (): Promise<Group> => {
      return archiveGroup(groupId);
    },
    onSuccess: invalidateGroups,
  });

  // Level up mutation (simple - no overrides)
  const levelUpMutation = useMutation({
    mutationFn: async (): Promise<ProgressGroupLevelResult> => {
      return progressGroupLevel(groupId);
    },
    onSuccess: invalidateGroups,
  });

  // Create new level mutation (full overrides)
  const createLevelMutation = useMutation({
    mutationFn: async (
      data: ProgressGroupLevelRequest,
    ): Promise<ProgressGroupLevelResult> => {
      return progressGroupLevel(groupId, data);
    },
    onSuccess: invalidateGroups,
  });

  // Delete group level mutation (undo progression)
  const deleteLevelMutation = useMutation({
    mutationFn: async (levelNumber: number): Promise<DeleteLevelResponse> => {
      return deleteGroupLevel(groupId, levelNumber);
    },
    onSuccess: invalidateGroups,
  });

  // Update group level details mutation
  const updateLevelMutation = useMutation({
    mutationFn: async ({
      levelNumber,
      data,
    }: {
      levelNumber: number;
      data: UpdateLevelInput;
    }): Promise<GroupLevelPublic> => {
      return updateGroupLevel(groupId, levelNumber, data);
    },
    onSuccess: invalidateGroups,
  });

  // Cancel group level mutation
  const cancelLevelMutation = useMutation({
    mutationFn: async ({
      levelNumber,
      reason,
    }: {
      levelNumber: number;
      reason: string;
    }): Promise<CancelLevelResult> => {
      return cancelGroupLevel(groupId, levelNumber, reason);
    },
    onSuccess: invalidateGroups,
  });

  // Delete group level mutation (undo progression)
  const deleteLevelMutation = useMutation({
    mutationFn: async (levelNumber: number): Promise<DeleteLevelResponse> => {
      return deleteGroupLevel(groupId, levelNumber);
    },
    onSuccess: invalidateGroups,
  });

  // Update group level details mutation
  const updateLevelMutation = useMutation({
    mutationFn: async ({
      levelNumber,
      data,
    }: {
      levelNumber: number;
      data: UpdateLevelInput;
    }): Promise<GroupLevelPublic> => {
      return updateGroupLevel(groupId, levelNumber, data);
    },
    onSuccess: invalidateGroups,
  });

  // Cancel group level mutation
  const cancelLevelMutation = useMutation({
    mutationFn: async ({
      levelNumber,
      reason,
    }: {
      levelNumber: number;
      reason: string;
    }): Promise<CancelLevelResult> => {
      return cancelGroupLevel(groupId, levelNumber, reason);
    },
    onSuccess: invalidateGroups,
  });

  // Combine all pending states
  const isPending =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    archiveMutation.isPending ||
    levelUpMutation.isPending ||
    createLevelMutation.isPending ||
    deleteLevelMutation.isPending ||
    updateLevelMutation.isPending ||
    cancelLevelMutation.isPending;

  // Determine overall status
  let status: MutationStatus = "idle";
  if (isPending) status = "loading";
  else if (
    updateMutation.isSuccess ||
    deleteMutation.isSuccess ||
    archiveMutation.isSuccess ||
    levelUpMutation.isSuccess ||
    createLevelMutation.isSuccess ||
    deleteLevelMutation.isSuccess ||
    updateLevelMutation.isSuccess ||
    cancelLevelMutation.isSuccess
  )
    status = "success";
  else if (
    updateMutation.isError ||
    deleteMutation.isError ||
    archiveMutation.isError ||
    levelUpMutation.isError ||
    createLevelMutation.isError ||
    deleteLevelMutation.isError ||
    updateLevelMutation.isError ||
    cancelLevelMutation.isError
  )
    status = "error";

  // Combine all errors
  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return null;
  };
  const error = updateMutation.isError
    ? getErrorMessage(updateMutation.error)
    : deleteMutation.isError
      ? getErrorMessage(deleteMutation.error)
      : archiveMutation.isError
        ? getErrorMessage(archiveMutation.error)
        : levelUpMutation.isError
          ? getErrorMessage(levelUpMutation.error)
          : createLevelMutation.isError
            ? getErrorMessage(createLevelMutation.error)
            : deleteLevelMutation.isError
              ? getErrorMessage(deleteLevelMutation.error)
              : updateLevelMutation.isError
                ? getErrorMessage(updateLevelMutation.error)
                : cancelLevelMutation.isError
                  ? getErrorMessage(cancelLevelMutation.error)
                  : null;

  // Clear all mutations
  const clearError = useCallback(() => {
    updateMutation.reset();
    deleteMutation.reset();
    archiveMutation.reset();
    levelUpMutation.reset();
    createLevelMutation.reset();
    deleteLevelMutation.reset();
    updateLevelMutation.reset();
    cancelLevelMutation.reset();
  }, [
    updateMutation,
    deleteMutation,
    archiveMutation,
    levelUpMutation,
    createLevelMutation,
    deleteLevelMutation,
    updateLevelMutation,
    cancelLevelMutation,
  ]);

  // Wrapper functions that maintain the same interface — wrapped in useCallback for stable references
  const handleUpdateGroup = useCallback(
    async (data: UpdateGroupDTO): Promise<Group> => {
      return updateMutation.mutateAsync(data);
    },
    [updateMutation],
  );

  const handleDeleteGroup = useCallback(async (): Promise<void> => {
    return deleteMutation.mutateAsync();
  }, [deleteMutation]);

  const handleArchiveGroup = useCallback(async (): Promise<Group> => {
    return archiveMutation.mutateAsync();
  }, [archiveMutation]);

  const handleLevelUp =
    useCallback(async (): Promise<ProgressGroupLevelResult> => {
      return levelUpMutation.mutateAsync();
    }, [levelUpMutation]);

  const handleCreateNewLevel = useCallback(
    async (
      data: ProgressGroupLevelRequest,
    ): Promise<ProgressGroupLevelResult> => {
      return createLevelMutation.mutateAsync(data);
    },
    [createLevelMutation],
  );

  const handleDeleteLevel = useCallback(
    async (levelNumber: number): Promise<DeleteLevelResponse> => {
      return deleteLevelMutation.mutateAsync(levelNumber);
    },
    [deleteLevelMutation],
  );

  const handleUpdateLevel = useCallback(
    async (
      levelNumber: number,
      data: UpdateLevelInput,
    ): Promise<GroupLevelPublic> => {
      return updateLevelMutation.mutateAsync({ levelNumber, data });
    },
    [updateLevelMutation],
  );

  const handleCancelLevel = useCallback(
    async (levelNumber: number, reason: string): Promise<CancelLevelResult> => {
      return cancelLevelMutation.mutateAsync({ levelNumber, reason });
    },
    [cancelLevelMutation],
  );

  return {
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    archiveGroup: handleArchiveGroup,
    levelUp: handleLevelUp,
    createNewLevel: handleCreateNewLevel,
    deleteLevel: handleDeleteLevel,
    updateLevel: handleUpdateLevel,
    cancelLevel: handleCancelLevel,
    status,
    error,
    clearError,
  };
}
