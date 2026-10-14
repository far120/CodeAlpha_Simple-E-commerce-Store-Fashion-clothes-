import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUser, FiMail, FiLock, FiSave } from "react-icons/fi";
import { getProfile, updateProfile } from "../services/userApi.js";
import Spinner from "../../../components/ui/Spinner.jsx";
import Error from "../../../components/ui/Erorr.jsx";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function Profile() {
  const { user: authUser, setUser, isAdmin, isManager } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
    initialData: authUser,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      username: profileData?.username || "",
      email: profileData?.email || "",
    },
  });

  useEffect(() => {
    if (profileData) {
      reset({
        username: profileData.username || "",
        email: profileData.email || "",
      });
    }
  }, [profileData, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedData) => {
      setUser(updatedData);
      queryClient.setQueryData(["userProfile"], updatedData);
      reset({
        username: updatedData.username || "",
        email: updatedData.email || "",
      });
      toast.success("Profile updated successfully ✨");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile ❌");
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-serif italic text-slate-500">Loading Atelier Member Profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-12 max-w-4xl px-4">
        <Error message={error?.message || "Error loading profile"} />
      </div>
    );
  }

  const currentUsername = profileData?.username || authUser?.username || "";
  const currentEmail = profileData?.email || authUser?.email || "";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-10 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Profile Avatar Header */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-serif font-bold text-3xl shadow-xl shrink-0">
            {(currentUsername || "U").charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              {isAdmin ? "ATELIER ADMIN" : isManager ? "MANAGER" : "VIP ATELIER MEMBER"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              {currentUsername || "Member Profile"}
            </h1>
            <p className="text-xs text-slate-400 font-light">{currentEmail}</p>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ACCOUNT DETAILS
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Profile Settings</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Name / Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  {...register("username", {
                    required: "Username cannot be empty",
                  })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={!isDirty || updateProfileMutation.isPending}
                onClick={() =>
                  reset({
                    username: currentUsername,
                    email: currentEmail,
                  })
                }
                className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={!isDirty || updateProfileMutation.isPending}
                className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FiSave className="text-base" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Box */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FiLock className="text-amber-500" />
                Security & Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Keep your account protected with a strong, updated password.
              </p>
            </div>

            <Link
              to="/reset-password"
              className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Update Password
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}