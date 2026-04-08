/**
 * Courses API - Barrel Export
 * Main entry point for all course-related API functions
 * 
 * Usage:
 *   import { 
 *     getCourses, 
 *     createCourse, 
 *     updateCourse 
 *   } from '../api/academics/courses'
 */

export {
  getCourses,
  getCoursesPaginated,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getAllCourseStats,
  getCourseStats,
  getCourseGroups,
} from './core';
