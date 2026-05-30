import React from 'react';
import { X, Heart, Star, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Percent } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: ProductDetailModalProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = React.useState<string>(product.imageUrl);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

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

          <div className="aspect-square w-full max-h-[260px] flex items-center justify-center overflow-hidden">
            <img 
              src={activeImage} 
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
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

            {/* Guarantees of Jumia */}
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
        </div>

      </div>
    </div>
  );
}
