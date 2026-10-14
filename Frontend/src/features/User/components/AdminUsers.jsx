import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  activateUser,
  changeUserRole,
  deleteUser,
  getUsers,
} from "../services/userApi";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filterParams, setFilterParams] = useState({
    email: "",
    username: "",
    role: "",
    isActive: "",
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      username: "",
      email: "",
      role: "",
      isActive: "",
    },
  });

  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminUsers", page, filterParams],
    queryFn: () =>
      getUsers({
        page,
        limit: 5,
        order: "desc",
        email: filterParams.email || undefined,
        username: filterParams.username || undefined,
        role: filterParams.role || undefined,
        isActive: filterParams.isActive || undefined,
      }),
  });

  const users = usersData?.result || [];
  const totalPages = usersData?.totalPages || 1;

  // Mutations
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => changeUserRole(userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast.success(`Role updated to ${variables.role}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const activationMutation = useMutation({
    mutationFn: (targetUser) => activateUser(targetUser._id),
    onSuccess: (_, targetUser) => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast.success(targetUser.isActive ? "User deactivated" : "User activated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to toggle activation status");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  function onFilterSubmit(data) {
    setFilterParams({
      email: data.email.trim(),
      username: data.username.trim(),
      role: data.role,
      isActive: data.isActive,
    });
    setPage(1);
  }

  function handleClearFilter() {
    reset({
      username: "",
      email: "",
      role: "",
      isActive: "",
    });
    setFilterParams({ email: "", username: "", role: "", isActive: "" });
    setPage(1);
  }

  function handleRoleChange(targetUser) {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    roleMutation.mutate({ userId: targetUser._id, role: nextRole });
  }

  function handleActivationToggle(targetUser) {
    activationMutation.mutate(targetUser);
  }

  function handleDelete(targetUser) {
    const confirmed = window.confirm(
      `Delete user ${targetUser.username || targetUser.email}?`
    );
    if (confirmed) {
      deleteUserMutation.mutate(targetUser._id);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <Error message={error?.message || "Error fetching users"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-16 font-sans transition-colors duration-300">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl sm:p-10">
        <div className="mb-8 flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
            Account Governance
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
            User Accounts & Roles
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage VIP member access, grant administrator privileges, and toggle account activation statuses.
          </p>
        </div>

        {/* 🔍 Search & Filter Bar */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-6 shadow-sm">
          <form onSubmit={handleSubmit(onFilterSubmit)} className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  {...register("username")}
                  placeholder="Search by username..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Role
                </label>
                <select
                  {...register("role")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition focus:border-amber-500"
                >
                  <option value="" className="bg-white dark:bg-slate-900">All roles</option>
                  <option value="user" className="bg-white dark:bg-slate-900">User</option>
                  <option value="admin" className="bg-white dark:bg-slate-900">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  {...register("isActive")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition focus:border-amber-500"
                >
                  <option value="" className="bg-white dark:bg-slate-900">All statuses</option>
                  <option value="true" className="bg-white dark:bg-slate-900">Active</option>
                  <option value="false" className="bg-white dark:bg-slate-900">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest shadow-md transition active:scale-95"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearFilter}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
              >
                Clear
              </button>
            </div>
          </form>

          {(filterParams.username || filterParams.email || filterParams.role || filterParams.isActive) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700 pt-4 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Active filters:</span>
              {filterParams.username && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-400">
                  User: {filterParams.username}
                </span>
              )}
              {filterParams.email && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-400">
                  Email: {filterParams.email}
                </span>
              )}
              {filterParams.role && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-400">
                  Role: {filterParams.role}
                </span>
              )}
              {filterParams.isActive && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-600 dark:text-amber-400">
                  Status: {filterParams.isActive === "true" ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 📊 Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {users.map((item) => {
                const isCurrentUser = item._id === currentUser?._id;
                const isMutating =
                  roleMutation.isPending ||
                  activationMutation.isPending ||
                  deleteUserMutation.isPending;

                return (
                  <tr key={item._id} className="transition-colors hover:bg-stone-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-serif text-sm font-bold text-slate-900 dark:text-white">{item.username}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          item.isActive
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                            : "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                        }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleRoleChange(item)}
                          disabled={isMutating || isCurrentUser}
                          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {item.role === "admin" ? "Make User" : "Make Admin"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActivationToggle(item)}
                          disabled={isMutating || isCurrentUser}
                          className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isMutating || isCurrentUser}
                          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
        <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 px-6 py-4">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white transition hover:bg-stone-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Page <span className="text-amber-600 dark:text-amber-400 font-bold">{page}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
          </p>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white transition hover:bg-stone-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}