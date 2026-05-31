import React from 'react';
import { Heart, Star, Share2, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onClick: (p: Product) => void;
  onQuickView: (p: Product) => void;
  key?: React.Key;
}

export default function ProductCard({
  product,
  isInWishlist,
  onAddToCart,
  onToggleWishlist,
  onClick,
  onQuickView
}: ProductCardProps) {
  // Format price in Nigerian Naira
  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-NG');
  };

  // Determine beautiful custom badges to mimic authentic Quxba variety
  const isOfficialStore = product.category.toLowerCase().includes('electronic') || 
                          product.name.toLowerCase().includes('nivea') ||
                          product.name.toLowerCase().includes('tv') ||
                          product.brand?.toLowerCase() === 'nivea';

  // Slower-moving health/beauty cosmetics are often non-returnable on Quxba
  const isNonReturnable = product.category.toLowerCase().includes('beauty') || 
                          product.category.toLowerCase().includes('health') || 
                          product.name.toLowerCase().includes('deodorant') ||
                          product.name.toLowerCase().includes('roll-on') ||
                          product.name.toLowerCase().includes('lotion') ||
                          product.name.toLowerCase().includes('spray');

  return (
    <div 
      className="group bg-white rounded-md border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative p-2 sm:p-2.5"
      id={`product-card-${product.id}`}
    >
      {/* Top badges bar over image */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        {/* Non-returnable badge */}
        {isNonReturnable ? (
          <span className="bg-[#4db6ac] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            Non-returnable
          </span>
        ) : (
          <div />
        )}

        {/* Discount Tag */}
        {product.discount > 0 && (
          <span className="bg-[#f5f3ff] border border-purple-100 text-[#7c3aed] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm pointer-events-auto">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Product Image Row */}
      <div 
        onClick={() => onClick(product)}
        className="aspect-square w-full bg-white flex items-center justify-center p-1 sm:p-2 overflow-hidden cursor-pointer relative mb-1"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-[92%] max-w-[92%] object-contain group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/[0.01] group-hover:bg-black/[0.03] transition-colors" />

        {/* Gold/Purple styled Wishlist Heart Icon exactly as displayed on mobile app (bottom right of image stage) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute bottom-1 right-1 bg-white hover:bg-purple-50 text-gray-400 p-1.5 rounded-full z-10 shadow-sm border border-gray-100 transition duration-150 active:scale-90 cursor-pointer"
          title={isInWishlist ? "Saved to items" : "Save item"}
          aria-label="Save to Saved Items"
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-colors ${
              isInWishlist ? 'fill-[#7c3aed] text-[#7c3aed]' : 'text-[#7c3aed]'
            }`} 
          />
        </button>
      </div>

      {/* Details Container */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Clickable Info Area */}
        <div className="cursor-pointer mb-2" onClick={() => onClick(product)}>
          {/* Official Store / Verified Mall Badge */}
          <div className="flex flex-wrap gap-1 items-center mb-1">
            {isOfficialStore ? (
              <span className="inline-block bg-[#183a8f] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded max-w-max">
                Official Store
              </span>
            ) : (
              <span className="inline-block bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded max-w-max">
                Verified Mall
              </span>
            )}
            {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
              <span className="inline-block bg-red-100 text-red-600 border border-red-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                Low Stock
              </span>
            )}
          </div>

          {/* Product Name (capped to 2 lines for precise cellular symmetry) */}
          <h3 className="text-gray-800 text-[11px] sm:text-xs font-normal leading-snug tracking-tight mb-1 line-clamp-2 h-8 group-hover:text-[#7c3aed] transition-colors">
            {product.name}
          </h3>

          {/* Pricing Details */}
          <div className="flex flex-wrap items-baseline gap-1 my-0.5">
            <span className="text-sm sm:text-base font-black text-slate-900 font-sans tracking-tight">
              {formatNaira(product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-normal">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stars Ratings */}
          <div className="flex items-center gap-1 my-0.5">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-bold">({product.reviewsCount})</span>
          </div>

          {/* Quxba Express delivery branding label */}
          <div className="flex items-center gap-0.5 mt-1 font-sans text-[9px] select-none">
            <span className="text-slate-800 font-black tracking-tighter">QUXBA</span>
            <span className="text-[#7c3aed] font-extrabold italic flex items-center gap-0.5">
              ⚡ EXPRESS
            </span>
          </div>
        </div>

        {/* Actions Button Bar */}
        <div className="flex gap-1.5 mt-auto items-center">
          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 p-2 rounded text-xs font-bold transition-all duration-150 flex items-center justify-center hover:shadow-xs active:scale-[0.98] cursor-pointer"
            title="Quick View Product"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2 rounded text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 hover:shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span>Add to cart</span>
          </button>

          {/* Share Button with hovering dropdown menu */}
          <div className="relative group/share">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.origin + '#product-' + product.id
                  }).catch(() => {});
                }
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-2 rounded text-xs font-bold transition-all duration-150 flex items-center justify-center hover:shadow-xs active:scale-[0.98] cursor-pointer"
              title="Share Product"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {/* Share dropdown triggered by hover */}
            <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 hidden group-hover/share:flex flex-col gap-1.5 z-30 min-w-[130px] text-[10px] scale-95 origin-bottom-right transition-all">
              <span className="text-[8px] text-gray-400 font-extrabold uppercase px-1 pb-1 border-b border-gray-100 block">Share on:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out ' + product.name + ' on Quxba: ' + window.location.origin + '#product-' + product.id)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 p-1 hover:bg-emerald-50 rounded text-emerald-700 transition font-bold"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ' + product.name + ' on QuxbaExpress Anniversary Sale! ' + window.location.origin + '#product-' + product.id)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 p-1 hover:bg-blue-50 rounded text-blue-500 transition font-bold"
              >
                <span>Twitter / X</span>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(window.location.origin + '#product-' + product.id);
                  alert('Product link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 p-1 hover:bg-neutral-100 rounded text-neutral-700 transition font-bold w-full text-left cursor-pointer"
              >
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
