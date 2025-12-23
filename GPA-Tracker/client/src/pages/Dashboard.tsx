import { useCourses, useDeleteCourse } from "@/hooks/use-courses";
import { usePredictions, useCalculatePredictions } from "@/hooks/use-predictions";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { AddCourseDialog } from "@/components/AddCourseDialog";
import { calculateGPA, getProgressPercentage } from "@/lib/gpa-utils";
import { BookOpen, GraduationCap, TrendingUp, Award, Trash2, Loader2, Search, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Dashboard() {
  const { data: courses, isLoading } = useCourses();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { data: predictions, isLoading: predictionsLoading } = usePredictions();
  const { mutate: calculatePredictions, isPending: calculating } = useCalculatePredictions();
  const [searchTerm, setSearchTerm] = useState("");

  const stats = calculateGPA(courses || []);
  const progress = getProgressPercentage(stats.totalCredits);

  const filteredCourses = courses?.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.semester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-10 overflow-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold font-display text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">Welcome back, Student. Here's your academic overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">Software Engineering</p>
              <p className="text-xs text-gray-500">B.Tech - 4th Year</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold shadow-lg shadow-black/10">
              ST
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            label="Current GPA" 
            value={stats.gpa.toFixed(2)} 
            icon={GraduationCap} 
            delay={0.1}
            subtext="Cumulative Grade Point Average"
          />
          <StatCard 
            label="Credits Earned" 
            value={stats.totalCredits} 
            icon={BookOpen} 
            delay={0.2}
            subtext="/ 120 Required for Graduation"
          />
          <StatCard 
            label="Semesters" 
            value={courses ? [...new Set(courses.map(c => c.semester))].length : 0} 
            icon={TrendingUp} 
            delay={0.3}
            subtext="Active Semesters"
          />
          <StatCard 
            label="Total Points" 
            value={Math.round(stats.totalPoints)} 
            icon={Award} 
            delay={0.4}
            subtext="Quality Points Earned"
          />
        </div>

        {/* Progress Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-8 border border-border shadow-sm mb-10 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 relative z-10">
            <div>
              <h3 className="text-xl font-bold font-display text-gray-900">Graduation Progress</h3>
              <p className="text-gray-500 text-sm mt-1">You need {Math.max(0, 120 - stats.totalCredits)} more credits to graduate.</p>
            </div>
            <span className="text-4xl font-bold text-primary font-display">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-4 bg-gray-100 mb-2 relative z-10" indicatorClassName="bg-primary" />
          
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        </motion.div>

        {/* ML Predictions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 border border-border shadow-sm mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                AI-Powered GPA Analytics
              </h3>
              <p className="text-gray-500 text-sm mt-1">Advanced ML models compare Linear Regression vs Random Forest ensemble</p>
            </div>
            <Button 
              onClick={() => calculatePredictions()}
              disabled={calculating || !courses?.length}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {calculating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Recalculate
            </Button>
          </div>

          {predictionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : predictions ? (
            <div className="space-y-6">
              {/* Model Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Linear Regression</p>
                  <div className="text-3xl font-bold text-blue-900">{Number(predictions.linearRegressionGPA).toFixed(2)}</div>
                  <p className="text-xs text-blue-700 mt-3 leading-relaxed">
                    Weighted average model: Σ(grade × credits) / Σ(credits) with consistency adjustments
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Random Forest</p>
                  <div className="text-3xl font-bold text-purple-900">{Number(predictions.randomForestGPA).toFixed(2)}</div>
                  <p className="text-xs text-purple-700 mt-3 leading-relaxed">
                    Ensemble of 5 trees using grade variance, credit balance, and trend analysis
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">Best Model</p>
                  <div className="text-xl font-bold text-green-900 capitalize">{String(predictions.betterModel).replace('_', ' ')}</div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-green-700">Accuracy: <span className="font-bold">{Number(predictions.accuracy)}%</span></p>
                    <p className="text-xs text-green-600">Confidence: <span className="font-bold">{(Number(predictions.confidenceScore) * 100).toFixed(0)}%</span></p>
                  </div>
                </div>
              </div>

              {/* Academic Standing & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-3">Academic Standing</p>
                  <div className="text-lg font-bold text-yellow-900">{String(predictions.academicStanding)}</div>
                  <p className="text-xs text-yellow-700 mt-2">Current performance category based on GPA</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-900 mb-3">Performance Trend</p>
                  <div className="text-sm font-bold text-indigo-900">{String(predictions.trendAnalysis)}</div>
                  <p className="text-xs text-indigo-700 mt-2">Course performance pattern analysis</p>
                </div>
              </div>

              {/* Next Semester Prediction */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-300">
                <p className="text-sm font-semibold text-green-900 mb-2">Next Semester GPA Projection</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-green-900">{Number(predictions.nextSemesterPrediction).toFixed(2)}</div>
                  <p className="text-xs text-green-700">Predicted based on current performance trend and consistency</p>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Course Management */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold font-display text-gray-900">Course List</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search courses..." 
                  className="pl-9 w-full sm:w-64 rounded-xl bg-white border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <AddCourseDialog />
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center items-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredCourses?.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No courses found. Add one to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-medium text-xs">
                    <tr>
                      <th className="px-6 py-4">Course Name</th>
                      <th className="px-6 py-4">Semester</th>
                      <th className="px-6 py-4">Credits</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCourses?.map((course) => (
                      <motion.tr 
                        key={course.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                        <td className="px-6 py-4 text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {course.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{course.credits}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                            ['A+', 'A', 'A-'].includes(course.grade) ? 'bg-green-100 text-green-700' :
                            ['B+', 'B', 'B-'].includes(course.grade) ? 'bg-blue-100 text-blue-700' :
                            ['C+', 'C', 'C-'].includes(course.grade) ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteCourse(course.id)}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
