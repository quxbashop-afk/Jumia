import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Search, ShoppingCart, Heart, User, ChevronDown, Package, Smartphone, Percent, Settings, ShieldAlert, BadgeHelp, ClipboardList } from 'lucide-react';
import { CartItem, Product, UserAccount } from '../types';
import quxbaLogo from '../assets/images/quxba_logo_1780098066924.png';

interface HeaderProps {
  cart: CartItem[];
  wishlist: Product[];
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onToggleView: (view: 'storefront' | 'seller' | 'admin' | 'orders' | 'support') => void;
  currentView: string;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export default function Header({
  cart,
  wishlist,
  onSearch,
  onSelectCategory,
  selectedCategory,
  onOpenCart,
  onOpenWishlist,
  onToggleView,
  currentView,
  allProducts,
  onSelectProduct,
  currentUser,
  onLogout,
  onOpenAuthModal
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mobileSuggestionsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Filter products for dynamic search suggestions using a comprehensive search suggestion algorithm
  const getSuggestions = (): Product[] => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const matches = allProducts.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const categoryLower = p.category.toLowerCase();
      const brandLower = p.brand ? p.brand.toLowerCase() : '';

      // Direct exact match
      if (nameLower === query) score += 100;
      if (brandLower === query) score += 90;
      if (categoryLower === query) score += 80;

      // Prefix matches
      if (nameLower.startsWith(query)) score += 50;
      else if (nameLower.includes(query)) score += 30;

      if (brandLower) {
        if (brandLower.startsWith(query)) score += 40;
        else if (brandLower.includes(query)) score += 20;
      }

      if (categoryLower.startsWith(query)) score += 35;
      else if (categoryLower.includes(query)) score += 15;

      // Category tags match (splitting category by space, ampersand, etc.)
      const catTags = p.category
        .split(/[\s&,/\\-]+/)
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 2); // only count meaningful tags

      for (const tag of catTags) {
        if (tag === query) {
          score += 25;
        } else if (tag.startsWith(query)) {
          score += 15;
        }
      }

      // Brand tag matching (splitting brand words)
      if (p.brand) {
        const brandTags = p.brand
          .split(/[\s&,/\\-]+/)
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);
        for (const tag of brandTags) {
          if (tag === query) score += 20;
          else if (tag.startsWith(query)) score += 10;
        }
      }

      return { product: p, score };
    });

    // Filter out zero scores, sort by score descending, and slice to 6 items
    return matches
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(m => m.product);
  };

  const suggestions = getSuggestions();

  // Reset active index when search query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedOutsideDesktop = !suggestionsRef.current || !suggestionsRef.current.contains(event.target as Node);
      const clickedOutsideMobile = !mobileSuggestionsRef.current || !mobileSuggestionsRef.current.contains(event.target as Node);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
    onToggleView('storefront');
  };

  const handleSuggestionClick = (p: Product) => {
    setSearchQuery(p.name);
    setShowSuggestions(false);
    onSelectProduct(p);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm" id="quxba-header">
      {/* Call to Order/Promotional Banner */}
      <div className="bg-[#7c3aed] text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide flex justify-center items-center overflow-hidden">
        <div>
          CALL TO ORDER: 01 888 1106 | FREE DELIVERY ON QUXBA EXPRESS ITEMS OVER ₦15,000
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo Section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
          <div 
            onClick={() => { onToggleView('storefront'); onSelectCategory('All Categories'); setSearchQuery(''); }}
            className="cursor-pointer flex-shrink-0 flex items-center gap-2"
          >
            <img 
              src={quxbaLogo} 
              alt="Quxba Logo" 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Mobile Search Engine Form (Visible ONLY on mobile, placed between Logo and Wishlist/Cart) */}
          <div className="relative flex-1 md:hidden max-w-[200px] xs:max-w-xs sm:max-w-md mx-1 sm:mx-2" ref={mobileSuggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  aria-label="Search on Quxba"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-7 pr-10 py-1.5 border border-gray-300 rounded text-xs text-gray-900 outline-none transition focus:border-[#7c3aed]"
                />
                <Search className="absolute left-2 top-2 w-[14px] h-[14px] text-gray-400" />
              </div>
              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-2.5 rounded-r font-bold text-xs shadow-inner transition duration-150"
              >
                Go
              </button>
            </form>

            {/* Mobile Search dynamic suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white mt-1.5 border border-gray-200 rounded shadow-xl z-50 overflow-hidden divide-y divide-gray-100 min-w-[200px]">
                {suggestions.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => handleSuggestionClick(p)}
                    className="px-2.5 py-2 cursor-pointer flex items-center gap-2 hover:bg-purple-50 transition"
                  >
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-7 h-7 object-contain rounded border border-gray-100 bg-gray-50 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        ₦{p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats or Applet State info on small screens if helpful, but keep margin clutter clean */}
          <div className="flex items-center md:hidden gap-1.5 sm:gap-3 flex-shrink-0">
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 text-gray-700 hover:text-[#7c3aed]"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7c3aed] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-gray-700 hover:text-[#7c3aed]"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Engine Form */}
        <div className="hidden md:block relative w-full md:max-w-2xl flex-1" ref={suggestionsRef}>
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search on Quxba"
                value={searchQuery}
                aria-label="Search on Quxba"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (suggestions.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % suggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === 'Enter') {
                    if (activeIndex >= 0 && activeIndex < suggestions.length) {
                      e.preventDefault();
                      handleSuggestionClick(suggestions[activeIndex]);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    e.currentTarget.blur();
                  }
                }}
                className="w-full pl-10 pr-24 py-2 border-2 border-gray-300 rounded text-sm text-gray-900 outline-none transition focus:border-[#7c3aed]"
              />
              <Search className="absolute left-3 top-2.5 w-[18px] h-[18px] text-gray-400" />
            </div>
            <button 
              type="submit" 
              className="absolute right-0 top-0 h-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 rounded-r font-bold text-sm shadow-inner transition duration-150"
            >
              SEARCH
            </button>
          </form>

          {/* Search dynamic suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white mt-1.5 border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-gray-100">
              {suggestions.map((p, index) => (
                <div 
                  key={p.id}
                  onClick={() => handleSuggestionClick(p)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition ${
                    activeIndex === index 
                      ? 'bg-purple-50 border-l-4 border-[#7c3aed]' 
                      : 'hover:bg-purple-50'
                  }`}
                >
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    className="w-10 h-10 object-contain rounded border border-gray-100 bg-gray-50 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.brand && <span className="font-semibold text-indigo-600 mr-1.5">[{p.brand}]</span>}
                      {p.category} · <span className="text-[#7c3aed] font-bold">₦{p.price.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Account Submenu */}
          <div className="relative" ref={accountRef}>
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-gray-100 transition font-medium text-sm text-gray-700 ${showAccountMenu ? 'bg-purple-50 text-[#7c3aed]' : ''}`}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>{currentUser ? currentUser.name || currentUser.email : 'Account'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showAccountMenu ? 'rotate-180 text-[#7c3aed]' : ''}`} />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-gray-100 font-sans">
                {currentUser ? (
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 font-sans">
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Welcome to Quxba</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">{currentUser.email}</p>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => { onToggleView('orders'); setShowAccountMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] flex items-center gap-2.5 transition"
                      >
                        <ClipboardList className="w-4 h-4 text-gray-500" />
                        <span>My Account & Orders</span>
                      </button>
                      <button 
                        onClick={() => { onOpenWishlist(); setShowAccountMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] flex items-center gap-2.5 transition"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span>Saved Items (Wishlist)</span>
                      </button>
                      {currentUser.email === 'quxbashop@gmail.com' && (
                        <button 
                          onClick={() => { onToggleView('support'); setShowAccountMenu(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] flex items-center gap-2.5 transition"
                        >
                          <BadgeHelp className="w-4 h-4 text-gray-500" />
                          <span>Live Chat Support</span>
                        </button>
                      )}
                    </div>

                    {currentUser.email === 'quxbashop@gmail.com' && (
                      <div className="py-1 bg-gray-50">
                        <button 
                          onClick={() => { onToggleView('seller'); setShowAccountMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2.5 transition ${currentView === 'seller' ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Seller Dashboard</span>
                        </button>
                        <button 
                          onClick={() => { onToggleView('admin'); setShowAccountMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2.5 transition ${currentView === 'admin' ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <button 
                        onClick={() => { onLogout(); setShowAccountMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-bold transition duration-150"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 flex flex-col items-center">
                      <p className="text-xs text-purple-600 font-bold uppercase tracking-wider text-center font-sans">Welcome to Quxba</p>
                      <button
                        onClick={() => { onOpenAuthModal(); setShowAccountMenu(false); }}
                        className="mt-2 w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black py-2 px-4 rounded text-center transition cursor-pointer font-sans"
                      >
                        SIGN IN / SIGN UP
                      </button>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => { onOpenAuthModal(); setShowAccountMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] flex items-center gap-2.5 transition"
                      >
                        <ClipboardList className="w-4 h-4 text-gray-500" />
                        <span>My Account & Orders</span>
                      </button>
                      <button 
                        onClick={() => { onOpenWishlist(); setShowAccountMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] flex items-center gap-2.5 transition"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span>Saved Items (Wishlist)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Saved Items */}
          <button 
            onClick={onOpenWishlist}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-gray-100 transition font-medium text-sm text-gray-700 relative`}
          >
            <Heart className="w-5 h-5 text-gray-600" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#7c3aed] text-white text-[10px] px-1.5 rounded-full font-bold">
                {wishlist.length}
              </span>
            )}
          </button>



          {/* Cart Drawer Button */}
          <button 
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2 rounded font-bold text-sm shadow transition duration-250 cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            <span className="bg-white text-[#7c3aed] rounded-full text-xs w-4 h-4 flex items-center justify-center font-bold">
              {totalCartCount}
            </span>
          </button>

        </div>
      </div>

      {/* Top Categories Strip */}
      <div className="border-t border-gray-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 overflow-x-auto whitespace-nowrap hidden md:flex items-center gap-4 scrollbar-none text-sm font-medium">
          <span className="text-gray-400 mr-2 flex items-center gap-1.5"><Percent className="w-4 h-4 text-purple-500" /> Quick Categories:</span>
          {[
            'All Categories',
            'Electronics & Appliances',
            'Phones & Tablets',
            'Computers & Accessories',
            'Fashion & Apparel',
            'Supermarket & Groceries',
            'Health & Beauty'
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => { onSelectCategory(cat); onToggleView('storefront'); }}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm tracking-wide transition duration-150 ${
                selectedCategory === cat && currentView === 'storefront'
                  ? 'bg-purple-100 text-[#7c3aed] font-bold border border-purple-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
