import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../services/endpoints";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getProducts,
  updateProduct,
} from "../../features/product/services/productApi";

export default function AdminProductsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  // Queries
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ["adminProducts", page],
    queryFn: () => getProducts({ page, limit: 10, order: "desc" }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["adminCategoriesAll"],
    queryFn: () => getCategories({ page: 1, limit: 100, order: "desc" }),
  });

  const { data: brandsData } = useQuery({
    queryKey: ["adminBrandsAll"],
    queryFn: () => getBrands({ page: 1, limit: 100, order: "desc" }),
  });

  const products = productsData?.result || [];
  const totalPages = productsData?.totalPages || 1;
  const categories = categoriesData?.result || [];
  const brands = brandsData?.result || [];

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [categories]);

  const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach((item) => map.set(item._id, item.name));
    return map;
  }, [brands]);

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      available: "true",
    },
  });

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        return await updateProduct(id, payload);
      }
      return await createProduct(payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast?.success(variables.id ? "Product updated successfully" : "Product created successfully");
      resetForm();
    },
    onError: (err) => {
      toast?.error(err.message || "Operation failed");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminProducts"]);
      toast?.success("Product deleted");
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to delete product");
    },
  });

  function beginEdit(product) {
    setEditingId(product._id);
    setValue("name", product.name || "");
    setValue("description", product.description || "");
    setValue("price", product.price || "");
    setValue("stock", product.stock || "");
    setValue(
      "category",
      typeof product.category === "object" ? product.category?._id || "" : product.category || ""
    );
    setValue(
      "brand",
      typeof product.brand === "object" ? product.brand?._id || "" : product.brand || ""
    );
    setValue("available", product.available ? "true" : "false");
    setImageFile(null);
  }

  function resetForm() {
    setEditingId(null);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      available: "true",
    });
    setImageFile(null);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  }

  const onSubmitForm = (data) => {
    const payload = new FormData();
    payload.append("name", data.name);
    payload.append("description", data.description);
    payload.append("price", Number(data.price));
    payload.append("stock", Number(data.stock));
    payload.append("category", data.category);
    payload.append("brand", data.brand);
    payload.append("available", data.available);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    saveProductMutation.mutate({ id: editingId, payload });
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  function getCategoryName(product) {
    if (product.category && typeof product.category === "object") {
      return product.category.name || "Uncategorized";
    }
    return categoryMap.get(product.category) || "Uncategorized";
  }

  function getBrandName(product) {
    if (product.brand && typeof product.brand === "object") {
      return product.brand.name || "No brand";
    }
    return brandMap.get(product.brand) || "No brand";
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const categoryName = getCategoryName(product);
      const brandName = getBrandName(product);
      const matchesSearch = !term || `${product.name} ${categoryName} ${brandName}`.toLowerCase().includes(term);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && product.available) ||
        (availabilityFilter === "unavailable" && !product.available);

      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, availabilityFilter, categoryMap, brandMap]);

  if (loadingProducts) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <Error message={productsError?.message || "Failed to load products"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-16 font-sans transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
            Couture Inventory
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
            Atelier Product Catalog
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create, update, and curate luxury apparel, accessories, stock counts, and brand assignments.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left Panel: Form */}
          <article className="h-fit rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <h2 className="font-serif text-xl font-bold tracking-wide text-slate-900 dark:text-white">
              {editingId ? "Edit Apparel Item" : "Create New Apparel Item"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fill in the fashion product details below to update your online storefront.
            </p>

            <form onSubmit={handleSubmit(onSubmitForm)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Product Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Product name is required" })}
                  placeholder="e.g. Silk Evening Gown"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...register("description")}
                  placeholder="Detailed craftsmanship, fabric details, size & fit guide..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-amber-600 dark:file:text-amber-400 hover:file:bg-amber-500/30"
                />
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {editingId
                    ? "Upload a new photo only if you wish to replace the current image."
                    : "Upload high-resolution lookbook image."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    {...register("price", { required: "Price is required" })}
                    placeholder="299.00"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("stock", { required: "Stock is required" })}
                    placeholder="15"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-amber-500"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-amber-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id} className="bg-white dark:bg-slate-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Brand
                  </label>
                  <select
                    {...register("brand", { required: "Brand is required" })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-amber-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id} className="bg-white dark:bg-slate-900">
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.brand.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Store Availability
                </label>
                <select
                  {...register("available")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-amber-500"
                >
                  <option value="true" className="bg-white dark:bg-slate-900">Available for purchase</option>
                  <option value="false" className="bg-white dark:bg-slate-900">Unavailable / Hidden</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveProductMutation.isPending}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {saveProductMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </article>

          {/* Right Panel: Product List */}
          <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <h2 className="font-serif text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                    Catalog Inventory
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {filteredProducts.length} of {products.length} products on page {page}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search catalog..."
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
                  />
                  <select
                    value={availabilityFilter}
                    onChange={(event) => setAvailabilityFilter(event.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  >
                    <option value="all" className="bg-white dark:bg-slate-900">All Statuses</option>
                    <option value="available" className="bg-white dark:bg-slate-900">Available Only</option>
                    <option value="unavailable" className="bg-white dark:bg-slate-900">Unavailable Only</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-4 transition-all duration-300 hover:border-amber-500/40"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={resolveImageUrl(product.image)}
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d";
                          }}
                          className="h-20 w-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div>
                          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {product.description || "No description provided."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-slate-300">
                              {getCategoryName(product)}
                            </span>
                            <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 font-semibold text-[#D4AF37]">
                              {getBrandName(product)}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-semibold ${
                                product.available
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-rose-500/15 text-rose-300"
                              }`}
                            >
                              {product.available ? "Available" : "Unavailable"} · Stock: {product.stock ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <p className="font-serif text-xl font-medium text-[#D4AF37]">
                          ${Number(product.price || 0).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => beginEdit(product)}
                            className="rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteProductMutation.isPending}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
                    <p className="text-sm text-slate-400">No products found matching criteria.</p>
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
