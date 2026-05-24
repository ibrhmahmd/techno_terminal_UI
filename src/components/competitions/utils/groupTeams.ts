import type { TeamGroupByField, TeamCardData, TeamGroup } from '../../../api/teams/types'

function getGroupKey(team: TeamCardData, field: TeamGroupByField): string {
  switch (field) {
    case 'instructor':
      return team.coach_id != null ? `instructor-${team.coach_id}` : 'unassigned'
    case 'category':
      return team.category
    case 'subcategory':
      return team.subcategory ?? '_none'
    case 'payment_status': {
      if (team.memberCount === 0) return 'none'
      if (team.paidCount === team.memberCount) return 'all_paid'
      if (team.paidCount > 0) return 'partial'
      return 'none'
    }
    case 'placement':
      return team.placement_rank != null ? 'ranked' : 'unranked'
    case 'alphabetical':
      return team.team_name.charAt(0).toUpperCase() || '#'
  }
}

function getGroupLabel(field: TeamGroupByField, key: string): string {
  switch (field) {
    case 'instructor':
      return key === 'unassigned' ? 'Unassigned' : `Instructor #${key.replace('instructor-', '')}`
    case 'category':
      return key
    case 'subcategory':
      return key === '_none' ? 'No Subcategory' : key
    case 'payment_status': {
      switch (key) {
        case 'all_paid': return 'All Paid'
        case 'partial': return 'Partial Paid'
        case 'none': return 'None Paid'
        default: return key
      }
    }
    case 'placement':
      return key === 'ranked' ? 'Ranked' : 'Unranked'
    case 'alphabetical':
      return key
  }
}

function sortGroupKey(field: TeamGroupByField, key: string): number {
  if (field === 'payment_status') {
    const order = ['all_paid', 'partial', 'none']
    return order.indexOf(key)
  }
  if (field === 'placement') {
    return key === 'ranked' ? 0 : 1
  }
  return 0
}

function sortTeams(teams: TeamCardData[], field: TeamGroupByField): TeamCardData[] {
  return [...teams].sort((a, b) => {
    if (field === 'placement') {
      if (a.placement_rank != null && b.placement_rank != null) return a.placement_rank - b.placement_rank
      if (a.placement_rank != null) return -1
      if (b.placement_rank != null) return 1
    }
    return a.team_name.localeCompare(b.team_name)
  })
}

export function groupTeams(
  teams: TeamCardData[],
  groupBy: TeamGroupByField | null,
  subgroupBy?: TeamGroupByField | null,
): TeamGroup[] {
  if (!groupBy || teams.length === 0) {
    return [{
      key: '_all',
      label: 'All Teams',
      count: teams.length,
      teams: sortTeams(teams, 'alphabetical'),
    }]
  }

  const groupsMap = new Map<string, TeamCardData[]>()
  for (const team of teams) {
    const key = getGroupKey(team, groupBy)
    const group = groupsMap.get(key) || []
    group.push(team)
    groupsMap.set(key, group)
  }

  const groups: TeamGroup[] = Array.from(groupsMap.entries())
    .map(([key, groupTeams]) => ({
      key,
      label: getGroupLabel(groupBy, key),
      count: groupTeams.length,
      teams: subgroupBy ? groupTeams : sortTeams(groupTeams, groupBy),
    }))
    .sort((a, b) => sortGroupKey(groupBy, a.key) - sortGroupKey(groupBy, b.key) || a.label.localeCompare(b.label))

  if (subgroupBy) {
    for (const group of groups) {
      const subMap = new Map<string, TeamCardData[]>()
      for (const team of group.teams) {
        const subKey = getGroupKey(team, subgroupBy)
        const subGroup = subMap.get(subKey) || []
        subGroup.push(team)
        subMap.set(subKey, subGroup)
      }
      group.teams = sortTeams(group.teams, groupBy)
      group.subgroups = Array.from(subMap.entries())
        .map(([key, subTeams]) => ({
          key,
          label: getGroupLabel(subgroupBy, key),
          count: subTeams.length,
          teams: sortTeams(subTeams, subgroupBy),
        }))
        .sort((a, b) => sortGroupKey(subgroupBy, a.key) - sortGroupKey(subgroupBy, b.key) || a.label.localeCompare(b.label))
    }
  }

  return groups
}

export function getSubgroupOptions(groupBy: TeamGroupByField): TeamGroupByField[] {
  const all: TeamGroupByField[] = ['instructor', 'category', 'subcategory', 'payment_status', 'placement']
  return all.filter(f => f !== groupBy)
}
