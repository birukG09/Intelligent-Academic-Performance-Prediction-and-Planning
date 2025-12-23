import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCourse } from "@/hooks/use-courses";
import { GRADE_OPTIONS } from "@/lib/gpa-utils";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema } from "@shared/schema";

const formSchema = insertCourseSchema.extend({
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddCourseDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createCourse, isPending } = useCreateCourse();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      semester: "Semester 1",
      program: "Software Engineering",
      credits: 3,
    }
  });

  const onSubmit = (data: FormValues) => {
    createCourse(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-black text-white hover:bg-black/80 shadow-lg shadow-black/20 rounded-xl px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Course</DialogTitle>
          <DialogDescription>
            Enter course details to calculate your GPA impact.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Data Structures" 
                {...register("name")}
                className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select onValueChange={(val) => setValue("grade", val)}>
                  <SelectTrigger className="rounded-xl border-gray-200">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input 
                  id="credits" 
                  type="number" 
                  min="1" 
                  max="6"
                  {...register("credits")}
                  className="rounded-xl border-gray-200"
                />
                {errors.credits && <p className="text-xs text-red-500">{errors.credits.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select onValueChange={(val) => setValue("semester", val)} defaultValue="Semester 1">
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester 1">Semester 1</SelectItem>
                  <SelectItem value="Semester 2">Semester 2</SelectItem>
                  <SelectItem value="Semester 3">Semester 3</SelectItem>
                  <SelectItem value="Semester 4">Semester 4</SelectItem>
                  <SelectItem value="Semester 5">Semester 5</SelectItem>
                  <SelectItem value="Semester 6">Semester 6</SelectItem>
                  <SelectItem value="Semester 7">Semester 7</SelectItem>
                  <SelectItem value="Semester 8">Semester 8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
