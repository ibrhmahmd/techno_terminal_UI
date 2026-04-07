/**
 * Courses types barrel export
 * Re-exports all course-related types from modular files
 */

// Course models
export type {
  Course,
  CourseStats,
} from './models';

// Course input DTOs
export type {
  AddNewCourseInput,
  UpdateCourseDTO,
} from './inputs';
