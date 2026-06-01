import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, Heart, Star, Check, ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product, selectedOptions?: Record<string, string>) => void;
  onToggleWishlist: (p: Product) => void;
  isInWishlist: boolean;
  onViewFullDetails: (p: Product) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onViewFullDetails
}: QuickViewModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      if (product.options && product.options.length > 0) {
        const defaults: Record<string, string> = {};
        product.options.forEach((opt) => {
          if (opt.values && opt.values.length > 0) {
            defaults[opt.name] = opt.values[0];
          }
        });
        setSelectedOptions(defaults);
      } else {
        setSelectedOptions({});
      }
    }
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    return product.variants.find((v) => {
      const o1 = v.options || {};
      const o2 = selectedOptions || {};
      return Object.keys(o1).every((k) => o1[k] === o2[k]) &&
             Object.keys(o2).every((k) => o1[k] === o2[k]);
    });
  }, [product, selectedOptions]);

  if (!isOpen || !product) return null;

  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const displayStock = currentVariant ? currentVariant.stock : product.stock;

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-NG');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col font-sans border border-neutral-100">
        
        {/* Header Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black p-1.5 rounded-full z-20 border border-gray-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 p-5 md:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Image Preview Area */}
            <div className="aspect-square w-full bg-neutral-50 rounded-lg p-4 flex items-center justify-center relative border border-neutral-100 overflow-hidden group">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-102"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
                }}
              />
              {/* Floating Quick Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {product.discount > 0 && (
                  <span className="bg-[#7c3aed] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
                {product.category.toLowerCase().includes('electronic') && (
                  <span className="bg-[#183a8f] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    Official Store
                  </span>
                )}
              </div>
            </div>

            {/* Core Details Panel */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{product.category}</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mt-0.5">{product.name}</h2>
                
                {/* Product rating stars */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-bold">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-150 flex flex-col justify-center">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl font-black text-[#7c3aed]">
                    {formatNaira(displayPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-1">
                  <span>In Stock: {displayStock > 0 ? `${displayStock} units` : 'Out of Stock'}</span>
                  {currentVariant?.sku && <span className="font-mono text-purple-600">{currentVariant.sku}</span>}
                </div>
              </div>

              {/* Options Selectors block */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-3 pt-1 border-t border-neutral-100">
                  {product.options.map((opt) => (
                    <div key={opt.name} className="space-y-1">
                      <span className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                        Choose {opt.name}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.values.map((v) => {
                          const isSelected = selectedOptions[opt.name] === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: v }))}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider transition border cursor-pointer ${
                                isSelected
                                  ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-xs'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Short truncated description */}
              <div className="border-t border-neutral-100 pt-3">
                <span className="block text-[10px] font-black text-neutral-500 uppercase tracking-wider mb-1">Details:</span>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {product.description || 'This premium, certified product listing is curated specifically for Quxba buyers.'}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, selectedOptions);
                    onClose();
                  }}
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2.5 px-4 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 hover:shadow-md active:scale-98 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add To Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onToggleWishlist(product);
                  }}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 py-2.5 px-3 rounded text-xs transition flex items-center justify-center active:scale-98 cursor-pointer"
                  title={isInWishlist ? "Saved" : "Save Item"}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onViewFullDetails(product);
                  onClose();
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 px-4 rounded text-xs transition uppercase flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>View Full Product Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
