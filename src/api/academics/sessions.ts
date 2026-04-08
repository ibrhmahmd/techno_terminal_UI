/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from the new modular structure:
 *   import { getGroupSessions, cancelSession, reactivateSession } from './sessions'
 * 
 * The API functions have been reorganized into:
 *   - sessions/ - Session-related API functions
 *     - core.ts - Main router functions (CRUD, cancel, reactivate)
 */

// Re-export everything from the new modular structure
export * from './sessions/index';
