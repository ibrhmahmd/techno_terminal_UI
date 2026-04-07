/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from the new modular structure:
 *   import { getGroups, createGroup, updateGroup } from './groups'
 * 
 * The API functions have been reorganized into:
 *   - groups/ - Group-related API functions
 *     - core.ts - Main router functions (CRUD, list, search)
 *     - lifecycle.ts - Lifecycle functions (levels, history)
 *     - competitions.ts - Competition functions
 *     - utils.ts - Helper functions
 */

// Re-export everything from the new modular structure
export * from './groups/index';
