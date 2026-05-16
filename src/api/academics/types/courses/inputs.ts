/**
 * Course-related input DTOs (Request types)
 * Aligned with API documentation: docs/api/academics/courses.md
 */

/**
 * Input for creating a new course
 * POST /academics/courses
 */
export interface AddNewCourseInput {
  name: string;
  category?: string;
  description?: string;
  notes?: string;
  price_per_level: number;
  sessions_per_level: number;
  max_levels: number;
}

/**
 * Input for updating a course
 * PATCH /academics/courses/{course_id}
 */
export interface UpdateCourseDTO extends Partial<AddNewCourseInput> {
  is_active?: boolean;
}
