/**
 * Sessions API - Barrel Export
 * Main entry point for all session-related API functions
 * 
 * Usage:
 *   import { 
 *     getGroupSessions, 
 *     cancelSession, 
 *     reactivateSession 
 *   } from '../api/academics/sessions'
 */

export {
  getGroupSessions,
  getSessionDetails,
  updateSession,
  deleteSession,
  cancelSession,
  reactivateSession,
  markSubstituteInstructor,
  addExtraSession,
} from './core';
