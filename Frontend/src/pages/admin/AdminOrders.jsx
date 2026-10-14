import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { useToast } from "../../context/ToastContext";
import { getOrders, updateOrder } from "../../features/product/services/productApi";

const statusList = ["pending", "processing", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: ordersData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminOrders", currentPage, statusFilter],
    queryFn: () => {
      const params = { page: currentPage, limit: 10, order: "desc" };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      return getOrders(params);
    },
  });

  const orders = ordersData?.result || [];
  const totalPages = ordersData?.totalPages || 1;

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrder(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminOrders"]);
      toast?.success("Order status updated");
    },
    onError: (err) => {
      toast?.error(err.message || "Failed to update order status");
    },
  });

  function handleStatusChange(orderId, status) {
    updateStatusMutation.mutate({ orderId, status });
  }

  function getStatusStyles(status) {
    switch (status) {
      case "processing":
        return "border-sky-500/40 bg-sky-500/10 text-sky-300";
      case "delivered":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      case "cancelled":
        return "border-rose-500/40 bg-rose-500/10 text-rose-300";
      default:
        return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    }
  }

  function getOrderCustomer(order) {
    const customer = order?.user;

    if (customer && typeof customer === "object") {
      return {
        name: customer.username || customer.email || "Client",
        email: customer.email || "No email",
      };
    }

    if (typeof customer === "string" && customer.length > 0) {
      return {
        name: `Client #${customer.slice(-6)}`,
        email: "User details not populated",
      };
    }

    return {
      name: "Client",
      email: "User details not available",
    };
  }

  function renderItems(order) {
    return (order.items || []).map((item, index) => {
      const product = item?.product;
      const productName = product && typeof product === "object" ? product.name : product || "Apparel Item";
      const unitPrice = Number(item?.price || product?.price || 0);

      return (
        <div key={`${order._id}-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-sm font-medium text-white">{productName}</p>
              <p className="text-xs text-slate-400">
                Qty {item.quantity} · ${unitPrice.toFixed(2)} each
              </p>
            </div>
            <p className="font-serif text-sm font-medium text-[#D4AF37]">${(unitPrice * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      );
    });
  }

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
        <Error message={error?.message || "Failed to load orders"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-16 font-sans transition-colors duration-300">
      <section className="mx-auto max-w-7xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl sm:p-10">
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
              Atelier Logistics
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
              Order Fulfillment & Management
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Manage client transactions, track purchased items, and update delivery status across all orders.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white outline-none focus:border-amber-500"
          >
            <option value="all" className="bg-white dark:bg-slate-900">All Statuses</option>
            {statusList.map((status) => (
              <option key={status} value={status} className="bg-white dark:bg-slate-900">
                {status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Orders Displayed</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Items</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">
              {orders.reduce((count, order) => count + (order.items || []).length, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Batch Total Value</p>
            <p className="mt-1 font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orders.map((order) => {
            const customer = getOrderCustomer(order);

            return (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-6 shadow-md transition-all duration-300 hover:border-amber-500/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                      Order #{order._id?.slice(-6)}
                    </span>
                    <h2 className="mt-1 font-serif text-lg font-bold text-slate-900 dark:text-white">{customer.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{customer.email}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${getStatusStyles(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent order"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">{renderItems(order)}</div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order Total</p>
                    <p className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={order.status}
                      disabled={updateStatusMutation.isPending}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className="rounded-xl border border-[#D4AF37]/40 bg-stone-100 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] outline-none disabled:opacity-40"
                    >
                      {statusList.map((status) => (
                        <option key={status} value={status} className="bg-stone-100 text-slate-900 dark:bg-slate-900 dark:text-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 p-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No orders found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0D1322] px-5 py-4">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white transition hover:bg-slate-200 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Page <span className="text-[#D4AF37] font-bold">{currentPage}</span> of{" "}
            <span className="text-slate-900 dark:text-white">{totalPages}</span>
          </p>
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}
