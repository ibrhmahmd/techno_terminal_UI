import { useMemo } from 'react'
import {
  useStudentsList,
  useStudentsSearch,
  useParentsList,
  useParentsSearch,
  useDeletedStudents,
  useStudentsFilter,
} from '../useDirectory'
import { useStudentsGrouped } from '../useStudentsGrouped'
import { formatAgeGroupLabel } from '../../config/studentGrouping'
import type { StudentListItem, ParentListItem, StudentFilterParams, StudentFilterItem } from '../../api/crm'
import type { StudentGroupBy, WaitingGroupBy } from '../../config/studentGrouping'

export interface GroupItem<T> {
  key: string
  label: string
  count: number
  items: T[]
  sortKey: number
}

interface UseDirectoryDataProps {
  activeTab: 'students' | 'parents' | 'waiting' | 'advanced'
  isSearching: boolean
  debouncedSearch: string
  studentGroupBy: StudentGroupBy
  waitingGroupBy: WaitingGroupBy
  currentPage: number
  pageSize: number
  groupedPageSize: number
  studentGroupedPage: number
  waitingGroupedPage: number
  filterParams?: StudentFilterParams
  filterPage?: number
  filterPageSize?: number
  filterGroupBy?: 'none' | 'status' | 'age'
}

interface UseDirectoryDataReturn {
  // Data
  students: StudentListItem[]
  parents: ParentListItem[]
  waitingStudents: StudentListItem[]
  deletedStudents: StudentListItem[]

  // Grouped data
  studentsGroupedData?: GroupItem<StudentListItem>[]
  waitingGroupedData?: GroupItem<StudentListItem>[]

  // Filter data
  filteredStudents?: StudentFilterItem[]
  filteredTotal?: number

  // Grouped filter data
  filteredGroupedData?: GroupItem<StudentFilterItem>[]

  // Loading states
  isLoading: boolean
  isLoadingStudentsGrouped: boolean
  isLoadingWaitingGrouped: boolean
  isLoadingFiltered: boolean
  isLoadingFilteredGrouped: boolean

  // Counts
  totalStudents: number
  totalParents: number
}

export function useDirectoryData({
  activeTab,
  isSearching,
  debouncedSearch,
  studentGroupBy,
  waitingGroupBy,
  currentPage,
  pageSize,
  groupedPageSize,
  studentGroupedPage,
  waitingGroupedPage,
  filterParams,
  filterPage = 1,
  filterPageSize = 25,
  filterGroupBy = 'none',
}: UseDirectoryDataProps): UseDirectoryDataReturn {
  // Grouped data fetching (lazy - only when grouping is active)
  const { data: studentsGroupedResult, isLoading: isLoadingStudentsGrouped } =
    useStudentsGrouped({
      groupBy: (studentGroupBy === 'status' || studentGroupBy === 'age' ? studentGroupBy : 'status') as 'status' | 'age',
      pagination: { page: studentGroupedPage, pageSize: groupedPageSize },
      tab: 'students',
      enabled: activeTab === 'students' && (studentGroupBy === 'status' || studentGroupBy === 'age') && !isSearching,
    })

  const { data: waitingGroupedResult, isLoading: isLoadingWaitingGrouped } =
    useStudentsGrouped({
      groupBy: (waitingGroupBy === 'age' ? waitingGroupBy : 'status') as 'status' | 'age',
      pagination: { page: waitingGroupedPage, pageSize: groupedPageSize },
      tab: 'waiting',
      enabled: activeTab === 'waiting' && waitingGroupBy === 'age' && !isSearching,
    })

  // List queries
  const studentsListQuery = useStudentsList(
    currentPage,
    pageSize,
    (activeTab === 'students' || activeTab === 'waiting') &&
      !isSearching &&
      studentGroupBy !== 'deleted'
  )
  const studentsSearchQuery = useStudentsSearch(debouncedSearch)
  const deletedStudentsQuery = useDeletedStudents(
    currentPage,
    pageSize,
    activeTab === 'students' && studentGroupBy === 'deleted'
  )

  const parentsListQuery = useParentsList(currentPage, pageSize, activeTab === 'parents' && !isSearching)
  const parentsSearchQuery = useParentsSearch(debouncedSearch)

  // Filter query (advanced search tab)
  const filterQuery = useStudentsFilter(
    {
      ...filterParams,
      skip: (filterPage - 1) * filterPageSize,
      limit: filterPageSize,
    },
    activeTab === 'advanced' && !!filterParams && Object.keys(filterParams).length > 0
  )

  // Grouped filter data (when group by is active in advanced search)
  const { data: filteredGroupedResult, isLoading: isLoadingFilteredGrouped } =
    useStudentsGrouped({
      groupBy: filterGroupBy === 'none' ? 'status' : filterGroupBy,
      pagination: { page: filterPage, pageSize: filterPageSize },
      tab: 'students',
      enabled: activeTab === 'advanced' && filterGroupBy !== 'none' && !!filterParams && Object.keys(filterParams).length > 0,
    })

  // Derived data
  const activeStudents = isSearching
    ? (studentsSearchQuery.data ?? [])
    : (studentsListQuery.data?.items ?? [])
  const deletedStudents = deletedStudentsQuery.data?.items ?? []
  const students = studentGroupBy === 'deleted' ? deletedStudents : activeStudents
  const totalStudents = studentGroupBy === 'deleted'
    ? (deletedStudentsQuery.data?.total ?? 0)
    : isSearching
      ? students.length
      : (studentsListQuery.data?.total ?? 0)

  const parents = isSearching ? (parentsSearchQuery.data ?? []) : (parentsListQuery.data?.items ?? [])
  const totalParents = isSearching ? parents.length : (parentsListQuery.data?.total ?? 0)

  // BUG-23: Use API results directly - no double filtering
  const displayStudents = students.filter((s) => s.status !== 'waiting')
  const waitingStudents = useMemo(
    () => students.filter((s) => s.status === 'waiting'),
    [students]
  )

  // Transform grouped API response → GroupItem<StudentListItem>[] for DataTable
  const studentsGroupedData = useMemo(() => {
    if (!studentsGroupedResult || studentGroupBy === 'none') return undefined

    const groups = studentsGroupedResult.groups.map((group) => ({
      key: group.key,
      label: studentGroupBy === 'age' ? formatAgeGroupLabel(group.label) : group.label,
      count: group.count,
      items: group.students,
      sortKey: studentGroupBy === 'age' ? parseInt(group.key.split('-')[0] || '0', 10) : 0,
    }))

    if (studentGroupBy === 'age') {
      groups.sort((a, b) => a.sortKey - b.sortKey)
    }

    return groups
  }, [studentsGroupedResult, studentGroupBy])

  const waitingGroupedData = useMemo(() => {
    if (!waitingGroupedResult || waitingGroupBy === 'none') return undefined

    const groups = waitingGroupedResult.groups.map((group) => ({
      key: group.key,
      label: waitingGroupBy === 'age' ? formatAgeGroupLabel(group.label) : group.label,
      count: group.count,
      items: group.students,
      sortKey: waitingGroupBy === 'age' ? parseInt(group.key.split('-')[0] || '0', 10) : 0,
    }))

    if (waitingGroupBy === 'age') {
      groups.sort((a, b) => a.sortKey - b.sortKey)
    }

    return groups
  }, [waitingGroupedResult, waitingGroupBy])

  const isLoading =
    studentsListQuery.isLoading ||
    studentsSearchQuery.isLoading ||
    parentsListQuery.isLoading ||
    parentsSearchQuery.isLoading ||
    deletedStudentsQuery.isLoading

  const isLoadingFiltered = filterQuery.isLoading

  // Transform filtered grouped API response
  const filteredGroupedData = useMemo(() => {
    if (!filteredGroupedResult || filterGroupBy === 'none') return undefined

    const groups = filteredGroupedResult.groups.map((group) => ({
      key: group.key,
      label: filterGroupBy === 'age' ? formatAgeGroupLabel(group.label) : group.label,
      count: group.count,
      items: group.students as StudentFilterItem[],
      sortKey: filterGroupBy === 'age' ? parseInt(group.key.split('-')[0] || '0', 10) : 0,
    }))

    if (filterGroupBy === 'age') {
      groups.sort((a, b) => a.sortKey - b.sortKey)
    }

    return groups
  }, [filteredGroupedResult, filterGroupBy])

  return {
    students: displayStudents,
    parents,
    waitingStudents,
    deletedStudents,
    studentsGroupedData,
    waitingGroupedData,
    filteredStudents: filterQuery.data?.students,
    filteredTotal: filterQuery.data?.total,
    filteredGroupedData,
    isLoading,
    isLoadingStudentsGrouped,
    isLoadingWaitingGrouped,
    isLoadingFiltered,
    isLoadingFilteredGrouped,
    totalStudents,
    totalParents,
  }
}
