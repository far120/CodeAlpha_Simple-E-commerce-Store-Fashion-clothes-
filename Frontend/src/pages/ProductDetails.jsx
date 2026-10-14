import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  FiArrowLeft, 
  FiShoppingBag, 
  FiStar, 
  FiCheck, 
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiHeart, 
  FiShare2, 
  FiMinus, 
  FiPlus, 
  FiChevronRight 
} from "react-icons/fi";
import { getProductById, getProducts, getCategories } from "../features/product/services/productApi";
import { addToCart, getCartItemQuantity, readCart } from "../utils/cart";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/ui/Spinner";
import Error from "../components/ui/Erorr";
import { API_BASE_URL } from "../services/endpoints";

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  { name: "Midnight Black", class: "bg-slate-950 border-slate-700" },
  { name: "Luxury Ivory", class: "bg-amber-50 border-slate-300" },
  { name: "Royal Navy", class: "bg-blue-950 border-blue-800" },
  { name: "Vintage Emerald", class: "bg-emerald-900 border-emerald-700" },
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Selected Product Configuration
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartItems, setCartItems] = useState(() => readCart());

  const backendBaseUrl = useMemo(() => {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }, []);

  function resolveImageUrl(imagePath) {
    if (!imagePath || imagePath === "default.png") {
      return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  }

  // Queries
  const {
    data: product,
    isLoading: loadingProduct,
    isError: isProductError,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["detailsCategories"],
    queryFn: () => getCategories({ page: 1, limit: 100 }),
  });

  const { data: allProductsData } = useQuery({
    queryKey: ["detailsRelatedProducts"],
    queryFn: () => getProducts({ page: 1, limit: 12, order: "desc" }),
  });

  const categories = categoriesData?.result || [];
  const relatedProducts = useMemo(() => {
    const allList = allProductsData?.result || [];
    return allList.filter((p) => p._id !== id).slice(0, 4);
  }, [allProductsData, id]);

  const categoryName = useMemo(() => {
    if (!product || !categories.length) return "Garments";
    const catId = typeof product.category === "object" ? product.category?._id : product.category;
    const match = categories.find((c) => c._id === catId);
    return match ? match.name : product.category?.name || "Collection";
  }, [product, categories]);

  const inStock = Boolean(product?.available) && Number(product?.stock || 0) > 0;
  const currentQuantityInCart = product ? getCartItemQuantity(cartItems, product._id) : 0;
  const maxCanAdd = product ? Math.max(0, Number(product.stock || 0) - currentQuantityInCart) : 0;

  function handleAddToCart(buyNow = false) {
    if (!product || !inStock) return;
    if (quantity > maxCanAdd) {
      toast.showError(`Only ${maxCanAdd} items available to add to your bag.`);
      return;
    }

    const updated = addToCart(product, quantity);
    setCartItems(updated);
    toast.showSuccess(`Added ${quantity} x ${product.name} (${selectedSize}, ${selectedColor.name}) to your bag!`);

    if (buyNow) {
      navigate("/orders");
    }
  }

  function toggleWishlist() {
    setIsWishlisted((prev) => !prev);
    if (!isWishlisted && product) {
      toast.showSuccess(`Saved "${product.name}" to your atelier wishlist!`);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.showSuccess("Product link copied to clipboard!");
    }
  }

  if (loadingProduct) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading luxury garment details...</p>
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Error message={productError?.message || "Garment not found or unavailable."} />
        <Link
          to="/menu"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-xs uppercase tracking-wider"
        >
          <FiArrowLeft /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-8">
          <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link>
          <FiChevronRight className="text-slate-400" />
          <Link to="/menu" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Shop Catalog</Link>
          <FiChevronRight className="text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">

          {/* Left Column: Product Image & Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl group aspect-4/5">
              <img
                src={resolveImageUrl(product.image)}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                  inStock
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                }`}>
                  {inStock ? "In Stock" : "Sold Out"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/90 text-slate-950 shadow-sm backdrop-blur-md">
                  AUTUMN/WINTER '26
                </span>
              </div>

              {/* Quick Actions (Wishlist & Share) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all ${
                    isWishlisted
                      ? "bg-rose-600 text-white"
                      : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-rose-600"
                  }`}
                  title="Save to Wishlist"
                >
                  <FiHeart className={`text-lg ${isWishlisted ? "fill-white" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-amber-600 flex items-center justify-center backdrop-blur-md shadow-md transition-all"
                  title="Share Garment"
                >
                  <FiShare2 className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Details & Controls */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Header / Title */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {categoryName}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full">
                  <FiStar className="fill-amber-400" />
                  <span>4.9 / 5.0 (24 Reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Price & Stock info */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-amber-400">
                  ${Number(product.price || 0).toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Includes all luxury taxes & atelier inspection
                </span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Description Short */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              {product.description || "Crafted with extraordinary precision using premium organic fabrics. Features refined tailoring, hand-finished seams, and timeless modern aesthetics."}
            </p>

            {/* Garment Options: Size Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <span>Select Size</span>
                <span className="text-amber-600 dark:text-amber-400 cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {CLOTHING_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                      selectedSize === size
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow-md scale-105"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Garment Options: Color Selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Color Palette: <span className="text-amber-600 dark:text-amber-400 font-normal">{selectedColor.name}</span>
              </span>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full ${color.class} border-2 transition-all flex items-center justify-center shadow-sm ${
                      selectedColor.name === color.name ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950 scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                    title={color.name}
                  >
                    {selectedColor.name === color.name && <FiCheck className="text-white text-xs" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Quantity</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-full bg-white dark:bg-slate-900 px-3 py-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !inStock}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiMinus className="text-sm" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxCanAdd || 1, q + 1))}
                    disabled={quantity >= maxCanAdd || !inStock}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiPlus className="text-sm" />
                  </button>
                </div>
                {inStock && (
                  <span className="text-xs text-slate-400 font-medium">
                    {product.stock} items remaining in stock
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={!inStock || maxCanAdd === 0}
                  className={`py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
                    !inStock
                      ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                      : maxCanAdd === 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 active:scale-95 cursor-pointer"
                  }`}
                >
                  <FiShoppingBag className="text-lg" />
                  <span>
                    {!inStock
                      ? "Sold Out"
                      : maxCanAdd === 0
                      ? "Max In Bag"
                      : "Add To Shopping Bag"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={!inStock || maxCanAdd === 0}
                  className="py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Buy Now & Express Checkout</span>
                </button>
              </div>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center text-xs">
              <div className="space-y-1">
                <FiTruck className="text-xl text-amber-500 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Express Delivery</div>
                <div className="text-[10px] text-slate-400">2-4 Business Days</div>
              </div>
              <div className="space-y-1">
                <FiShield className="text-xl text-amber-500 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Authentic Luxury</div>
                <div className="text-[10px] text-slate-400">Guaranteed Original</div>
              </div>
              <div className="space-y-1">
                <FiRefreshCw className="text-xl text-amber-500 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-slate-200">Easy Returns</div>
                <div className="text-[10px] text-slate-400">30-Day Policy</div>
              </div>
            </div>

          </div>

        </div>

        {/* Accordion / Tabs Section */}
        <div className="mt-16 lg:mt-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-lg">
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 overflow-x-auto">
            {["description", "fabric", "shipping"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                {tab === "description" && "Description & Craftsmanship"}
                {tab === "fabric" && "Fabric & Garment Care"}
                {tab === "shipping" && "Shipping & Complimentary Returns"}
              </button>
            ))}
          </div>

          <div className="pt-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
            {activeTab === "description" && (
              <div className="space-y-3">
                <p>
                  Every piece in our Atelier collection undergoes rigorous quality control and custom tailoring inspection before leaving our atelier. Designed to fit seamlessly into modern luxury wardrobes.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Signature tailored silhouette with unstructured luxury lining</li>
                  <li>Concealed YKK premium zipper & horn button hardware</li>
                  <li>Double-stitched stress points for maximum durability</li>
                </ul>
              </div>
            )}

            {activeTab === "fabric" && (
              <div className="space-y-3">
                <p>
                  Sourced exclusively from certified sustainable European mills.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Composition: 70% Mulberry Silk, 30% Organic Fine Wool</li>
                  <li>Care: Professional dry clean recommended only</li>
                  <li>Ironing: Warm iron on reverse side with damp cloth shield</li>
                </ul>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-3">
                <p>
                  We offer insured express delivery worldwide via DHL Luxury Express.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Free express shipping on all orders over $150</li>
                  <li>30-day effortless returns with pre-paid return labels included</li>
                  <li>Delivered in eco-luxury signature atelier gift packaging</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                  You May Also Admire
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Curated selections from the same atelier line</p>
              </div>
              <Link
                to="/menu"
                className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All Garments</span>
                <FiChevronRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel._id}
                  onClick={() => navigate(`/products/${rel._id}`)}
                  className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col transform hover:-translate-y-1"
                >
                  <div className="relative h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={resolveImageUrl(rel.image)}
                      alt={rel.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h3 className="font-serif font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {rel.name}
                    </h3>
                    <div className="text-amber-600 dark:text-amber-400 font-bold font-serif text-lg">
                      ${Number(rel.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
