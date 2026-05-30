import React, { useState } from 'react';
import { 
  Building2, Percent, TrendingUp, Users, ShoppingBag, Plus, Trash2, Check, X, ShieldAlert, BadgeAlert,
  Send, RefreshCw, BarChart3, CheckSquare, Coins, HelpCircle, PackageOpen, ArrowRight, UserCheck, Star,
  ChevronRight
} from 'lucide-react';
import { Product, Order, SupportMessage, CartItem } from '../types';

/* ==========================================================================
   1. SELLER ZONE DASHBOARD
   ========================================================================== */
interface SellerDashboardProps {
  products: Product[];
  onAddNewProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

// Custom CSS High-Fidelity Varsity Jersey Renderer for Chicago 32
export function ChicagoVarsityJerseyDraw({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const isSm = size === "sm";
  return (
    <div className={`bg-[#f3f4f6] rounded flex flex-col items-center justify-center border border-gray-200 select-none overflow-hidden relative ${isSm ? 'w-10 h-10 p-0.5' : 'w-full aspect-square p-4 h-full'}`}>
      {/* Background athletic pattern ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#222]" />
      
      {/* Upper Jersey Tee body */}
      <div className={`relative flex flex-col items-center justify-start bg-white border border-gray-100 rounded-t-lg shadow-sm ${isSm ? 'w-5.5 h-6 p-0.5' : 'w-24 h-24 p-2'}`}>
        {/* Sleeve cut extensions */}
        <div className="absolute -left-1.5 top-1 w-2 h-4 bg-[#111] rounded-l-xs" />
        <div className="absolute -right-1.5 top-1 w-2 h-4 bg-[#111] rounded-r-xs" />
        
        {/* Varsity text */}
        <span className={`font-black tracking-tight text-[#111] text-center uppercase block leading-none ${isSm ? 'text-[4px] mt-0.5' : 'text-[9.5px] mt-1'}`}>
          CHICAGO
        </span>
        {/* Varsity Number */}
        <span className={`font-black text-[#7c3aed] text-center block leading-none ${isSm ? 'text-[7px] mt-0.5' : 'text-[20px] mt-1'}`}>
          32
        </span>
        
        {/* Sleeve accent striping */}
        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-amber-400" />
      </div>

      {/* Matching Shorts */}
      <div className={`relative flex justify-around items-center bg-[#111] border border-[#222] rounded-b-md shadow-sm ${isSm ? 'w-5.5 h-3 mt-0.5 p-0.5' : 'w-24 h-14 mt-1.5 p-1'}`}>
        <span className={`font-black text-white ${isSm ? 'text-[4px]' : 'text-[9px]'}`}>32</span>
        <div className="w-0.5 h-full bg-white/20" />
        <span className={`font-mono text-white/40 ${isSm ? 'text-[3px]' : 'text-[7px]'}`}>CHIC</span>
      </div>
    </div>
  );
}

export function SellerDashboard({ products, onAddNewProduct, onDeleteProduct }: SellerDashboardProps) {
  const [vendorName, setVendorName] = useState('Supreme Appliances Ltd');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fashion & Apparel');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('chicago-32-jersey');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Ad-ons, featured, related states matching both mockups
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);
  const [showRelatedModal, setShowRelatedModal] = useState(false);
  
  // AI Copilot widgets state from Screenshot 1
  const [isCopilotMinimized, setIsCopilotMinimized] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Gallery of 5 images state
  const [uploadedImages, setUploadedImages] = useState<(string | null)[]>([
    'chicago-32-jersey',
    null,
    null,
    null,
    null
  ]);
  const [activeImageSlot, setActiveImageSlot] = useState<number | null>(null);

  const myProducts = products.filter(p => p.sellerId === 'vendor-self' || p.sellerName === vendorName);
  const totalSales = 1240000;
  const pendingApproval = products.filter(p => !p.isApproved && (p.sellerId === 'vendor-self' || p.sellerName === vendorName)).length;

  const triggerAiGenerate = () => {
    setIsAiGenerating(true);
    setFormSuccess('');
    setFormError('');
    setTimeout(() => {
      setNewProdName('Chicago 32 Varsity Hooded Tee & Shorts Athletic Co-ord Set');
      setNewProdCategory('Fashion & Apparel');
      setNewProdPrice('14500');
      setNewProdOldPrice('18900');
      setNewProdDesc('Stay comfortable and active with this trendy Chicago 32 varsity athletic matching set. Includes a lightweight breathable hoodie t-shirt and elastic-waist running shorts. Perfect for sports, streetwear, or casual lounging. Fabric is premium soft cotton-polyester blend with durable print quality.');
      const primaryImg = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80';
      setNewProdImageUrl(primaryImg);
      setUploadedImages([
        primaryImg,
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
        null,
        null
      ]);
      setIsFeatured(true);
      
      // Auto-attach appropriate add-on
      setSelectedAddons(['co-ord-socks']);
      
      setIsAiGenerating(false);
      setFormSuccess('Google Gemini AI successfully processed the apparel image! Pre-populated details generated.');
      setTimeout(() => setFormSuccess(''), 6000);
    }, 1800);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdImageUrl) {
      setFormError('Name, price and direct image URL are highly recommended!');
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Kindly input a valid numeric selling price.');
      return;
    }

    // Assign Unsplash photo if it is Chicago jersey mockup
    const finalImageUrl = newProdImageUrl === 'chicago-32-jersey' 
      ? 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'
      : newProdImageUrl;

    const validImages = Array.from(new Set([
      finalImageUrl,
      ...uploadedImages
        .map(img => img === 'chicago-32-jersey' ? 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=440&q=80' : img)
        .filter((img): img is string => !!img)
    ])).slice(0, 5);

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      name: newProdName,
      category: newProdCategory,
      price: priceNum,
      originalPrice: newProdOldPrice ? parseFloat(newProdOldPrice) : priceNum * 1.25,
      discount: newProdOldPrice ? Math.round(((parseFloat(newProdOldPrice) - priceNum) / parseFloat(newProdOldPrice)) * 100) : 20,
      imageUrl: finalImageUrl,
      imageUrls: validImages,
      rating: 5.0,
      reviewsCount: 0,
      description: newProdDesc || 'Brand new premium verified product listed by authorized merchant.',
      stock: 30,
      sellerId: 'vendor-self',
      sellerName: vendorName,
      isApproved: false, // Must be approved by Admin view!
      brand: newProdName.trim().split(/\s+/)[0] || 'Generic',
      createdAt: Date.now(),
      specifications: { 
        'Origin': 'Authentic Import', 
        'Vendor Guarantee': '1 Year limited',
        'Addons Included': selectedAddons.length > 0 ? selectedAddons.map(a => a.replace('-', ' ')).join(', ') : 'None',
        'Featured': isFeatured ? 'Yes' : 'No'
      }
    };

    onAddNewProduct(newProduct);
    setFormSuccess('Product submitted successfully! It is currently pending approval by the Admin department.');
    setFormError('');
    
    // reset form fields
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOldPrice('');
    setNewProdImageUrl('chicago-32-jersey');
    setUploadedImages(['chicago-32-jersey', null, null, null, null]);
    setNewProdDesc('');
    setIsFeatured(false);
    setSelectedAddons([]);
    setSelectedRelated([]);
    
    setTimeout(() => setFormSuccess(''), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Vendor Hub Info Header */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-500 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Quxba Verified Merchant</span>
            <h2 className="text-2xl font-extrabold uppercase mt-1">{vendorName} Hub</h2>
            <p className="text-xs text-emerald-100 mt-1">Manage stock inventory, review incoming payouts, and audit listings instantly.</p>
          </div>
          <div className="flex gap-2.5">
            <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm min-w-[100px]">
              <p className="text-[10px] text-emerald-200 font-bold uppercase">WALLET VALUE</p>
              <p className="text-sm font-black">₦1,450,000</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm min-w-[100px]">
              <p className="text-[10px] text-emerald-200 font-bold uppercase">STORE RATING</p>
              <p className="text-sm font-black text-yellow-300">4.9 ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Gross Product Sales</p>
            <p className="text-xl font-extrabold text-[#7c3aed] mt-1">₦{totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-full text-[#7c3aed]"><TrendingUp className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Active Catalog</p>
            <p className="text-xl font-extrabold text-gray-880 mt-1">{myProducts.filter(p => p.isApproved).length}</p>
          </div>
          <div className="bg-green-50 p-2.5 rounded-full text-green-600"><ShoppingBag className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Awaiting admin review</p>
            <p className="text-xl font-extrabold text-blue-600 mt-1">{pendingApproval}</p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-full text-blue-600"><Building2 className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Merchant Level</p>
            <p className="text-xl font-extrabold text-purple-600 mt-1">Diamond 💎</p>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-full text-purple-600"><Check className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Main double column container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Add product Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-gray-855 uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <Plus className="w-4 h-4 text-[#7c3aed]" />
              <span>Host New Product to Quxba</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Created item enters the Admin panel for validation check prior to customer exposure.</p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            
            {/* Title & Category Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="Nexus Split AC, Haier Thermocool, etc."
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                >
                  <option>Fashion & Apparel</option>
                  <option>Electronics & Appliances</option>
                  <option>Phones & Tablets</option>
                  <option>Computers & Accessories</option>
                  <option>Supermarket & Groceries</option>
                  <option>Health & Beauty</option>
                </select>
              </div>
            </div>

            {/* Custom Images Panel from Screenshot 1 */}
            <div className="space-y-2.5 border-t border-gray-100 pt-4">
              <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">Images</span>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Image Container Card */}
                <div className="md:col-span-7 border border-gray-200 rounded-lg p-3.5 space-y-3.5 bg-white shadow-xs">
                            {/* Photo list of uploaded images - Up to 5 slots strictly matching user request */}
                  <div className="grid grid-cols-5 gap-2 w-full">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const imgUrl = uploadedImages[index];
                      return (
                        <div key={index} className="relative group aspect-square rounded border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden" style={{ minWidth: "55px", minHeight: "55px" }}>
                          {imgUrl ? (
                            <>
                              {imgUrl === 'chicago-32-jersey' ? (
                                <ChicagoVarsityJerseyDraw size="sm" />
                              ) : (
                                <img 
                                  src={imgUrl} 
                                  alt={`Pic ${index + 1}`} 
                                  className="max-h-[85%] max-w-[85%] object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              
                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition duration-155 flex flex-col items-center justify-center gap-1 z-10">
                                <button
                                  type="button"
                                  onClick={() => setActiveImageSlot(index)}
                                  className="px-1.5 py-0.5 bg-white text-gray-800 text-[8px] font-extrabold rounded shadow-xs hover:bg-[#7c3aed] hover:text-white transition cursor-pointer"
                                >
                                  EDIT
                                </button>
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = [...uploadedImages];
                                      newImages[index] = null;
                                      setUploadedImages(newImages);
                                    }}
                                    className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-extrabold rounded shadow-xs hover:bg-red-700 transition cursor-pointer"
                                  >
                                    DEL
                                  </button>
                                )}
                              </div>
                              <span className="absolute bottom-0.5 right-0.5 bg-black/55 text-white text-[7px] px-1 py-0.2 rounded font-black tracking-widest uppercase scale-90">
                                Pic {index + 1}
                              </span>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveImageSlot(index)}
                              className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-purple-50/20 text-gray-400 hover:text-[#7c3aed] transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span className="text-[7px] font-black uppercase text-center scale-90">Add Pic {index + 1}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Featured Indicator Row Strip strictly aligned with UI */}
                  <div className="border-t border-gray-150/60 pt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {newProdImageUrl === 'chicago-32-jersey' ? (
                          <ChicagoVarsityJerseyDraw size="sm" />
                        ) : (
                          <img src={newProdImageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'} alt="" className="max-h-[90%] max-w-[90%] object-contain" />
                        )}
                      </div>
                      <span className="text-[11.5px] font-black text-slate-700">Primary Active (Pic 1)</span>
                    </div>

                    {/* Option dots */}
                    <button 
                      type="button" 
                      onClick={() => setActiveImageSlot(0)}
                      className="text-[#7c3aed] hover:text-purple-600 font-extrabold hover:bg-purple-50 px-2 py-1 rounded cursor-pointer text-[10px] uppercase transition"
                      title="Configure image options"
                    >
                      Change Primary
                    </button>
                  </div>

                  {/* Add at least three photos blue banner prompt with a blue Star / Sparkle icon */}
                  <div className="flex items-start gap-1.5 text-[10.5px] text-[#0066cc] font-semibold pt-2 border-t border-gray-100">
                    <span className="text-[#0066cc] text-[13px] leading-none">✨</span>
                    <span className="leading-snug">Add at least three photos to show off your product. Include a front, back, and detail shot.</span>
                  </div>

                </div>

                {/* Gemini AI Copilot Helper Block (Screenshot 1 Right) */}
                {!isCopilotMinimized ? (
                  <div className="md:col-span-5 bg-gradient-to-br from-[#e0f2fe] via-[#f0fdf4] to-slate-50 border border-blue-100 rounded-xl p-3.5 shadow-xs flex flex-col justify-between relative min-h-[140px]">
                    {/* Header bar and minimize icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 items-center">
                        {/* 4 dots AI Icon matching layout */}
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        </div>
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={() => setIsCopilotMinimized(true)}
                        className="text-gray-400 hover:text-slate-700 hover:bg-gray-100 p-0.5 rounded text-[10px]"
                        title="Hide panel"
                      >
                        —
                      </button>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-600 font-semibold mt-1">
                      Want to generate product details automatically based on this image?
                    </p>

                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={triggerAiGenerate}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-gray-200 py-1.5 rounded-lg text-xs font-extrabold shadow-xs transition hover:scale-101 active:scale-99 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 mt-2"
                    >
                      {isAiGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                          <span>Analyzing photo...</span>
                        </>
                      ) : (
                        <span>Generate</span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="md:col-span-5 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
                    <button 
                      type="button" 
                      onClick={() => setIsCopilotMinimized(false)}
                      className="text-[10px] text-blue-600 font-extrabold hover:underline"
                    >
                      💡 Use AI Copilot Auto-Fill
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Sale Price (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 14500"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Regular Price (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 18900"
                  value={newProdOldPrice}
                  onChange={(e) => setNewProdOldPrice(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-400"
                />
              </div>
            </div>

            {/* Image link text accessor for backup override */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Mock Image Link Override</label>
              <input
                type="text"
                placeholder="Product Image URL"
                value={newProdImageUrl}
                onChange={(e) => setNewProdImageUrl(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-[11px] focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-600 font-mono"
              />
            </div>

            {/* Description Text area */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Specifications & Description</label>
              <textarea
                rows={3}
                placeholder="Product advantages... include detail features here"
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-800"
              />
            </div>

            {/* Custom Interactive Settings Section from Screenshot 2 */}
            <div className="border-t border-gray-100 pt-4 space-y-3.5">
              
              {/* Product Add-ons Toggle Row */}
              <div className="space-y-0.5 flex justify-between items-start">
                <div className="space-y-0.5 flex-1 pr-4">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">Product Add-ons</span>
                  <p className="text-[10.5px] text-gray-400 font-normal leading-normal whitespace-pre-line">
                    Upsell customers with product add-ons directly on the product page.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowAddonModal(!showAddonModal)}
                  className="text-xs font-black tracking-wider text-[#7c3aed] hover:text-[#6d28d9] bg-purple-50/70 p-1 px-3 rounded uppercase border border-purple-100/40 cursor-pointer"
                >
                  {selectedAddons.length > 0 ? `ADD (${selectedAddons.length})` : 'ADD'}
                </button>
              </div>

              {/* Add-ons Configuration Menu */}
              {showAddonModal && (
                <div className="bg-purple-50/20 border border-purple-100 rounded-lg p-2.5 space-y-2 mt-1 animate-fade-in">
                  <span className="block text-[10px] font-black text-purple-850 uppercase tracking-wider">Configure upsell bundles</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'co-ord-socks', label: 'Chicago Varsity Crew Socks Set', price: '+ ₦1,800' },
                      { id: 'care-wrap', label: 'Premium Birthday Care Wrap', price: '+ ₦1,500' },
                      { id: 'priority-dispatch', label: 'VIP Priority Courier Route', price: '+ ₦2,500' },
                      { id: 'warranty-extra', label: 'Quxba Extra Care Shield', price: '+ ₦4,000' }
                    ].map((add) => {
                      const isSel = selectedAddons.includes(add.id);
                      return (
                        <button
                          key={add.id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setSelectedAddons(prev => prev.filter(i => i !== add.id));
                            } else {
                              setSelectedAddons(prev => [...prev, add.id]);
                            }
                          }}
                          className={`p-2 rounded border text-left flex flex-col justify-between transition-all ${
                            isSel ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-xs' : 'bg-white border-gray-150 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-[10px] font-black leading-tight block">{add.label}</span>
                          <span className="text-[9.5px] text-[#7c3aed] font-bold block mt-1">{add.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="border-gray-100/50" />

              {/* Featured Product Switch Block */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1 pr-6">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">Featured Product</span>
                  <p className="text-[10.5px] text-gray-400 font-normal leading-normal">
                    Featured Products can be displayed in Summary Blocks on your page.
                  </p>
                </div>
                
                {/* Switch Toggle matching mockup exactly */}
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-250 flex-shrink-0 ${
                    isFeatured ? 'bg-[#7c3aed]' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle featured listing status"
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform duration-250 ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <hr className="border-gray-100/50" />

              {/* Related Products Settings block */}
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded transition"
                onClick={() => setShowRelatedModal(!showRelatedModal)}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">Related Products</span>
                  <span className="text-[10.5px] text-gray-400 font-normal leading-normal block">
                    Showcase similar items on your Product Pages.
                  </span>
                </div>
                {/* Chevron Right indicator matches mockup */}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Related products selector dropdown */}
              {showRelatedModal && (
                <div className="bg-gray-50 border border-gray-250 rounded-lg p-2.5 mt-1 space-y-1.5 animate-fade-in">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Link relevant items</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {products.filter(pr => pr.id !== 'custom-generating').slice(0, 4).map((pr) => {
                      const isSel = selectedRelated.includes(pr.id);
                      return (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setSelectedRelated(prev => prev.filter(i => i !== pr.id));
                            } else {
                              setSelectedRelated(prev => [...prev, pr.id]);
                            }
                          }}
                          className={`w-full p-2 rounded text-left text-[11px] flex items-center justify-between border ${
                            isSel ? 'bg-purple-50 border-purple-200 text-[#7c3aed] font-bold' : 'bg-white border-gray-150'
                          }`}
                        >
                          <span className="truncate">{pr.name}</span>
                          <span className="text-gray-400 text-[10px]">₦{pr.price.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="border-gray-100/50" />

              {/* Product Reviews setting strip */}
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 -mx-1.5 rounded transition"
                onClick={() => {
                  alert("Product reviews automation rules are administered centrally. System checks reviews for spam keywords.");
                }}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">Product Reviews</span>
                  <span className="text-[10.5px] text-gray-400 font-normal leading-normal block">
                    Show customer reviews directly on all product pages. Manage this feature in Selling.
                  </span>
                </div>
                {/* Diagonal Arrow Icon matches mockup 2 exactly */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-400 flex-shrink-0">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>

            </div>

            {/* Quick Merchant Tip Helper */}
            <div className="bg-purple-50/70 p-3 rounded text-[11px] text-purple-900 space-y-1.5 font-medium border border-purple-100/80">
              <span className="font-extrabold uppercase tracking-wider block text-[10px]">💡 PRE-LOADED SYSTEM TEMPLATES</span>
              <p>Quickly select a verified template to showcase different categories:</p>
              <div className="space-y-1 font-mono text-[9px] break-all bg-white/70 p-2 rounded border border-purple-100/50">
                <button 
                  type="button"
                  onClick={() => {
                    setNewProdName('Premium Double Door Refrigerator with Inverter');
                    setNewProdCategory('Electronics & Appliances');
                    setNewProdPrice('220000');
                    setNewProdOldPrice('295050');
                    setNewProdImageUrl('/src/assets/images/refrigerator_product_1779974264736.png');
                    setNewProdDesc('Nexus 250L capacity eco inverter smart food-fresher refrigerator with supreme freezer layout.');
                  }}
                  className="block text-left hover:underline text-[#7c3aed] font-black"
                >
                  📋 Template: Refrigerator Appliances Set
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewProdName('Superchill Turbo 1.5HP Split Air Conditioner');
                    setNewProdCategory('Electronics & Appliances');
                    setNewProdPrice('180000');
                    setNewProdOldPrice('240000');
                    setNewProdImageUrl('/src/assets/images/air_conditioner_product_1779974283856.png');
                    setNewProdDesc('Rapid intelligent cooling split AC with active air filtration systems and whisper quiet bedroom performance.');
                  }}
                  className="block text-left hover:underline text-[#7c3aed] font-black mt-1"
                >
                  📋 Template: Air Conditioner Set
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewProdImageUrl('chicago-32-jersey');
                    setNewProdName('');
                    setNewProdCategory('Fashion & Apparel');
                    setUploadedImages(['chicago-32-jersey']);
                  }}
                  className="block text-left hover:underline text-[#7c3aed] font-black mt-1"
                >
                  📋 Template: Custom Chicago Varsity Dress
                </button>
              </div>
            </div>

            {formError && <p className="text-red-500 font-bold text-xs">{formError}</p>}
            {formSuccess && <p className="text-green-600 font-bold text-xs">{formSuccess}</p>}

            <button
              type="submit"
              className="w-full bg-[#7c3aed] hover:bg-purple-600 text-white py-2.5 rounded font-bold text-sm transition shadow duration-150 cursor-pointer text-center uppercase tracking-wider"
            >
              SUBMIT HOSTING LISTING
            </button>
          </form>
        </div>

        {/* Right column: Current products list */}
        <div className="lg:col-span-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-850 uppercase tracking-wide">My Hosted Listings</h3>
            <p className="text-xs text-gray-500">Inventory directory hosted by {vendorName}.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-gray-50 text-gray-700 font-bold uppercase border-b border-gray-100">
                <tr>
                  <th className="p-3">Product Info</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400 animate-pulse">No products listed by you yet. Use the left-hand form or AI Copilot to submit catalog.</td>
                  </tr>
                ) : (
                  myProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/55 transition">
                      <td className="p-3 flex items-center gap-2 max-w-[200px]">
                        {p.imageUrl === 'chicago-32-jersey' ? (
                          <div className="w-8 h-8 rounded border overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <ChicagoVarsityJerseyDraw size="sm" />
                          </div>
                        ) : (
                          <img 
                            src={p.imageUrl} 
                            alt="" 
                            className="w-8 h-8 object-contain rounded border bg-gray-50 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-extrabold text-slate-800 truncate leading-snug">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{p.category}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">₦{p.price.toLocaleString()}</td>
                      <td className="p-3">
                        {p.isApproved ? (
                          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">APPROVED & LIVE</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">PENDING ADMIN</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded transition cursor-pointer"
                          aria-label="Delete layout product"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Dynamic Image Slot Uploader Modal */}
      {activeImageSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans backdrop-blur-xs animate-fade-in" id="image-slot-modal">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full p-5 space-y-4 relative">
            <div className="flex items-center justify-between pb-2 border-b border-gray-150">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-800 uppercase tracking-tight">
                Add / Edit Photo (Picture {activeImageSlot + 1})
              </h3>
              <button 
                onClick={() => setActiveImageSlot(null)}
                className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option 1: File Uploader from Local Machine */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Option 1: Upload from local device</span>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#7c3aed] rounded-lg p-5 cursor-pointer hover:bg-purple-50/10 transition group">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#7c3aed] mb-1.5 transition" />
                <span className="text-xs font-black text-gray-750 group-hover:text-[#7c3aed] transition">Choose Image File</span>
                <span className="text-[10px] text-gray-400 font-medium text-center">Click to select an image from your computer/phone</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          const newImages = [...uploadedImages];
                          newImages[activeImageSlot] = reader.result;
                          setUploadedImages(newImages);
                          if (activeImageSlot === 0) {
                            setNewProdImageUrl(reader.result);
                          }
                          setActiveImageSlot(null);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Option 2: Paste Image URL */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Option 2: Paste Web Image URL</span>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="https://images.unsplash.com/... or any URL"
                  defaultValue={uploadedImages[activeImageSlot] && !uploadedImages[activeImageSlot]?.startsWith('data:') ? (uploadedImages[activeImageSlot] as string) : ''}
                  id="modal-image-url"
                  className="flex-1 text-xs border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] bg-slate-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const inputEl = document.getElementById('modal-image-url') as HTMLInputElement;
                      if (inputEl) {
                        const url = inputEl.value.trim();
                        if (url) {
                          const newImages = [...uploadedImages];
                          newImages[activeImageSlot] = url;
                          setUploadedImages(newImages);
                          if (activeImageSlot === 0) {
                            setNewProdImageUrl(url);
                          }
                          setActiveImageSlot(null);
                        }
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById('modal-image-url') as HTMLInputElement;
                    if (inputEl) {
                      const url = inputEl.value.trim();
                      if (url) {
                        const newImages = [...uploadedImages];
                        newImages[activeImageSlot] = url;
                        setUploadedImages(newImages);
                        if (activeImageSlot === 0) {
                          setNewProdImageUrl(url);
                        }
                        setActiveImageSlot(null);
                      }
                    }
                  }}
                  className="bg-[#7c3aed] hover:bg-purple-600 text-white text-xs font-black px-4 py-2 rounded-lg transition uppercase cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Option 3: Select Stock Photo */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Option 3: Quick Premium Stock Photos</span>
              <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto pr-1">
                {[
                  { name: 'Varsity Jacket', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Sling Bag', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Red Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
                  { name: 'White Sneakers', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Wireless Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Bluetooth Speaker', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80' },
                  { name: 'T-Shirts Set', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Kitchen Blender', url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Juice Bottle', url: 'https://images.unsplash.com/photo-1505252585461-04db1ebb846d?auto=format&fit=crop&w=400&q=80' },
                  { name: 'Cosmetics', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80' }
                ].map((stock, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const newImages = [...uploadedImages];
                      newImages[activeImageSlot] = stock.url;
                      setUploadedImages(newImages);
                      if (activeImageSlot === 0) {
                        setNewProdImageUrl(stock.url);
                      }
                      setActiveImageSlot(null);
                    }}
                    className="group relative aspect-square rounded border border-gray-150 hover:border-[#7c3aed] hover:ring-2 hover:ring-purple-100 overflow-hidden bg-gray-50 flex items-center justify-center p-1 cursor-pointer transition select-none"
                  >
                    <img src={stock.url} alt={stock.name} className="max-h-[90%] max-w-[90%] object-contain" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                      <span className="text-[8px] text-white font-extrabold uppercase text-center leading-none px-1">{stock.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setActiveImageSlot(null)}
                className="bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-black px-4 py-2 rounded-lg transition uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ==========================================================================
   2. SYSTEM ADMIN DASHBOARD
   ========================================================================== */
interface AdminDashboardProps {
  products: Product[];
  onApproveProduct: (id: string) => void;
  onRejectProduct: (id: string) => void;
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled') => void;
}

export function AdminDashboard({ 
  products, 
  onApproveProduct, 
  onRejectProduct,
  orders = [],
  onUpdateOrderStatus
}: AdminDashboardProps) {
  const pendingProducts = products.filter(p => !p.isApproved);
  const liveCount = products.filter(p => p.isApproved).length;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Admin Greeting header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-600 text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Quxba Nigeria Control Tower</span>
            <h2 className="text-2xl font-extrabold uppercase mt-1">Super Admin Dashboard</h2>
            <p className="text-xs text-indigo-100 mt-0.5">Approve vendor listings, track platform conversions, and view revenue analytics.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-purple-900/40 text-white text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 backdrop-blur-md border border-purple-500/20">
              <ShieldAlert className="w-4 h-4 text-purple-200" />
              SYSTEM OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Admin stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Quxba Platform Gross</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <p className="text-2xl font-extrabold text-[#7c3aed] font-display">₦24,850,000</p>
            <span className="text-xs font-bold text-green-500">{`+23%`}</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Total Live Storefront Catalog</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{liveCount} Products</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-purple-600 uppercase">Pending approval queue</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{pendingProducts.length} Awaiting</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Commision Take Rate</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">12.5% Default</p>
        </div>
      </div>

      {/* Approvals Grid */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-gray-850 uppercase tracking-wide flex items-center gap-1.5">
              <BadgeAlert className="w-4.5 h-4.5 text-purple-600" />
              <span>Validate Merchant Product Ingress ({pendingProducts.length})</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">As Admin, review prices, descriptions and images. Approve to publish live on Quxba marketplace storefront instantly.</p>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Realtime Webhook</span>
        </div>

        {pendingProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="bg-purple-50 text-purple-500 p-3.5 rounded-full mb-2"><CheckSquare className="w-6 h-6" /></div>
            <p className="text-sm font-bold text-gray-700">Perfect Cleared Queue!</p>
            <p className="text-xs text-gray-450 mt-1">Sellers have no pending items awaiting authorization. Go to Seller Zone to list items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProducts.map((p) => (
              <div key={p.id} className="border border-purple-100 bg-purple-50/10 rounded-lg p-4 flex gap-4 hover:border-purple-300 transition duration-150">
                <img 
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80'} 
                  alt="" 
                  className="w-20 h-20 object-contain rounded bg-white p-1 border border-purple-100 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase truncate">{p.sellerName}</span>
                      <span className="text-[10px] font-bold text-gray-400 truncate">{p.category}</span>
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-1 mt-1">{p.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.description}</p>
                    <p className="text-sm font-extrabold text-[#7c3aed] mt-1">₦{p.price.toLocaleString()}</p>
                  </div>
                  
                  {/* Action approval buttons */}
                  <div className="flex items-center gap-2 mt-3.5">
                    <button 
                      onClick={() => onApproveProduct(p.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>APPROVE LIVE</span>
                    </button>
                    <button 
                      onClick={() => onRejectProduct(p.id)}
                      className="text-gray-500 hover:text-red-650 hover:bg-gray-100 text-[11px] font-bold px-3 py-1.5 rounded transition"
                    >
                      <span>REJECT</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Fulfillment & Stepper Control Room */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-gray-850 uppercase tracking-wide flex items-center gap-1.5">
              <ShoppingBag className="w-4.5 h-4.5 text-purple-600" />
              <span>Anniversary Delivery Stepper Nodes Controller ({orders.length})</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">As Super Admin, you can advance active checkout packages along fulfillment milestones. Doing so records exact transition timestamps.</p>
          </div>
          <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">Fulfillment Authority</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <p className="text-xs font-bold font-mono">No customer checkout orders recorded in Firestore yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-mono text-[10px] uppercase border-b border-gray-100">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method / Total</th>
                  <th className="p-3">Timeline Milestone</th>
                  <th className="p-3 text-right">Advance Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-800">{o.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-700 truncate max-w-[150px]">{o.customerEmail}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{o.deliveryAddress}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-extrabold text-purple-700">₦{o.totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{o.paymentMethod}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        o.status === 'Delivered' ? 'bg-green-150 text-green-700 font-extrabold' :
                        o.status === 'Cancelled' ? 'bg-red-150 text-red-750 font-extrabold' :
                        o.status === 'Out for Delivery' ? 'bg-blue-150 text-blue-700 font-extrabold' :
                        o.status === 'Shipped' ? 'bg-purple-150 text-purple-750 font-extrabold' :
                        'bg-amber-150 text-amber-700 font-extrabold'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">
                      {o.status === 'Cancelled' || o.status === 'Delivered' ? (
                        <span className="text-gray-400 italic font-medium">Complete</span>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          {o.status === 'Pending' && onUpdateOrderStatus && (
                            <button
                              onClick={() => onUpdateOrderStatus(o.id, 'Shipped')}
                              className="bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] px-2 py-1 rounded transition duration-150 cursor-pointer"
                            >
                              Dispatch (Ship)
                            </button>
                          )}
                          {o.status === 'Shipped' && onUpdateOrderStatus && (
                            <button
                              onClick={() => onUpdateOrderStatus(o.id, 'Out for Delivery')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-2 py-1 rounded transition duration-150 cursor-pointer"
                            >
                              Send Out
                            </button>
                          )}
                          {o.status === 'Out for Delivery' && onUpdateOrderStatus && (
                            <button
                              onClick={() => onUpdateOrderStatus(o.id, 'Delivered')}
                              className="bg-green-600 hover:bg-green-705 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] px-2 py-1 rounded transition duration-150 cursor-pointer"
                            >
                              Deliver Package
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Platform Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Performance SVG chart */}
        <div className="md:col-span-8 bg-white p-6 rounded-lg border border-gray-150 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Weekly Revenue Progress Summary</h3>
            <p className="text-xs text-gray-500">System generated metrics based on pre-paid transactions.</p>
          </div>

          <div className="h-44 flex items-end justify-between gap-2.5 pt-4">
            {[
              { day: 'Mon', value: 3.2 },
              { day: 'Tue', value: 4.8 },
              { day: 'Wed', value: 3.9 },
              { day: 'Thu', value: 6.4 },
              { day: 'Fri', value: 5.2 },
              { day: 'Sat', value: 8.5 },
              { day: 'Sun', value: 7.1 }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-md hover:from-purple-500 hover:to-fuchsia-400 transition-all cursor-pointer relative group"
                  style={{ height: `${d.value * 16}px` }}
                >
                  <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10 font-mono mb-1">₦{d.value}M</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick config side-box */}
        <div className="md:col-span-4 bg-white p-6 rounded-lg border border-gray-150 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Platform Tuning</h3>
            <p className="text-xs text-gray-500">Fine-tune e-commerce properties.</p>
          </div>
          <div className="space-y-3 font-sans text-xs">
            <div className="border-b border-gray-100 pb-2">
              <span className="block text-gray-500 font-bold mb-1">REGIONAL SHIPPING BASE</span>
              <span className="font-extrabold text-gray-850">₦4,500 Base Rate</span>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <span className="block text-gray-500 font-bold mb-1">MERCANTILE SPLIT RATES</span>
              <span className="font-extrabold text-gray-850">92% Vendor / 8% Platform</span>
            </div>
            <div>
              <span className="block text-gray-500 font-bold mb-1">PAYMENT GATEWAYS</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-green-100 text-green-700 font-bold text-[9px] px-2 py-0.5 rounded-full">Paystack ACTIVE</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold text-[9px] px-2 py-0.5 rounded-full">Flutterwave</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   3. CUSTOMER ORDER TRACKING PANEL
   ========================================================================== */
interface OrderTrackingViewProps {
  orders: Order[];
  onCancelOrder?: (orderId: string) => void;
  onReorder?: (items: CartItem[]) => void;
  onToggleView?: (view: 'storefront' | 'seller' | 'admin' | 'orders' | 'support') => void;
}

export function OrderSummaryCard({ 
  order, 
  onCancelOrder, 
  onReorder, 
  onToggleView 
}: { 
  order: Order; 
  onCancelOrder?: (id: string) => void;
  onReorder?: (items: CartItem[]) => void;
  onToggleView?: (view: 'storefront' | 'seller' | 'admin' | 'orders' | 'support') => void;
}) {
  const isPending = order.status === 'Pending';
  const isShipped = order.status === 'Shipped';
  const showContactSupport = isPending || isShipped;

  const steps = [
    { key: 'Pending', label: 'Order Registered', desc: 'Secure payment confirmation' },
    { key: 'Shipped', label: 'Dispatched to Transit Hub', desc: 'Shipped to regional sorting desk' },
    { key: 'Out for Delivery', label: 'Out for Local Road Delivery', desc: 'Rider is carrying your package' },
    { key: 'Delivered', label: 'Delivered successfully!', desc: 'Order arrived and inspected live' }
  ];

  const getStatusIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    const idx = steps.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-5 animate-fade-in" id={`order-summary-${order.id}`}>
      {/* Top Banner details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase">
            Order Reference: {order.id}
          </span>
          <h3 className="text-xs font-extrabold text-gray-800 mt-1 block">
            DATE PLACED: <span className="font-mono text-purple-600 font-bold">{order.date}</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
            CURRENT STATUS: <span className={`font-black uppercase ${order.status === 'Cancelled' ? 'text-red-500 bg-red-550/10 px-1.5 py-0.5 rounded border border-red-200' : 'text-purple-600'}`}>{order.status}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Reorder Button */}
          {onReorder && (
            <button
              onClick={() => onReorder(order.items)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-750 text-purple-700 text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              id={`btn-reorder-${order.id}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REORDER</span>
            </button>
          )}

          {/* Cancel Button */}
          {isPending && onCancelOrder && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  onCancelOrder(order.id);
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-650 text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              id={`btn-cancel-${order.id}`}
            >
              <X className="w-3.5 h-3.5 text-red-500" />
              <span>CANCEL ORDER</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Status Display or Stepper */}
      {order.status === 'Cancelled' ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-xs font-black text-red-700 uppercase tracking-wider">This Order has been Cancelled</h4>
            <p className="text-[11px] text-red-500 mt-0.5 leading-relaxed">
              Cancellation request processed on{' '}
              <strong className="font-mono">{order.statusTimestamps?.['Cancelled'] || order.date}</strong>. 
              Refund credits are synchronized automatically back to your wallet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fulfillment Stepper Timeline</span>
          
          <div className="relative pl-6 space-y-6">
            {/* Absolute stem line matching progress */}
            <div className="absolute left-2.5 top-2 bottom-7 w-0.5 bg-gray-100" />
            <div 
              className="absolute left-2.5 top-2 w-0.5 bg-gradient-to-b from-green-500 to-emerald-400 transition-all duration-300" 
              style={{
                height: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
                maxHeight: 'calc(100% - 32px)'
              }}
            />

            {steps.map((st, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const hasOccurred = isPast || isCurrent;
              // get timestamp
              const timestamp = order.statusTimestamps?.[st.key];

              return (
                <div key={st.key} className="flex gap-4 relative">
                  {/* Indicator circle */}
                  <div 
                    className={`absolute -left-[23px] w-5.5 h-5.5 rounded-full flex items-center justify-center border font-black text-[9px] transition-all duration-350 z-10 ${
                      isCurrent ? 'bg-purple-600 border-purple-600 text-white shadow-md ring-4 ring-purple-100 scale-110' :
                      isPast ? 'bg-green-500 border-green-500 text-white' :
                      'bg-white border-gray-200 text-gray-300'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h4 className={`text-xs md:text-sm font-bold tracking-tight ${isCurrent ? 'text-purple-700 font-black' : hasOccurred ? 'text-gray-805 font-bold' : 'text-gray-400 font-medium'}`}>
                        {st.label}
                      </h4>
                      {/* Exact status update timestamp indicator */}
                      {timestamp ? (
                        <span className="text-[9.5px] font-mono bg-purple-50 text-purple-750 px-1.5 py-0.5 rounded border border-purple-100 shrink-0 select-none">
                          🕒 {timestamp}
                        </span>
                      ) : idx === 0 ? (
                        <span className="text-[9.5px] font-mono bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 shrink-0 select-none">
                          🕒 {order.date}
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-gray-350 italic font-mono select-none">Awaiting milestone...</span>
                      )}
                    </div>
                    <p className={`text-[11.5px] mt-0.5 leading-relaxed ${hasOccurred ? 'text-gray-500' : 'text-gray-350'}`}>
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help & Support Button Segment for Pending or Shipped statuses */}
      {showContactSupport && onToggleView && (
        <div className="bg-purple-50/50 rounded-lg p-3.5 border border-purple-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-purple-800 uppercase tracking-wide">Shipment status questions?</h4>
            <p className="text-[11px] text-purple-600 leading-snug">Our 24/7 dedicated support assistants can instantly look up route satellites for you.</p>
          </div>
          <button
            onClick={() => onToggleView('support')}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-black tracking-wider px-4 py-2 rounded-md transition uppercase shrink-0 shadow-sm cursor-pointer active:scale-95"
            id={`btn-support-${order.id}`}
          >
            CONTACT SUPPORT 👩‍💻
          </button>
        </div>
      )}
    </div>
  );
}

export function OrderTrackingView({ orders, onCancelOrder, onReorder, onToggleView }: OrderTrackingViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');

  // Keep selected order in sync if selectedOrderId represents a non-existent or updated structure
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-150 shadow-sm space-y-6 font-sans">
      
      {/* Title Segment */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
          <Coins className="w-5 h-5 text-[#7c3aed]" />
          <span>Instant Quxba Delivery Tracker</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Check current location and riders step status of your anniversary package.</p>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-sm font-semibold">You have no recorded checkout orders yet.</p>
          <p className="text-xs text-gray-500 mt-1">Complete a purchase using the Checkout feature in your shopping cart to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order selection drop */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Select anniversary order to audit:</label>
            <select
              value={selectedOrderId || (activeOrder ? activeOrder.id : '')}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="bg-white border border-gray-205 rounded-md px-3.5 py-2 text-sm text-gray-850 focus:ring-1 focus:ring-brand-primary focus:outline-none w-full sm:max-w-sm font-semibold shadow-sm"
              id="order-select-dropdown"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} ({o.date} · ₦{o.totalPrice.toLocaleString()}) - {o.status}
                </option>
              ))}
            </select>
          </div>

          {activeOrder ? (
            <>
              <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-600 font-extrabold uppercase">TARGET ADDRESS</span>
                  <p className="text-xs font-bold text-gray-800 leading-snug">{activeOrder.deliveryAddress}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-600 font-extrabold uppercase">EXPECTED ARRIVAL</span>
                  <p className="text-xs font-bold text-gray-800">{activeOrder.expectedDelivery}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-600 font-extrabold uppercase">PAY METHOD</span>
                  <p className="text-xs font-bold text-gray-800">{activeOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Order Summary Card containing Timelines, Steppers, Reorder, Cancel, and Contact Support */}
              <OrderSummaryCard 
                order={activeOrder} 
                onCancelOrder={onCancelOrder} 
                onReorder={onReorder} 
                onToggleView={onToggleView} 
              />

              {/* List items under target order package */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-850 uppercase tracking-wide">Included inside this package:</h4>
                <div className="divide-y divide-gray-50 border border-gray-50 rounded">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4 bg-gray-50/50 rounded-md">
                      <div className="flex items-center gap-2.5 truncate">
                        <img 
                          src={it.product.imageUrl} 
                          alt="" 
                          className="w-10 h-10 object-contain rounded border bg-white p-1 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 truncate">{it.product.name}</p>
                          <p className="text-[10px] text-gray-500">Seller: {it.product.sellerName}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-gray-700 whitespace-nowrap">₦{it.product.price.toLocaleString()} x {it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm font-semibold">Active order could not be located.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}


/* ==========================================================================
   4. CLIENT LIVE SUPPORT CHAT
   ========================================================================== */
export function CustomerSupportChat() {
  const [messages, setMessages] = useState<SupportMessage[]>([
    { id: '1', sender: 'agent', text: 'Hello! Welcome to Quxba Express Help Desk. 💜 How may we support you with our products, payouts, or your anniversary shipment tracking today?', timestamp: 'Just Now' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: SupportMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: 'Just Now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Responsive bot simulated reply
    setTimeout(() => {
      let botResponseText = 'Thank you for writing inside Quxba Help Room. We are querying the dispatch catalog... Let us know if this involves a product warranty or refunds!';
      const txtLower = inputMessage.toLowerCase();
      if (txtLower.includes('refrigerator') || txtLower.includes('fridge')) {
        botResponseText = 'Our Nexus 250L Refrigerator includes full 2 Years warranty! Your pre-paid purchase is guarded with official replacement stamp. It will arrive inside 48 hours for Lagos addresses.';
      } else if (txtLower.includes('ac') || txtLower.includes('air conditioner')) {
        botResponseText = 'The Skyrun Split Air Conditioner features turbo energy saving, cooling down Lagos apartments in minutes. Rest assured your order tracking state is fully live.';
      } else if (txtLower.includes('commission') || txtLower.includes('vendor') || txtLower.includes('seller')) {
        botResponseText = 'Our vendor commissions are set at 12.5% max limit. Once listings are hosted in your Seller Zone, simply switch to Admin views to instantly approve them live.';
      } else if (txtLower.includes('track') || txtLower.includes('order')) {
        botResponseText = 'You can track orders effortlessly under "Account" -> "My Orders" tab. Enter your generated order reference (e.g. QUX-123456) to look up active shipment timelines.';
      }

      const botMsg: SupportMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: botResponseText,
        timestamp: 'Just Now'
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-150 shadow-md flex flex-col h-[520px] overflow-hidden font-sans">
      
      {/* Help header */}
      <div className="bg-[#7c3aed] text-white p-4 flex items-center gap-3">
        <div className="bg-white text-[#7c3aed] rounded-full p-2 font-bold text-sm">👩‍💻</div>
        <div>
          <h3 className="font-extrabold text-sm tracking-tight">Quxba Anniversary Help Desk</h3>
          <p className="text-[10px] text-purple-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active · Typical response less than 1 min
          </p>
        </div>
      </div>

      {/* Messages Shelf */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'items-start'}`}
          >
            <div 
              className={`rounded-lg px-3.5 py-2 text-xs md:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-[#7c3aed] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-gray-400 mt-1 uppercase font-semibold font-mono">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Send Message Form bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-150 flex gap-2">
        <input
          type="text"
          placeholder="Ask Quxba assistant anything (refrigerators, ACs, orders...)"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2 text-sm focus:bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
        <button 
          type="submit"
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white p-2.5 rounded-md transition shadow flex items-center justify-center flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>

    </div>
  );
}
