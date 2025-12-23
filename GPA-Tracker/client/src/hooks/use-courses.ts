import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertCourse } from "@shared/schema";

export function useCourses() {
  return useQuery({
    queryKey: [api.courses.list.path],
    queryFn: async () => {
      const res = await fetch(api.courses.list.path);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return api.courses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCourse) => {
      const res = await fetch(api.courses.create.path, {
        method: api.courses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create course");
      }
      
      return api.courses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.courses.list.path] });
      toast({
        title: "Course Added",
        description: "Your GPA has been updated.",
        variant: "default",
        className: "border-green-500 border-l-4",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.courses.delete.path, { id });
      const res = await fetch(url, { method: api.courses.delete.method });
      
      if (!res.ok) {
        throw new Error("Failed to delete course");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.courses.list.path] });
      toast({
        title: "Course Removed",
        description: "The course has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
