/**
 * Groups API - Utility Functions
 * Helper functions that combine multiple API calls
 */

import { getEnrichedGroups } from './core';
import { getGroupCompetitions } from './competitions';
import type { EnrichedGroupPublicWithCompetition } from '../types/groups';

/**
 * Get groups with competition data for competition grouping
 * Fetches competition data for each group client-side
 */
export async function getGroupsWithCompetitions(): Promise<EnrichedGroupPublicWithCompetition[]> {
  const groups = await getEnrichedGroups();
  // Fetch competition data for each group
  const groupsWithCompetitions = await Promise.all(
    groups.map(async (group) => {
      try {
        const competitions = await getGroupCompetitions(group.id);
        return {
          ...group,
          competitions,
          is_in_competition: competitions.length > 0,
        };
      } catch {
        return { ...group, competitions: [], is_in_competition: false };
      }
    })
  );
  return groupsWithCompetitions;
}
