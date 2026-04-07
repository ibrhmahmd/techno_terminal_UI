/**
 * @deprecated This file is maintained for backward compatibility.
 * Please import from the new modular structure:
 *   import { getCourses, createCourse, updateCourse } from './courses'
 * 
 * The API functions have been reorganized into:
 *   - courses/ - Course-related API functions
 *     - core.ts - Main router functions (CRUD, stats)
 */

// Re-export everything from the new modular structure
export * from './courses/index';
