import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (p: Product) => void;
  onMoveToCart: (p: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  const formatNaira = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Background shadow */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-slide-in">
        
        {/* Title elements */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Your Wishlist ({wishlist.length})</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-gray-100">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="bg-red-50 text-red-400 p-5 rounded-full mb-4">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Your wishlist is empty!</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">Save products you love during Quxba anniversary specials here to buy them later.</p>
              <button 
                onClick={onClose}
                className="mt-6 bg-[#7c3aed] text-white px-5 py-2.5 rounded-md font-bold text-xs hover:bg-[#6d28d9] transition"
              >
                DISCOVER PRODUCTS
              </button>
            </div>
          ) : (
            wishlist.map((product) => (
              <div key={product.id} className="py-4 flex gap-4">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-16 h-16 object-contain rounded border border-gray-100 bg-gray-50 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs md:text-sm font-semibold text-gray-800 truncate">{product.name}</h4>
                  <p className="text-xs text-purple-600 font-bold mt-0.5">{product.sellerName}</p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-[#7c3aed]">{formatNaira(product.price)}</span>
                    {product.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">{formatNaira(product.originalPrice)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 mt-3">
                    <button 
                      onClick={() => onMoveToCart(product)}
                      className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-1.5 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>MOVE TO CART</span>
                    </button>
                    
                    <button 
                      onClick={() => onRemoveFromWishlist(product)}
                      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition"
                      aria-label="Remove saved item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
