import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function usePredictions() {
  return useQuery({
    queryKey: ["/api/predictions"],
    queryFn: async () => {
      const res = await fetch("/api/predictions");
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });
}

export function useCalculatePredictions() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/predictions/calculate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to calculate predictions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
    },
  });
}
