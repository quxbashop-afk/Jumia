import React from 'react';
import { X, Heart, Star, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Percent, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: boolean;
  onAddReview?: (productId: string, rating: number, comment: string, userName: string) => Promise<void>;
  currentUser?: { name: string; email: string } | null;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onAddReview,
  currentUser
}: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = React.useState<string>(product.imageUrl);
  const [zoomPos, setZoomPos] = React.useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = React.useState(false);

  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState('');
  const [reviewName, setReviewName] = React.useState('');
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  React.useEffect(() => {
    if (currentUser) {
      setReviewName(currentUser.name);
    } else {
      setReviewName('');
    }
  }, [currentUser]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !onAddReview) return;
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await onAddReview(product.id, reviewRating, reviewComment, reviewName.trim() || 'Guest User');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      console.error("Add review failed:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatNaira = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  // Combine original imageUrl with any optional imageUrls array, deduplicate and filter
  const allImages = Array.from(new Set([product.imageUrl, ...(product.imageUrls || [])])).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" id="product-detail-modal">
      {/* Dark Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Main card box container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 md:p-8 flex flex-col md:flex-row gap-8 z-10 max-h-[90vh] overflow-y-auto animate-fade-in divide-y md:divide-y-0 md:divide-x divide-gray-100">
        
        {/* Dismiss trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition"
          aria-label="Dismiss details screen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image Display with Gallery Carousel */}
        <div className="w-full md:w-1/2 flex flex-col gap-4 justify-between items-center bg-gray-50/50 p-6 rounded-lg border border-gray-100 relative">
          
          {/* Discount badge inside stage */}
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full z-10 font-sans">
              {product.discount}% OFF SPECIAL
            </span>
          )}

          <div 
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="aspect-square w-full max-h-[260px] flex items-center justify-center overflow-hidden bg-white border border-gray-100 rounded-lg cursor-zoom-in"
          >
            <img 
              src={activeImage} 
              alt={product.name}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
              }}
              className="max-h-full max-w-full object-contain transition-transform duration-100 ease-out"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Multiple Pictures Gallery Row */}
          {allImages.length > 0 && (
            <div className="w-full space-y-2 mt-2">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest text-center">Product Photos ({allImages.length})</p>
              <div className="flex gap-2 justify-center items-center overflow-x-auto pb-1">
                {allImages.map((imgUrl, idx) => {
                  const isSelected = activeImage === imgUrl;
                  return (
                    <button
                      key={imgUrl + '-' + idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-12 h-12 rounded border p-0.5 overflow-hidden transition flex-shrink-0 bg-white ${
                        isSelected 
                          ? 'border-[#7c3aed] ring-2 ring-purple-100 scale-105' 
                          : 'border-gray-200 hover:border-gray-400 hover:scale-102'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Pic ${idx + 1}`} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-400 font-mono text-center">
            *Product images represent actual high-fidelity appliance stock
          </p>
        </div>

        {/* Right Side: Specifications & Order actions */}
        <div className="w-full md:w-1/2 md:pl-8 pt-6 md:pt-0 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] bg-purple-50 text-purple-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                {product.category}
              </span>
              <h2 className="text-lg md:text-xl font-display font-extrabold text-gray-900 leading-snug mt-2">
                {product.name}
              </h2>
              <p className="text-xs text-purple-600 font-bold mt-1">Sold & Shipped by: {product.sellerName}</p>
            </div>

            {/* Ratings row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-semibold">{product.rating} / 5.0 Rating ({product.reviewsCount} verified comments)</span>
            </div>

            {/* Pricing block */}
            <div className="flex items-baseline gap-3.5 p-3.5 bg-purple-50/50 rounded-lg border border-purple-100">
              <span className="text-2xl font-black text-[#7c3aed] font-display">
                {formatNaira(product.price)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-gray-400 line-through font-medium">
                    {formatNaira(product.originalPrice)}
                  </span>
                  <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase">
                    SAVE {formatNaira(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Product description paragraph */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Overview Details:</span>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            {/* Product Specifications table */}
            {product.specifications && (
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Specifications:</span>
                <div className="bg-gray-50 rounded border border-gray-100 text-xs font-sans divide-y divide-gray-100">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2.5">
                      <span className="font-semibold text-gray-500 uppercase text-[10px]">{key}</span>
                      <span className="font-extrabold text-gray-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees of Quxba */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-sans text-gray-500 pt-2 border-t border-gray-50">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-green-600 mb-1" />
                <span className="font-bold text-gray-800">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="font-bold text-gray-800">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCcw className="w-5 h-5 text-purple-500 mb-1" />
                <span className="font-bold text-gray-800">7 Days Return</span>
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
               onClick={() => {
                 onAddToCart(product);
                 onClose();
               }}
               className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3.5 rounded-lg text-xs md:text-sm font-bold transition shadow-md flex items-center justify-center gap-2.5 active:scale-98"
            >
               <ShoppingCart className="w-4.5 h-4.5" />
               <span>ADD TO CART</span>
            </button>
            <button
               onClick={() => onToggleWishlist(product)}
               className="bg-gray-100 hover:bg-gray-250 text-gray-600 p-3.5 rounded-lg border border-gray-200 transition flex items-center justify-center hover:text-red-500 active:scale-95"
               aria-label="Add to wishlist"
            >
               <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Customer Reviews & Feedback Block */}
          <div className="border-t border-gray-100 pt-5 mt-5 space-y-4 text-left">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>

            {/* List of Previous reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {product.reviews.map((r, i) => (
                  <div key={r.id || i} className="bg-slate-50 p-2.5 rounded-lg border border-gray-150/50 text-xs font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 text-[11px]">{r.userName}</span>
                      <span className="text-[9px] text-gray-400 font-bold">{r.date}</span>
                    </div>
                    <div className="flex text-amber-500 mb-1">
                      {Array.from({ length: 5 }).map((_, stIdx) => (
                        <Star 
                          key={stIdx} 
                          className={`w-3 h-3 ${stIdx < r.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 italic text-[11px] leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No reviews yet. Be the first to express feedback on this item!</p>
            )}

            {/* Write Review Form */}
            {onAddReview && (
              <form onSubmit={handleReviewSubmit} className="bg-purple-50/40 p-4 rounded-xl border border-purple-100/60 space-y-3 font-sans">
                <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest block">Write Customer Review</span>

                {/* Stars ratings button row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-bold">Your Rating:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, stIdx) => {
                      const ratingVal = stIdx + 1;
                      return (
                        <button
                          key={ratingVal}
                          type="button"
                          onClick={() => setReviewRating(ratingVal)}
                          className={`transition duration-100 hover:scale-110 cursor-pointer ${
                            ratingVal <= reviewRating ? 'text-amber-500' : 'text-gray-300'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${ratingVal <= reviewRating ? 'fill-amber-500' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Name Input */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Kola Adesina"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#7c3aed]"
                    required
                  />
                </div>

                {/* Comments Textarea */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Feedback Comments</label>
                  <textarea 
                    placeholder="Describe your user experience with this device..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-[#7c3aed]"
                    required
                  />
                </div>

                {/* Submit review */}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-purple-300 text-white py-2 rounded text-xs font-bold uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                >
                  {reviewSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Comment</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
