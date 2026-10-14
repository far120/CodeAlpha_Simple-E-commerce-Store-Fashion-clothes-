import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { createBrand, deleteBrand, getBrands } from "../../features/product/services/productApi";

export default function AdminBrandsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const {
    data: brandsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminBrands", page],
    queryFn: () => getBrands({ page, limit: 10, order: "desc" }),
  });

  const brands = brandsData?.result || [];
  const totalPages = brandsData?.totalPages || 1;
  const totalResults = brandsData?.totalResults || 0;

  const createBrandMutation = useMutation({
    mutationFn: (payload) => createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBrands"]);
      toast?.success("Brand created successfully");
      reset();
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to create brand");
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId) => deleteBrand(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBrands"]);
      toast?.success("Brand deleted");
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to delete brand");
    },
  });

  const onSubmitBrand = (data) => {
    createBrandMutation.mutate({ name: data.name.trim() });
  };

  const handleDelete = (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      deleteBrandMutation.mutate(brandId);
    }
  };

  const filteredBrands = brands.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return item.name.toLowerCase().includes(term);
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <Error message={error?.message || "Failed to load brands"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-16 font-sans transition-colors duration-300">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
            Brand Partnerships
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
            Fashion Brands & Designers
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Register and manage featured luxury labels, design houses, and fashion ateliers.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.2fr]">
          {/* Create Brand Form */}
          <article className="h-fit rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Add New Brand</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter the official brand or designer label name.
            </p>

            <form onSubmit={handleSubmit(onSubmitBrand)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Brand Name
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Brand name is required",
                  })}
                  placeholder="e.g. Maison Atelier"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createBrandMutation.isPending}
                className="w-full rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {createBrandMutation.isPending ? "Creating..." : "Create Brand"}
              </button>
            </form>
          </article>

          {/* Current Brands List */}
          <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Registered Brands</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total {totalResults} brands in catalog</p>
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search brands..."
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-6 space-y-3">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-4 transition-all hover:border-amber-500/40"
                  >
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      {brand.name}
                    </span>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      disabled={deleteBrandMutation.isPending}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/20 active:scale-95 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {filteredBrands.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/40 p-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">No brands found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white transition hover:bg-stone-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Page <span className="text-amber-600 dark:text-amber-400 font-bold">{page}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
              </p>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white transition hover:bg-stone-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
