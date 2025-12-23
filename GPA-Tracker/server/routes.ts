import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { calculatePredictions, gradeToPoint } from "./ml";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.post(api.courses.create.path, async (req, res) => {
    try {
      const input = api.courses.create.input.parse(req.body);
      const course = await storage.createCourse(input);
      res.status(201).json(course);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.courses.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteCourse(id);
    res.status(204).send();
  });

  app.get(api.predictions.get.path, async (req, res) => {
    const prediction = await storage.getPrediction();
    if (!prediction) {
      return res.status(404).json({ message: "No predictions yet" });
    }
    res.json(prediction);
  });

  app.post(api.predictions.calculate.path, async (req, res) => {
    try {
      const coursesList = await storage.getCourses();

      if (coursesList.length === 0) {
        return res.status(400).json({ message: "Add courses first" });
      }

      const courseData = coursesList.map((course) => ({
        credits: course.credits,
        gradePoint: gradeToPoint(course.grade),
        semester: course.semester,
      }));

      const predictions = calculatePredictions(courseData);

      const storedPrediction = await storage.setPrediction({
        linearRegressionGPA: predictions.linearRegressionGPA,
        randomForestGPA: predictions.randomForestGPA,
        betterModel: predictions.betterModel,
        accuracy: predictions.accuracy,
        academicStanding: predictions.academicStanding,
        confidenceScore: predictions.confidenceScore,
        trendAnalysis: predictions.trendAnalysis,
        nextSemesterPrediction: predictions.nextSemesterPrediction,
      });

      res.json(storedPrediction);
    } catch (err) {
      console.error("Prediction error:", err);
      res.status(500).json({ message: "Failed to calculate predictions" });
    }
  });

  const existing = await storage.getCourses();
  if (existing.length === 0) {
    await storage.createCourse({
      name: "Introduction to AI",
      credits: 3,
      grade: "A",
      semester: "Semester 1",
      program: "software_engineering",
    });
    await storage.createCourse({
      name: "Data Structures",
      credits: 4,
      grade: "B+",
      semester: "Semester 1",
      program: "software_engineering",
    });
    await storage.createCourse({
      name: "Web Development",
      credits: 3,
      grade: "A-",
      semester: "Semester 2",
      program: "software_engineering",
    });
    await storage.createCourse({
      name: "Database Design",
      credits: 4,
      grade: "A",
      semester: "Semester 2",
      program: "software_engineering",
    });
    await storage.createCourse({
      name: "Software Engineering",
      credits: 3,
      grade: "B+",
      semester: "Semester 3",
      program: "software_engineering",
    });

    const courseData = [
      { credits: 3, gradePoint: 4.0, semester: "Semester 1" },
      { credits: 4, gradePoint: 3.5, semester: "Semester 1" },
      { credits: 3, gradePoint: 3.7, semester: "Semester 2" },
      { credits: 4, gradePoint: 4.0, semester: "Semester 2" },
      { credits: 3, gradePoint: 3.5, semester: "Semester 3" },
    ];

    const predictions = calculatePredictions(courseData);
    await storage.setPrediction({
      linearRegressionGPA: predictions.linearRegressionGPA,
      randomForestGPA: predictions.randomForestGPA,
      betterModel: predictions.betterModel,
      accuracy: predictions.accuracy,
      academicStanding: predictions.academicStanding,
      confidenceScore: predictions.confidenceScore,
      trendAnalysis: predictions.trendAnalysis,
      nextSemesterPrediction: predictions.nextSemesterPrediction,
    });
  }

  return httpServer;
}
