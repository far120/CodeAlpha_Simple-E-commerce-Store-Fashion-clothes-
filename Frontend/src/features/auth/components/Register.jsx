import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "../../../components/ui/Spinner.jsx";

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const passwordValue = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      return await registerAuth({
        email: data.email,
        password: data.password,
        username: data.username,
      });
    },
    onSuccess: () => {
      toast.success("Account created! Welcome to Atelier ✨");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed ❌");
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Fashion Editorial Banner */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000&auto=format&fit=crop"
            alt="Fashion Suit Model"
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 flex items-center justify-center font-serif font-bold text-slate-950 text-lg">
              FM
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">FASHION MARKET</span>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-widest">JOIN THE ATELIER CLUB</p>
            <h2 className="text-4xl font-serif leading-tight">"Fashion passes, style is eternal."</h2>
            <p className="text-xs text-slate-300 font-light">— Yves Saint Laurent</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
          
          {/* Switcher Pills */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-full bg-stone-100 dark:bg-slate-800">
            <Link
              to="/login"
              className="py-2.5 rounded-full text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="py-2.5 rounded-full text-center text-xs font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md"
            >
              Register
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Join to enjoy private lookbooks, free express shipping, and seamless checkout.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Full Name / Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  {...register("username", {
                    required: "Full name / username is required",
                  })}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                    errors.username
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email address is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="name@domain.com"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                    errors.email
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                  placeholder="At least 6 characters"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                    errors.password
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === passwordValue || "Passwords do not match",
                  })}
                  placeholder="Retype password"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-amber-500"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("termsAccepted", {
                    required: "You must accept the terms of service",
                  })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>I agree to the Terms of Service & Privacy Policy</span>
              </label>
              {errors.termsAccepted && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.termsAccepted.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span>Create Atelier Account</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-slate-900 dark:text-amber-400 hover:underline">
              Sign in
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}