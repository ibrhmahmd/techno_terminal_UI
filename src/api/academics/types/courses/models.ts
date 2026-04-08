/**
 * Course-related type definitions
 * Aligned with API documentation: docs/api/academics/courses.md
 */

/**
 * Course model (CoursePublic from API)
 */
export interface Course {
  id: number;
  name: string;
  category?: string;
  description?: string;
  price_per_level?: number;
  sessions_per_level?: number;
  is_active: boolean;
}

/**
 * Course statistics DTO
 * GET /academics/courses/{course_id}/stats
 */
export interface CourseStats {
  course_id: number;
  course_name: string;
  total_groups: number;
  active_groups: number;
  total_students_ever: number;
  active_students: number;
}
