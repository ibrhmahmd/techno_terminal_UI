import client from "../client";
import type { ApiResponse, PaginatedApiResponse } from "../../types/api";
import type {
  Course,
  AddNewCourseInput,
  UpdateCourseDTO,
  CourseStats,
  EnrichedGroupPublic,
} from "./types";

export async function getCourses(): Promise<Course[]> {
  const response = await client.get<PaginatedApiResponse<Course>>("/academics/courses");
  return response.data.data || [];
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

// the last three endpoints needs review for the written syntax and types used

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
