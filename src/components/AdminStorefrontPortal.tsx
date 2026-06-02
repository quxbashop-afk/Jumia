import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  PackagePlus, 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';

interface AdminStorefrontPortalProps {
  categories: any[];
  onSaveCategory: (catData: any) => Promise<boolean>;
  onDeleteCategory: (catId: string) => Promise<boolean>;
  onAddProduct: (prodData: Product) => Promise<boolean>;
}

const TEMPLATE_IMAGES = [
  { label: 'Smartphone / Gadget', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Premium Laptop', url: 'https://images.unsplash.com/photo-1496181130204-755241544e3a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Smart Audio Headset', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Classic Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
  { label: 'Running Shoes / Sneaker', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
  { label: 'Designer Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { label: 'Modern Air Conditioner', url: 'https://images.unsplash.com/photo-1585338114002-7472f10b3526?auto=format&fit=crop&w=600&q=80' },
  { label: 'Organic Supermarket Pack', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' }
];

export function AdminStorefrontPortal({ 
  categories, 
  onSaveCategory, 
  onDeleteCategory, 
  onAddProduct 
}: AdminStorefrontPortalProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'product'>('category');
  const [isOpen, setIsOpen] = useState(false);

  // Category values
  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📦');
  const [catDesc, setCatDesc] = useState('');
  const [catSubs, setCatSubs] = useState('');
  
  // Product values
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodStock, setProdStock] = useState('100');
  const [prodIsFlash, setProdIsFlash] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);

  // Status logs
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-set first category for product selection when categories load
  useEffect(() => {
    if (categories.length > 0 && !prodCategory) {
      setProdCategory(categories[0].name);
    }
  }, [categories, prodCategory]);

  const handleEditCategorySelect = (cat: any) => {
    setCatId(cat.id);
    setCatName(cat.name);
    setCatEmoji(cat.emoji || '📦');
    setCatDesc(cat.desc || '');
    setCatSubs(cat.subcategories ? cat.subcategories.join(', ') : '');
    setErrorText('');
    setSuccessText('');
  };

  const handleClearCategoryForm = () => {
    setCatId('');
    setCatName('');
    setCatEmoji('📦');
    setCatDesc('');
    setCatSubs('');
    setErrorText('');
    setSuccessText('');
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setErrorText('Please specify a Department Name.');
      return;
    }

    setIsSubmitting(true);
    setErrorText('');
    setSuccessText('');

    const targetId = catId || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const subList = catSubs
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const dataObj = {
      id: targetId,
      name: catName.trim(),
      emoji: catEmoji.trim(),
      desc: catDesc.trim(),
      subcategories: subList
    };

    const isOk = await onSaveCategory(dataObj);
    if (isOk) {
      setSuccessText(`Store Department "${catName}" has been successfully published / updated!`);
      handleClearCategoryForm();
    } else {
      setErrorText('An error occurred while saving the department layout data.');
    }
    setIsSubmitting(false);
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      setErrorText('Product title cannot be empty.');
      return;
    }
    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorText('Please specify a valid price greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorText('');
    setSuccessText('');

    const imageToUse = prodImageUrl.trim() || TEMPLATE_IMAGES[0].url;
    const targetProductId = 'prod-' + Date.now();
    const originalPriceNum = prodOriginalPrice ? parseFloat(prodOriginalPrice) : priceNum * 1.25;
    const computedDiscount = originalPriceNum > priceNum ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) : 0;

    const newProduct: Product = {
      id: targetProductId,
      name: prodName.trim(),
      category: prodCategory || categories[0]?.name || 'Electronics & Appliances',
      price: priceNum,
      originalPrice: originalPriceNum,
      discount: computedDiscount,
      imageUrl: imageToUse,
      imageUrls: [imageToUse],
      fromDevice: [],
      rating: 5.0,
      reviewsCount: 0,
      description: prodDesc.trim() || 'Premium retail grade item curated by store administration.',
      stock: parseInt(prodStock) || 100,
      sellerId: 'admin-master',
      sellerName: 'Quxba Jet Direct',
      isApproved: true,
      isFlashSale: prodIsFlash,
      brand: prodName.trim().split(/\s+/)[0] || 'Quxba',
      createdAt: Date.now(),
      specifications: {
        'Origin': 'SKU-ADM-' + Math.floor(1000 + Math.random() * 9000),
        'Vendor Guarantee': '1 Year Quxba Jet Direct Shield',
        'Stock': `${prodStock} units`,
        'Weight': '1.5 kg',
        'Dimensions': '10 x 8 x 6 in',
        'Featured': prodIsFeatured ? 'Yes' : 'No',
        'Subcategory': prodSubcategory || 'Standard'
      }
    };
    (newProduct as any).subcategory = prodSubcategory || 'Standard';

    const isOk = await onAddProduct(newProduct);
    if (isOk) {
      setSuccessText(`Published! Product "${prodName}" is now active in ${newProduct.category}.`);
      setProdName('');
      setProdPrice('');
      setProdOriginalPrice('');
      setProdDesc('');
      setProdImageUrl('');
      setProdSubcategory('');
    } else {
      setErrorText('Failed to publish the product configuration to database.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}" and all its subcategories?`)) {
      setErrorText('');
      setSuccessText('');
      const isOk = await onDeleteCategory(id);
      if (isOk) {
        setSuccessText(`Successfully removed department "${name}".`);
        if (catId === id) {
          handleClearCategoryForm();
        }
      } else {
        setErrorText('Failed to delete department.');
      }
    }
  };

  // Get active category's subcategories
  const activeCategoryDetails = categories.find(c => c.name === prodCategory);
  const activeSubcategories = activeCategoryDetails?.subcategories || [];

  return (
    <div className="bg-white border-2 border-dashed border-purple-300 rounded-2xl p-5 mb-8 shadow-sm font-sans animate-fade-in relative text-left">
      {/* Absolute Admin Ribbon tag */}
      <span className="absolute -top-3.5 left-6 bg-[#7c3aed] text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-xs flex items-center gap-1.5 select-none z-10">
        <Sparkles className="w-3 h-3 text-purple-200 animate-spin" />
        <span>Owner Real-time Portal</span>
      </span>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-4 mt-1">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">ADMIN STOREFRONT CONTROLLER</h2>
          <p className="text-[10px] text-gray-500 font-medium">Quickly launch new departments and bind products into categories instantly on the active home screen.</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase shadow-2xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
            isOpen 
              ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
              : 'bg-purple-100 text-[#7c3aed] hover:bg-purple-200'
          }`}
        >
          <span>{isOpen ? 'COLLAPSE CONTROLLER' : 'EXPAND CONTROLLER ⚙️'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-5 animate-slide-up">
          {/* Form tab controls */}
          <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-150/50 gap-1.5 w-fit">
            <button
              onClick={() => { setActiveTab('category'); setErrorText(''); setSuccessText(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'category'
                  ? 'bg-white text-[#7c3aed] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>1. Create Store Department</span>
            </button>
            <button
              onClick={() => { setActiveTab('product'); setErrorText(''); setSuccessText(''); }}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'product'
                  ? 'bg-white text-[#7c3aed] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>2. Push Product to Category</span>
            </button>
          </div>

          {/* Feedback logs */}
          {errorText && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}
          {successText && (
            <div className="p-3.5 bg-green-50 text-green-800 text-xs rounded-xl border border-green-200 flex items-center gap-2.5 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{successText}</span>
            </div>
          )}

          {/* TAB 1: CATEGORY MANAGER */}
          {activeTab === 'category' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category creation form */}
              <form onSubmit={submitCategory} className="lg:col-span-7 space-y-4">
                <span className="text-[10px] font-black uppercase text-[#7c3aed] tracking-wider block">
                  {catId ? '✏️ EDIT SELECT DEPARTMENT' : '✨ INVENT NEW DEPARTMENT'}
                </span>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      align="center"
                      value={catEmoji}
                      onChange={(e) => setCatEmoji(e.target.value)}
                      placeholder="e.g. 🎒"
                      maxLength={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-sm text-center font-bold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all text-gray-800"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Department Title *</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="e.g. Sports Equipment"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all placeholder-gray-300 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Short Description / Subtitle</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="e.g. Football jerseys, gym weights, outdoor gear"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all placeholder-gray-300 text-gray-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9.5px] font-black text-[#7c3aed] uppercase tracking-wider">Subcategories list (Comma-separated)</label>
                    <span className="text-[9px] text-gray-400 font-bold">Instantly filters home layout</span>
                  </div>
                  <input
                    type="text"
                    value={catSubs}
                    onChange={(e) => setCatSubs(e.target.value)}
                    placeholder="e.g. Jerseys, Weights, Accessories, Footwear"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all placeholder-gray-300 text-gray-800"
                  />
                </div>

                <div className="flex items-center gap-3.5 pt-1.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Syncing...' : catId ? '💾 Save Category Details' : '➕ Create New Category'}
                  </button>
                  
                  {catName && (
                    <button
                      type="button"
                      onClick={handleClearCategoryForm}
                      className="px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 bg-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </form>

              {/* Sidebar department review and delete list */}
              <div className="lg:col-span-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-150/40">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-2 px-1">ACTIVE DIRECTORY MANAGEMENT</span>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id}
                      className={`p-2.5 rounded-xl border bg-white flex items-center justify-between transition-all duration-150 ${
                        catId === cat.id ? 'border-[#7c3aed] ring-2 ring-purple-100' : 'border-gray-150/70 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base bg-purple-50 p-1.5 rounded-lg flex-shrink-0">{cat.emoji || '📦'}</span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-gray-800 truncate">{cat.name}</p>
                          <p className="text-[9px] text-gray-400 truncate">{cat.subcategories?.length || 0} subcategories mapped</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditCategorySelect(cat)}
                          className="p-1.5 hover:bg-purple-50 text-purple-700 rounded-lg transition cursor-pointer"
                          title="Edit details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat.id, cat.name)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT QUICK-ADD FORM */}
          {activeTab === 'product' && (
            <form onSubmit={submitProduct} className="space-y-5 animate-slide-up">
              <span className="text-[10px] font-black uppercase text-[#7c3aed] tracking-wider block">
                🚀 CONFIGURE & DEPLOY CATALOG PRODUCT
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Quxba Pro Air Max Wireless Headsets"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-gray-300 text-gray-800"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="100"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-gray-300 text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Department drop */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Target Department *</label>
                  <div className="relative">
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        setProdCategory(e.target.value);
                        // reset subcategory helper choice
                        setProdSubcategory('');
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-800 appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.emoji || '📦'} {cat.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 justify-center text-gray-400">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Subcategory Filter *</label>
                  {activeSubcategories.length > 0 ? (
                    <div className="relative">
                      <select
                        value={prodSubcategory}
                        onChange={(e) => setProdSubcategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-800 appearance-none cursor-pointer"
                      >
                        <option value="">-- Choose option --</option>
                        {activeSubcategories.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 justify-center text-gray-400">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={prodSubcategory}
                      onChange={(e) => setProdSubcategory(e.target.value)}
                      placeholder="e.g. Sound Systems"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-800"
                    />
                  )}
                </div>

                {/* Subcategory backup manual type */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Custom Subcategory Override</label>
                  <input
                    type="text"
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    placeholder="Type to override or set custom value..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-gray-300 text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selling Price */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Active Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-green-700 bg-green-50/25 focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Original Price (₦) - For Discount label badge</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    placeholder="e.g. 55000 (Defaults to Price * 1.25)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image selection template widget */}
              <div>
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#7c3aed]" />
                  <span>Choose Thumbnail Image</span>
                </label>
                <div className="hidden sm:grid grid-cols-4 gap-2 mb-2 bg-gray-50 p-2.5 rounded-xl border border-gray-150/50">
                  {TEMPLATE_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setProdImageUrl(img.url)}
                      className={`p-1.5 rounded-lg border text-left text-[9px] flex items-center gap-2 bg-white transition hover:border-[#7c3aed] cursor-pointer ${
                        prodImageUrl === img.url ? 'border-[#7c3aed] ring-2 ring-purple-100' : 'border-gray-150'
                      }`}
                    >
                      <img src={img.url} className="w-6 h-6 rounded object-cover shadow-2xs" alt="" referrerPolicy="no-referrer" />
                      <span className="truncate font-semibold text-gray-700">{img.label}</span>
                    </button>
                  ))}
                </div>
                {/* Manual override input text */}
                <input
                  type="text"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="Paste custom unsplash or cloud image URL here..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-gray-300 text-gray-800"
                />
              </div>

              {/* Description helper text block */}
              <div>
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Catalog Description / Product Pitch</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe your product's design, specs, and performance benchmarks..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-300 focus:outline-none placeholder-gray-300 text-gray-800"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-150/50">
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFlash}
                    onChange={(e) => setProdIsFlash(e.target.checked)}
                    className="rounded border-gray-350 text-[#7c3aed] focus:ring-[#7c3aed] cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider">🎯 Hot Flash Sale item!</span>
                </label>
                
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded border-gray-350 text-[#7c3aed] focus:ring-[#7c3aed] cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-[#7c3aed] uppercase tracking-wider">⭐ Feature in Spotlight Section</span>
                </label>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : '🚀 Publish & Host Product Item'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
