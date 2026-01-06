"use client";

import { useActionState, useEffect, useState } from "react";
import { createShow } from "./actions";
import { toast } from "sonner";
import { formatDuration, validateShowForm } from "@/utils/scheduling";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Film,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface MovieData {
  id: string;
  title: string;
  durationMin: number;
}

interface HallData {
  id: string;
  name: string;
  type: string;
}

interface FormState {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export default function CreateShowForm({
  movies,
  halls,
}: {
  movies: MovieData[];
  halls: HallData[];
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      return createShow(formData) as Promise<FormState>;
    },
    {}
  );

  const [formData, setFormData] = useState({
    movieId: "",
    hallId: "",
    startTime: "",
    basePrice: "1500",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  // Handle form submission with client-side validation
  const handleSubmit = async (formDataObj: FormData) => {
    const movieId = formDataObj.get("movieId") as string;
    const hallId = formDataObj.get("hallId") as string;
    const startTime = new Date(formDataObj.get("startTime") as string);
    const basePrice = parseFloat(formDataObj.get("basePrice") as string);

    const movie = movies.find((m) => m.id === movieId);
    if (!movie) {
      setValidationErrors({ movieId: "Movie not found" });
      return;
    }

    const validation = validateShowForm(
      movieId,
      hallId,
      startTime,
      basePrice,
      movie.durationMin
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});
    await formAction(formDataObj);
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Update selected movie for display
    if (name === "movieId") {
      const movie = movies.find((m) => m.id === value);
      setSelectedMovie(movie || null);
    }
  };

  // Show toast notifications based on state
  useEffect(() => {
    if (state?.success) {
      toast.success("Show Scheduled", {
        description: state.message,
        duration: 4000,
      });
      // Reset form
      setFormData({
        movieId: "",
        hallId: "",
        startTime: "",
        basePrice: "1500",
      });
      setSelectedMovie(null);
    }
    if (state?.error) {
      toast.error("Scheduling Failed", {
        description: state.error,
        duration: 5000,
      });
    }
  }, [state?.success, state?.error]);

  // Calculate and display movie duration + buffer
  const selectedMovieDuration = selectedMovie
    ? formatDuration(selectedMovie.durationMin + 20)
    : null;

  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-[#222] rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-[#222]">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <Film className="w-4 h-4 text-red-600" />
          Schedule New Screening
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Add a movie to a hall with collision detection
        </p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* Movie Select */}
        <div className="space-y-2">
          <label
            htmlFor="movieId"
            className="text-xs uppercase font-bold text-gray-500 flex items-center gap-1"
          >
            <Film className="w-3 h-3" />
            Select Movie
          </label>
          <select
            id="movieId"
            name="movieId"
            value={formData.movieId}
            onChange={handleChange}
            required
            className={`w-full bg-[#111] border rounded-lg p-3 text-xs text-white focus:outline-none transition-all ${
              validationErrors.movieId
                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#333] focus:border-red-600"
            }`}
          >
            <option value="">-- Choose Film --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.durationMin}m)
              </option>
            ))}
          </select>
          {validationErrors.movieId && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.movieId}
            </p>
          )}
          {selectedMovieDuration && (
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Duration with cleaning: {selectedMovieDuration}
            </p>
          )}
        </div>

        {/* Hall Select */}
        <div className="space-y-2">
          <label
            htmlFor="hallId"
            className="text-xs uppercase font-bold text-gray-500"
          >
            Select Hall
          </label>
          <select
            id="hallId"
            name="hallId"
            value={formData.hallId}
            onChange={handleChange}
            required
            className={`w-full bg-[#111] border rounded-lg p-3 text-xs text-white focus:outline-none transition-all ${
              validationErrors.hallId
                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#333] focus:border-red-600"
            }`}
          >
            <option value="">-- Choose Hall --</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
          {validationErrors.hallId && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.hallId}
            </p>
          )}
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <label
            htmlFor="startTime"
            className="text-xs uppercase font-bold text-gray-500 flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            Start Time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            required
            className={`w-full bg-[#111] border rounded-lg p-3 text-xs text-white focus:outline-none transition-all scheme-dark ${
              validationErrors.startTime
                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#333] focus:border-red-600"
            }`}
          />
          {validationErrors.startTime && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.startTime}
            </p>
          )}
          <p className="text-xs text-gray-700 mt-1 bg-[#0d0d0d] p-2 rounded border border-[#222]">
            💡 The system will automatically add {20} minutes for cleaning after
            the movie ends
          </p>
        </div>

        {/* Base Price */}
        <div className="space-y-2">
          <label
            htmlFor="basePrice"
            className="text-xs uppercase font-bold text-gray-500 flex items-center gap-1"
          >
            <DollarSign className="w-3 h-3" />
            Base Price (LKR)
          </label>
          <input
            id="basePrice"
            name="basePrice"
            type="number"
            value={formData.basePrice}
            onChange={handleChange}
            min="1"
            max="10000"
            required
            className={`w-full bg-[#111] border rounded-lg p-3 text-xs text-white focus:outline-none transition-all ${
              validationErrors.basePrice
                ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                : "border-[#333] focus:border-red-600"
            }`}
          />
          {validationErrors.basePrice && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.basePrice}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
            isPending
              ? "bg-gray-600 text-white cursor-not-allowed opacity-50"
              : "bg-white text-black hover:bg-red-600 hover:text-white shadow-lg shadow-white/20"
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking Conflicts...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Schedule Show
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          ℹ️ <strong>Smart Collision Detection:</strong> If a hall conflict is
          detected, you'll be notified instantly with the conflicting show
          details.
        </p>
      </div>
    </div>
  );
}
