import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiBox, FiClock, FiLayers, FiShoppingBag } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";
import Error from "../../components/ui/Erorr";
import { getCategories, getOrders, getProducts, getBrands, getstatistics } from "../../features/product/services/productApi";

export default function AdminProductsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState(null);
  const [brandsData, setBrandsData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, ordersResponse, statisticsResponse, brandsResponse] = await Promise.all([
          getProducts({ page: 1, limit: 20, order: "desc" }),
          getCategories({ page: 1, limit: 20, order: "desc" }),
          getOrders({ page: 1, limit: 20, order: "desc" }),
          getstatistics({ page: 1, limit: 20, order: "desc" }),
          getBrands({ page: 1, limit: 20, order: "desc" }),
        ]);

        if (mounted) {
          setProductsData(productsResponse);
          setCategoriesData(categoriesResponse);
          setBrandsData(brandsResponse);
          setOrdersData(ordersResponse);
          setStatisticsData(statisticsResponse);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const products = productsData?.result || [];
  const orders = ordersData?.result || [];
  const brands = brandsData?.result || [];
  const statistics = statisticsData?.data || {};
  const totalRevenue = statistics.totalRevenue || 0;

  const unavailableCount = useMemo(() => {
    return products.filter((item) => !item.available).length;
  }, [products]);

  const recentProducts = useMemo(() => products.slice(0, 5), [products]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <Error message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-16 font-sans transition-colors duration-300">
      <section className="mx-auto max-w-7xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl sm:p-10">
        <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
              Atelier Commerce Hub
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-4xl">
              Catalog & Order Operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Live monitoring of fashion catalog metrics, revenue analytics, brand taxonomies, and recent client orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition active:scale-95"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
            >
              Manage Orders
            </Link>
            <Link
              to="/admin/categories"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
            >
              Manage Categories
            </Link>
            <Link
              to="/admin/brands"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
            >
              Manage Brands
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <FiBox className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Products</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{productsData?.totalResults || 0}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <FiLayers className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categories</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{categoriesData?.totalResults || 0}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fashion Brands</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{brands.length}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-rose-500/15 p-2.5 text-rose-600 dark:text-rose-400">
              <FiClock className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Out of Stock</p>
            <p className="mt-1 font-serif text-3xl font-bold text-rose-600 dark:text-rose-400">{unavailableCount}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Orders</p>
            <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">{statistics.totalOrdersCount || 0}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm transition hover:border-amber-500/40">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gross Orders Value</p>
            <p className="mt-1 font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${Number(statistics.totalAllOrdersPrice || 0).toFixed(2)}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-amber-500/20 p-2.5 text-amber-600 dark:text-amber-400">
              <FiShoppingBag className="text-xl" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Net Revenue</p>
            <p className="mt-1 font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${Number(totalRevenue).toFixed(2)}
            </p>
          </article>

          {statistics.byStatus?.map((status) => (
            <article
              key={status._id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-5 shadow-sm"
            >
              <div className="mb-3 inline-flex rounded-xl bg-slate-200 dark:bg-slate-700 p-2.5 text-slate-700 dark:text-slate-300">
                <FiShoppingBag className="text-xl" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total: {status._id}
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">
                ${Number(status.totalPrice || 0).toFixed(2)}
              </p>
            </article>
          ))}
        </div>

        {/* Tables/Lists Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Products */}
          <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Catalog</span>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Recent Additions</h2>
              </div>
              <FiBox className="text-2xl text-amber-500/60" />
            </div>

            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product._id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-base font-bold text-slate-900 dark:text-white">{product.name || "Apparel Item"}</p>
                    <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 font-bold">${Number(product.price || 0).toFixed(2)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      product.available
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {product.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              ))}

              {recentProducts.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/40 p-4 text-xs text-slate-500 dark:text-slate-400">
                  No products added yet.
                </p>
              )}
            </div>
          </article>

          {/* Recent Orders */}
          <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Client Orders</span>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Recent Orders</h2>
              </div>
              <FiShoppingBag className="text-2xl text-amber-500/60" />
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => {
                const customer =
                  order?.user && typeof order.user === "object"
                    ? order.user.username || order.user.email || "Client"
                    : "Client";

                return (
                  <div key={order._id} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{customer}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {order.items?.length || 0} items · <span className="text-amber-600 dark:text-amber-400 font-bold font-serif">${Number(order.totalAmount || 0).toFixed(2)}</span>
                        </p>
                      </div>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {order.status || "pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent order"}
                    </p>
                  </div>
                );
              })}

              {recentOrders.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/40 p-4 text-xs text-slate-500 dark:text-slate-400">
                  No order activity recorded yet.
                </p>
              )}
            </div>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
          >
            Back to Admin Hub
          </Link>
        </div>
      </section>
    </div>
  );
}
