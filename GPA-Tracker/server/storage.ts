import { db } from "./db";
import { courses, predictions, type InsertCourse, type Course, type Prediction, type InsertPrediction } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  getPrediction(): Promise<Prediction | undefined>;
  setPrediction(prediction: InsertPrediction): Promise<Prediction>;
}

export class DatabaseStorage implements IStorage {
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getPrediction(): Promise<Prediction | undefined> {
    const result = await db.select().from(predictions).limit(1);
    return result[0];
  }

  async setPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    // Delete old prediction and insert new one
    await db.delete(predictions);
    const [prediction] = await db.insert(predictions).values(insertPrediction).returning();
    return prediction;
  }
}

export const storage = new DatabaseStorage();
