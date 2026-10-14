import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiStar, FiEdit, FiTrash2, FiMessageSquare, FiCheckCircle, FiUser } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  createReview,
  deleteReview,
  getProducts,
  getReviews,
  updateReview,
} from "../features/product/services/productApi";

export default function ReviewsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch Products
  const {
    data: productsData,
    isLoading: loadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: ["reviewProducts"],
    queryFn: () => getProducts({ page: 1, limit: 100, order: "desc" }),
  });

  const products = productsData?.result || [];

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]._id);
    }
  }, [products, selectedProduct]);

  // Fetch Reviews
  const {
    data: reviewsData,
    isLoading: loadingReviews,
    isError: isReviewsError,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", selectedProduct],
    queryFn: () => getReviews(selectedProduct ? { productId: selectedProduct } : {}),
    enabled: Boolean(selectedProduct),
  });

  const reviews = reviewsData?.reviews || [];

  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const rating = watch("rating");

  // Mutations
  const createReviewMutation = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", selectedProduct]);
      toast?.success("Thank you! Review published");
      resetForm();
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to create review");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, payload }) => updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", selectedProduct]);
      toast?.success("Review updated successfully");
      resetForm();
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to update review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", selectedProduct]);
      toast?.success("Review removed");
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to delete review");
    },
  });

  function resetForm() {
    setEditingId(null);
    reset({
      rating: 5,
      comment: "",
    });
  }

  function handleEdit(review) {
    setEditingId(review._id);
    setValue("rating", review.rating || 5);
    setValue("comment", review.comment || "");
  }

  function handleDelete(reviewId) {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  }

  const onSubmitReview = (data) => {
    if (!isAuthenticated) {
      toast?.warning("Please login to submit a review");
      return;
    }

    if (!selectedProduct) {
      toast?.warning("Choose a garment first");
      return;
    }

    if (editingId) {
      updateReviewMutation.mutate({
        reviewId: editingId,
        payload: { rating: Number(data.rating), comment: data.comment.trim() },
      });
    } else {
      createReviewMutation.mutate({
        productId: selectedProduct,
        rating: Number(data.rating),
        comment: data.comment.trim(),
      });
    }
  };

  const myUserId = user?._id || user?.id;

  const selectedProductName = useMemo(() => {
    return products.find((item) => item._id === selectedProduct)?.name || "Selected Product";
  }, [products, selectedProduct]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  if (loadingProducts) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-serif italic text-slate-500">Loading Customer Feedback...</p>
      </div>
    );
  }

  if (isProductsError) {
    return (
      <div className="mx-auto mt-12 max-w-4xl px-4">
        <Error message={productsError?.message || "Failed to load products"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-10 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Page Header */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              VERIFIED ATELIER REVIEWS
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal">
              Customer Ratings & Feedback
            </h1>
            <p className="text-sm text-slate-300 max-w-xl font-light">
              Read authentic feedback from verified buyers or share your own experience with our garments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center shrink-0 min-w-[180px]">
            <div className="text-3xl font-serif font-bold text-amber-400">{averageRating} ★</div>
            <div className="text-xs text-slate-300 mt-1">Based on {reviews.length} reviews</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Write / Edit Review Card (5 cols) */}
          <article className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {editingId ? "EDIT YOUR FEEDBACK" : "SHARE YOUR EXPERIENCE"}
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                {editingId ? "Update Review" : "Write a Review"}
              </h2>
            </div>

            {/* Select Product */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Garment
              </label>
              <select
                value={selectedProduct}
                onChange={(event) => setSelectedProduct(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Rating Star Score ({rating}/5)
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue("rating", star)}
                      className={`text-2xl transition-transform transform hover:scale-125 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  {...register("comment", { required: "Please write a short comment about your purchase" })}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-amber-500"
                  placeholder="How was the fabric quality, sizing fit, and delivery..."
                />
                {errors.comment && (
                  <p className="text-xs text-rose-500 font-medium">{errors.comment.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
              >
                {createReviewMutation.isPending || updateReviewMutation.isPending
                  ? "Saving..."
                  : editingId
                  ? "Update Review"
                  : "Publish Review"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </article>

          {/* Reviews List Column (7 cols) */}
          <article className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                PRODUCT FEEDBACK
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                Reviews For <span className="text-amber-600 dark:text-amber-400">{selectedProductName}</span>
              </h2>
            </div>

            {loadingReviews ? (
              <div className="flex py-12 justify-center">
                <Spinner size="lg" />
              </div>
            ) : isReviewsError ? (
              <Error message={reviewsError?.message || "Failed to load reviews"} />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const reviewUserId = review?.user?._id || review?.user?.id;
                  const canManage = myUserId && String(reviewUserId) === String(myUserId);

                  return (
                    <div
                      key={review._id}
                      className="p-5 rounded-3xl bg-stone-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                            <FiUser />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{review?.user?.username || review?.user?.email || "Atelier Customer"}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                                <FiCheckCircle /> Verified Buyer
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                              {[...Array(review.rating || 5)].map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(review)}
                              className="p-2 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Review"
                            >
                              <FiEdit className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(review._id)}
                              disabled={deleteReviewMutation.isPending}
                              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                              title="Delete Review"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed pl-12">
                        "{review.comment || "No written review comment."}"
                      </p>
                    </div>
                  );
                })}

                {reviews.length === 0 && (
                  <div className="py-16 text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-6">
                    <FiMessageSquare className="text-3xl text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">No reviews published yet for this garment.</p>
                  </div>
                )}
              </div>
            )}
          </article>

        </div>

      </div>
    </div>
  );
}
