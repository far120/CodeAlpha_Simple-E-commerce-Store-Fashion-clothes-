import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import Error from "../../../components/ui/Erorr";
import Spinner from "../../../components/ui/Spinner";
import { getUserLogs } from "../services/userApi";

export default function AdminUserLogs() {
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      emailInput: "",
    },
  });

  const {
    data: logsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminUserLogs", page, emailFilter],
    queryFn: () =>
      getUserLogs({
        page,
        limit: 5,
        order: "desc",
        email: emailFilter || undefined,
      }),
  });

  const logs = logsData?.result || [];
  const totalPages = logsData?.totalPages || 1;
  const totalResults = logsData?.totalResults || 0;

  function onSearchSubmit(data) {
    setPage(1);
    setEmailFilter(data.emailInput.trim());
  }

  function handleClearFilter() {
    reset({ emailInput: "" });
    setEmailFilter("");
    setPage(1);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-slate-950">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <Error message={error?.message || "Failed to load logs"} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-[#FAF9F6] sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-10">
        <div className="mb-8 flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Audit Intelligence
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-wide text-slate-900 dark:text-white sm:text-4xl">
            System & User Activity Logs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time audit log recording user actions, HTTP endpoints, method verbs, and response status codes.
          </p>
        </div>

        {/* 🔍 Search Bar Panel */}
        <div className="mb-8 rounded-2xl border border-slate-200/80 bg-slate-50 p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1322]">
          <form onSubmit={handleSubmit(onSearchSubmit)} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                {...register("emailInput")}
                placeholder="Search audit logs by email address..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#D4AF37] dark:border-white/15 dark:bg-[#090D16] dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-950 shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition hover:brightness-110 active:scale-95 sm:whitespace-nowrap"
            >
              Search Logs
            </button>

            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-700 transition hover:bg-slate-200 active:scale-95 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Clear
            </button>
          </form>

          {emailFilter && (
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs dark:border-white/10">
              <span className="text-slate-600 dark:text-slate-400">Filtering by email:</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-semibold text-[#D4AF37]">
                {emailFilter}
                <button onClick={handleClearFilter} className="hover:text-slate-900 dark:hover:text-white">
                  ✕
                </button>
              </span>
            </div>
          )}
        </div>

        {/* 📊 Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D1322]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/60 uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">URL Endpoint</th>
                <th className="px-6 py-4 font-semibold">Status Code</th>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 dark:divide-white/5 dark:text-slate-200">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.04]">
                    {/* USER */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-serif text-sm font-medium text-slate-900 dark:text-white">{log.username || "System User"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{log.email || "-"}</p>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                        {log.action || "-"}
                      </span>
                    </td>

                    {/* METHOD */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          log.method === "GET"
                            ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : log.method === "POST"
                            ? "border border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-300"
                            : log.method === "PUT"
                            ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                            : log.method === "DELETE"
                            ? "border border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-300"
                            : "border border-slate-300 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        {log.method || "-"}
                      </span>
                    </td>

                    {/* URL */}
                    <td className="px-6 py-4">
                      <div className="max-w-[220px] truncate font-mono text-xs text-slate-700 dark:text-slate-300" title={log.url}>
                        {log.url || "-"}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold ${
                          !log.statusCode
                            ? "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                            : log.statusCode >= 200 && log.statusCode < 300
                            ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : log.statusCode >= 300 && log.statusCode < 400
                            ? "border border-sky-500/30 bg-sky-500/15 text-sky-600 dark:text-sky-300"
                            : log.statusCode >= 400 && log.statusCode < 500
                            ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                            : "border border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-300"
                        }`}
                      >
                        {log.statusCode || "-"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
        <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#0D1322]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            ← Previous
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Page <span className="text-[#D4AF37] font-bold">{page}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
          </p>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Next →
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{logs.length}</span> logs on this page · Total records:{" "}
          <span className="font-semibold text-[#D4AF37]">{totalResults}</span>
        </div>
      </section>
    </div>
  );
}