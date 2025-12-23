import { Course } from "@shared/schema";

// Grade scale as per requirements
// A+=4.0, A=4.0, A-=3.7, B+=3.5, B=3.0, B-=2.7, C+=2.5, C=2.0
export const GRADE_SCALE: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.5,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.5,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
};

export const GRADE_OPTIONS = Object.keys(GRADE_SCALE);

export function calculateGPA(courses: Course[]) {
  if (!courses.length) return { gpa: 0, totalCredits: 0, totalPoints: 0 };

  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    const points = GRADE_SCALE[course.grade] ?? 0;
    const credits = course.credits;

    totalPoints += points * credits;
    totalCredits += credits;
  }

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  return {
    gpa: parseFloat(gpa.toFixed(2)),
    totalCredits,
    totalPoints: parseFloat(totalPoints.toFixed(2)),
  };
}

export function getProgressPercentage(totalCredits: number, requiredCredits: number = 120) {
  return Math.min(100, Math.max(0, (totalCredits / requiredCredits) * 100));
}
