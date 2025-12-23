import { pgTable, text, serial, integer, boolean, real, sql } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  grade: text("grade").notNull(),
  semester: text("semester").notNull(),
  program: text("program").default("software_engineering"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  linearRegressionGPA: real("linear_regression_gpa").notNull(),
  randomForestGPA: real("random_forest_gpa").notNull(),
  betterModel: text("better_model").notNull().default("linear"),
  accuracy: real("accuracy").notNull().default(85),
  academicStanding: text("academic_standing").notNull().default("Good"),
  confidenceScore: real("confidence_score").notNull().default(0.8),
  trendAnalysis: text("trend_analysis").notNull().default("→ Stable"),
  nextSemesterPrediction: real("next_semester_prediction").notNull().default(3.0),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertPredictionSchema = createInsertSchema(predictions).omit({ id: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
