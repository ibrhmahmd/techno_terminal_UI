/**
 * Courses API - Core Router Functions
 * Courses Router: docs/api/academics/courses.md
 * 
 * Endpoints:
 * - GET /academics/courses - List all courses
 * - GET /academics/courses/{course_id} - Get course by ID
 * - POST /academics/courses - Create new course
 * - PATCH /academics/courses/{course_id} - Update course
 * - DELETE /academics/courses/{course_id} - Delete course
 * - GET /academics/courses/stats - Get all course stats
 * - GET /academics/courses/{course_id}/stats - Get course stats
 * - GET /academics/courses/{course_id}/groups - Get course groups
 */

import client from "../../client";
import type { ApiResponse, PaginatedApiResponse } from "../../../types/api";
import type { PaginationParams, PaginationResult } from "../../../types/pagination";
import type {
  Course,
  AddNewCourseInput,
  UpdateCourseDTO,
  CourseStats,
} from "../types/courses";
import type { EnrichedGroupPublic } from "../types/groups";

export async function getCourses(): Promise<Course[]> {
  const response = await client.get<PaginatedApiResponse<Course>>("/academics/courses");
  return response.data.data || [];
}

export async function getCoursesPaginated(
  params: PaginationParams = {},
): Promise<PaginationResult<Course>> {
  const { skip = 0, limit = 100 } = params;
  // Backend likely limits to 100-200, use conservative default
  const cappedLimit = Math.min(limit, 100);
  const response = await client.get<PaginatedApiResponse<Course>>(
    "/academics/courses",
    { params: { skip, limit: cappedLimit } },
  );
  const paginatedData = response.data;
  const items = paginatedData.data || [];
  const total = paginatedData.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

export async function searchCourses(
  query: string,
  params: PaginationParams = {},
): Promise<PaginationResult<Course>> {
  const { skip = 0, limit = 100 } = params;
  // Backend likely limits to 100-200, use conservative default
  const cappedLimit = Math.min(limit, 100);
  const response = await client.get<PaginatedApiResponse<Course>>(
    "/academics/courses/search",
    { params: { query, skip, limit: cappedLimit } },
  );
  const paginatedData = response.data;
  const items = paginatedData.data || [];
  const total = paginatedData.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

export async function createCourse(data: AddNewCourseInput): Promise<Course> {
  const response = await client.post<ApiResponse<Course>>(
    "/academics/courses",
    data,
  );
  return response.data.data;
}

export async function updateCourse(
  courseId: number,
  data: UpdateCourseDTO,
): Promise<Course> {
  const response = await client.patch<ApiResponse<Course>>(
    `/academics/courses/${courseId}`,
    data,
  );
  return response.data.data;
}

export async function deleteCourse(courseId: number): Promise<void> {
  await client.delete(`/academics/courses/${courseId}`);
}

export async function getCourseById(courseId: number): Promise<Course> {
  const response = await client.get<ApiResponse<Course>>(
    `/academics/courses/${courseId}`,
  );
  return response.data.data;
}

export async function getAllCourseStats(): Promise<CourseStats[]> {
  const response = await client.get<ApiResponse<CourseStats[]>>(
    "/academics/courses/stats",
  );
  return response.data.data;
}

export async function getCourseStats(courseId: number): Promise<CourseStats> {
  const response = await client.get<ApiResponse<CourseStats>>(
    `/academics/courses/${courseId}/stats`,
  );
  return response.data.data;
}

export async function getCourseGroups(
  courseId: number,
): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic[]>>(
    `/academics/courses/${courseId}/groups`,
  );
  return response.data.data;
}
