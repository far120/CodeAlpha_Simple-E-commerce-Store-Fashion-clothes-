import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FiLock, FiKey, FiArrowRight } from "react-icons/fi";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { resetMyPassword } from "../services/userApi";
import Spinner from "../../../components/ui/Spinner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const resetMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      return await resetMyPassword({ currentPassword, newPassword });
    },
    onSuccess: () => {
      toast.success("Password changed successfully. Please sign in again ✨");
      logout();
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password ❌");
    },
  });

  const onSubmit = (data) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-2xl">
            <FiKey />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Change Password</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your current password to verify identity and choose a new secure password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Current Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="password"
                {...register("currentPassword", {
                  required: "Current password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter current password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            {errors.currentPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "New password must be at least 6 characters",
                  },
                })}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm new password",
                  validate: (val) => val === newPasswordValue || "Passwords do not match",
                })}
                placeholder="Confirm new password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-3 space-y-3">
            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resetMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span>Update Password</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
