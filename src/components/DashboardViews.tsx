import React, { useState } from 'react';
import { 
  Building2, Percent, TrendingUp, Users, ShoppingBag, Plus, Trash2, Check, X, ShieldAlert, BadgeAlert,
  Send, RefreshCw, BarChart3, CheckSquare, Coins, HelpCircle, PackageOpen, ArrowRight, UserCheck, Star,
  ChevronRight, Loader2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Product, Order, SupportMessage, CartItem, ProductOption, ProductVariant } from '../types';

/* ==========================================================================
   1. SELLER ZONE DASHBOARD
   ========================================================================== */
interface SellerDashboardProps {
  products: Product[];
  onAddNewProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export function SellerDashboard({ products, onAddNewProduct, onDeleteProduct }: SellerDashboardProps) {
  const [vendorName] = useState('Supreme Appliances Ltd');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fashion & Apparel');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Add-ons, featured, related states
  const [isFeatured, setIsFeatured] = useState(false);
  const [isApprovedDirectly, setIsApprovedDirectly] = useState(true); // Auto-publish directly to Home Page
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);
  const [showRelatedModal, setShowRelatedModal] = useState(false);
  
  // Sorting & Submission states
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Squarespace Commerce UI States ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Logistics parameters matching Squarespace /config/commerce exactly
  const [inventorySku, setInventorySku] = useState('');
  const [inventoryQty, setInventoryQty] = useState('150');
  const [isUnlimitedQty, setIsUnlimitedQty] = useState(true);
  const [inventoryWeight, setInventoryWeight] = useState('1.2');
  const [inventoryLength, setInventoryLength] = useState('12');
  const [inventoryWidth, setInventoryWidth] = useState('8');
  const [inventoryHeight, setInventoryHeight] = useState('4');

  // Multi-image list for rich image uploaders (5 slots)
  const [productImages, setProductImages] = useState<(string | null)[]>([
    null, null, null, null, null
  ]);
  const [activeImageSlot, setActiveImageSlot] = useState<number>(0);
  const [fullscreenPreviewImage, setFullscreenPreviewImage] = useState<string | null>(null);

  const isSkuValid = (sku: string) => {
    if (!sku) return true;
    return /^[a-zA-Z0-9]+-[0-9]+-[a-zA-Z0-9]+$/.test(sku);
  };

  // Product Options and Variants states
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [showAddOptionForm, setShowAddOptionForm] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');

  // Preset Premium Stock Photos for visual quick-clicks (Squarespace Workspace stock)
  const STOCK_PRESETS = [
    { name: 'Red Sneakers', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
    { name: 'Varsity Jacket', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80' },
    { name: 'Athletic Socks', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80' },
    { name: 'Smartwatch Dial', category: 'Electronics & Appliances', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80' },
    { name: 'Wireless Headphones', category: 'Electronics & Appliances', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Leather Slingbag', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
    { name: 'Kitchen Blender', category: 'Electronics & Appliances', url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&w=600&q=80' },
    { name: 'Makeup Palette', category: 'Health & Beauty', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
    { name: 'White Sports Trainers', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
    { name: 'Retro Aviators', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80' },
    { name: 'Hydraulic Cleanser', category: 'Health & Beauty', url: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80' },
    { name: 'Denim Trucker Jacket', category: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80' }
  ];

  const myProducts = products.filter(p => p.sellerId === 'vendor-self' || p.sellerName === vendorName);
  
  const sortedProducts = [...myProducts].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });

  const totalSales = 1240000;
  const pendingApproval = products.filter(p => !p.isApproved && (p.sellerId === 'vendor-self' || p.sellerName === vendorName)).length;

  // Generate combinations of product variants
  const generateVariantsCombinations = (opts: ProductOption[], existingVars: ProductVariant[]) => {
    if (opts.length === 0) return [];
    
    const basePrice = parseFloat(newProdPrice) || 0;
    const baseSku = inventorySku || 'SKU';

    const combine = (index: number, currentOpts: Record<string, string>): Record<string, string>[] => {
      if (index === opts.length) {
        return [currentOpts];
      }
      const option = opts[index];
      const results: Record<string, string>[] = [];
      for (const val of option.values) {
        results.push(...combine(index + 1, { ...currentOpts, [option.name]: val }));
      }
      return results;
    };
    
    const combinations = combine(0, {});
    
    return combinations.map((comb) => {
      // Find if we have an existing variant mirroring these EXACT options
      const match = existingVars.find((v) => {
        const vKeys = Object.keys(v.options);
        const combKeys = Object.keys(comb);
        if (vKeys.length !== combKeys.length) return false;
        return vKeys.every((k) => v.options[k] === comb[k]);
      });
      
      if (match) {
        return match;
      }
      
      // otherwise make a new one
      const suffix = Object.values(comb).map(v => v.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3)).join('-');
      const generatedSku = `${baseSku}-${suffix}-${Math.floor(10 + Math.random() * 90)}`;
      
      return {
        id: 'var-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        options: comb,
        price: basePrice,
        stock: 50,
        sku: generatedSku
      };
    });
  };

  const handleAddOption = () => {
    if (!newOptionName.trim() || !newOptionValues.trim()) {
      return;
    }
    const name = newOptionName.trim();
    const values = newOptionValues.split(/[,;]+/).map(v => v.trim()).filter(Boolean);
    if (values.length === 0) {
      return;
    }

    if (productOptions.some(o => o.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const updatedOptions = [...productOptions, { name, values }];
    setProductOptions(updatedOptions);
    const updatedVariants = generateVariantsCombinations(updatedOptions, productVariants);
    setProductVariants(updatedVariants);

    // reset fields
    setNewOptionName('');
    setNewOptionValues('');
    setShowAddOptionForm(false);
  };

  const handleRemoveOption = (optionNameToRemove: string) => {
    const updatedOptions = productOptions.filter(o => o.name !== optionNameToRemove);
    setProductOptions(updatedOptions);
    const updatedVariants = generateVariantsCombinations(updatedOptions, productVariants);
    setProductVariants(updatedVariants);
  };

  const handleUpdateVariantValue = (varId: string, field: 'price' | 'stock' | 'sku', value: any) => {
    setProductVariants(prev => prev.map(v => {
      if (v.id === varId) {
        return {
          ...v,
          [field]: field === 'price' ? (parseFloat(value) || 0) : field === 'stock' ? (parseInt(value) || 0) : value
        };
      }
      return v;
    }));
  };

  // Open editor for a brand new product
  const handleCreateNewClick = () => {
    setEditingProductId(null);
    setNewProdName('');
    setNewProdCategory('Fashion & Apparel');
    setNewProdPrice('');
    setNewProdOldPrice('');
    setNewProdDesc('');
    setNewProdImageUrl('');
    setIsFeatured(false);
    setIsApprovedDirectly(true);
    setSelectedAddons([]);
    setSelectedRelated([]);
    setInventorySku('QUX-MER-' + Math.floor(1000 + Math.random() * 9000));
    setInventoryQty('150');
    setIsUnlimitedQty(true);
    setInventoryWeight('1.2');
    setInventoryLength('12');
    setInventoryWidth('8');
    setInventoryHeight('4');
    setProductImages([null, null, null, null, null]);
    setActiveImageSlot(0);
    setProductOptions([]);
    setProductVariants([]);
    setShowAddOptionForm(false);
    setNewOptionName('');
    setNewOptionValues('');
    setFormError('');
    setFormSuccess('');
    setIsEditorOpen(true);
  };

  // Open editor for an existing product to edit it
  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id);
    setNewProdName(p.name);
    setNewProdCategory(p.category);
    setNewProdPrice(String(p.price));
    setNewProdOldPrice(p.originalPrice ? String(p.originalPrice) : '');
    setNewProdDesc(p.description || '');
    setNewProdImageUrl(p.imageUrl || '');
    setIsFeatured(p.specifications?.['Featured'] === 'Yes');
    setIsApprovedDirectly(p.isApproved !== undefined ? p.isApproved : true);
    
    // Parse logistics
    setInventorySku(p.specifications?.['Origin'] && p.specifications?.['Origin'].startsWith('SKU-') ? p.specifications?.['Origin'] : 'SKU-' + Math.floor(1000 + Math.random() * 9000));
    const isUnl = p.specifications?.['Stock'] === 'Unlimited' || !p.specifications?.['Stock'];
    setIsUnlimitedQty(isUnl);
    if (!isUnl && p.specifications?.['Stock']) {
      setInventoryQty(p.specifications?.['Stock'].replace(' units', '') || '100');
    } else {
      setInventoryQty('150');
    }
    
    const parsedWeight = p.specifications?.['Weight'] ? p.specifications?.['Weight'].replace(' lbs', '') : '1.2';
    setInventoryWeight(parsedWeight);
    
    const specDim = p.specifications?.['Dimensions'] ? p.specifications?.['Dimensions'].split(' x ') : ['12', '8', '4 in'];
    setInventoryLength(specDim[0] || '12');
    setInventoryWidth(specDim[1] || '8');
    setInventoryHeight(specDim[2] ? specDim[2].replace(' in', '') : '4');

    // Parse image gallery list
    const existingImgs = [p.imageUrl, ...(p.imageUrls ? p.imageUrls.filter(i => i !== p.imageUrl) : [])].filter(Boolean);
    const loadedImgs = [...existingImgs];
    while (loadedImgs.length < 5) loadedImgs.push(null);
    setProductImages(loadedImgs.slice(0, 5));
    setActiveImageSlot(0);

    // Parse addons
    if (p.specifications?.['Addons Included'] && p.specifications?.['Addons Included'] !== 'None') {
      setSelectedAddons(p.specifications?.['Addons Included'].split(', ').map(str => str.toLowerCase().replace(/\s+/g, '-')));
    } else {
      setSelectedAddons([]);
    }

    setProductOptions(p.options || []);
    setProductVariants(p.variants || []);
    setShowAddOptionForm(false);
    setNewOptionName('');
    setNewOptionValues('');

    setFormError('');
    setFormSuccess('');
    setIsEditorOpen(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // The primary image is the first slot that actually has a value, or the manual model fallback value
    const primaryImg = productImages[0] || newProdImageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
    
    if (!newProdName || !newProdPrice) {
      setFormError('Product Name and Retail Selling Price are strictly required!');
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Kindly input a valid numeric retail price.');
      return;
    }

    if (inventorySku && !isSkuValid(inventorySku)) {
      setFormError('Formatting Error: SKU must follow the standard PREFIX-NUMERIC-SUFFIX format (e.g., QUX-123-AB).');
      return;
    }

    const originalPriceNum = newProdOldPrice ? parseFloat(newProdOldPrice) : priceNum * 1.25;

    // Filter valid URLs from uploader list
    const validImages = productImages.filter((img): img is string => !!img);
    if (validImages.indexOf(primaryImg) === -1) {
      validImages.unshift(primaryImg);
    }
    const finalImagesList = Array.from(new Set(validImages)).slice(0, 5) as string[];
    const fromDeviceList = finalImagesList.filter((img): img is string => img.startsWith('data:image'));

    const targetProductId = editingProductId || 'prod-' + Date.now();

    const newProduct: Product = {
      id: targetProductId,
      name: newProdName,
      category: newProdCategory,
      price: priceNum,
      originalPrice: originalPriceNum,
      discount: Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100),
      imageUrl: primaryImg,
      imageUrls: finalImagesList,
      fromDevice: fromDeviceList,
      rating: 5.0,
      reviewsCount: 0,
      description: newProdDesc || 'Brand new premium verified product listing curated in modern Squarespace CMS Workspace.',
      stock: isUnlimitedQty ? 9999 : parseInt(inventoryQty) || 50,
      sellerId: 'vendor-self',
      sellerName: vendorName,
      isApproved: isApprovedDirectly, 
      brand: newProdName.trim().split(/\s+/)[0] || 'Generic',
      createdAt: Date.now(),
      specifications: { 
        'Origin': inventorySku || 'SKU-UNKNOWN', 
        'Vendor Guarantee': '1 Year Quxba Shield Guarantee',
        'Stock': isUnlimitedQty ? 'Unlimited' : `${inventoryQty} units`,
        'Weight': `${inventoryWeight} lbs`,
        'Dimensions': `${inventoryLength} x ${inventoryWidth} x ${inventoryHeight} in`,
        'Addons Included': selectedAddons.length > 0 ? selectedAddons.map(a => a.replace('-', ' ')).join(', ') : 'None',
        'Featured': isFeatured ? 'Yes' : 'No'
      },
      options: productOptions,
      variants: productVariants
    };

    setIsSubmitting(true);
    setFormSuccess('');
    setFormError('');

    setTimeout(() => {
      onAddNewProduct(newProduct);
      setFormSuccess(editingProductId 
        ? 'Squarespace Commerce: Product configuration synchronized and updated!' 
        : (isApprovedDirectly 
          ? 'Squarespace Commerce: Verified listing published directly to Storefront!' 
          : 'Squarespace Commerce: Draft saved successfully! Status set to Pending Review.'
        )
      );
      
      setIsSubmitting(false);
      
      // Keep alert feedback elegant and close panel
      setTimeout(() => {
        setIsEditorOpen(false);
        setEditingProductId(null);
        setFormSuccess('');
      }, 1000);
    }, 800);
  };

  const handleApplyImageInSlot = (url: string) => {
    const updated = [...productImages];
    updated[activeImageSlot] = url;
    setProductImages(updated);
    if (activeImageSlot === 0) {
      setNewProdImageUrl(url);
    }
  };

  const handleClearImageInSlot = (slotIdx: number) => {
    const updated = [...productImages];
    updated[slotIdx] = null;
    setProductImages(updated);
    if (slotIdx === 0) {
      setNewProdImageUrl('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. SQUARESQUARE-STYLE COMMERCE WORKSPACE WRAPPER */}
      {!isEditorOpen ? (
        <>
          {/* Vendor Hub Info Header */}
          <div className="bg-[#111] rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 font-black text-7xl select-none uppercase tracking-widest leading-none pointer-events-none translate-x-10 translate-y-2">
              COMMERCE
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">Verified Merchant Hub</span>
                <h2 className="text-2xl font-black uppercase mt-1 tracking-tight">{vendorName}</h2>
                <p className="text-xs text-neutral-400 mt-1">Configure stock channels, audit merchant sales, and manage list configurations.</p>
              </div>
              <div className="flex gap-2.5">
                <div className="bg-neutral-800 border border-neutral-700/50 p-3 rounded text-center min-w-[105px]">
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">ESCROW WALLET</p>
                  <p className="text-sm font-black text-emerald-400">₦1,450,000</p>
                </div>
                <div className="bg-neutral-800 border border-neutral-700/50 p-3 rounded text-center min-w-[105px]">
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">SATISFACTION</p>
                  <p className="text-sm font-black text-amber-400">4.9 ★</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Sales (Gross)</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">₦{totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-2.5 rounded text-[#7c3aed]"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="bg-white p-5 rounded border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Inventory</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">{myProducts.filter(p => p.isApproved).length}</p>
              </div>
              <div className="bg-green-50 p-2.5 rounded text-green-600"><ShoppingBag className="w-4 h-4" /></div>
            </div>
            <div className="bg-white p-5 rounded border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Awaiting Verification</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{pendingApproval}</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded text-blue-600"><Building2 className="w-4 h-4" /></div>
            </div>
            <div className="bg-white p-5 rounded border border-gray-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Membership Class</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">Merchant Pro 💎</p>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded text-neutral-600"><Check className="w-4 h-4" /></div>
            </div>
          </div>

          {/* Daily Sales Volume Chart Card using Recharts */}
          <div className="bg-white p-6 rounded border border-gray-200 shadow-xs space-y-4 font-sans text-left">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neutral-800" />
                <span>Daily Revenue & Volume Metrics</span>
              </h3>
              <p className="text-[11px] text-gray-400">Review consumer dispatch transactions to forecast product replenishment cycles.</p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: 'Mon', sales: 12 },
                  { day: 'Tue', sales: 19 },
                  { day: 'Wed', sales: 15 },
                  { day: 'Thu', sales: 27 },
                  { day: 'Fri', sales: 22 },
                  { day: 'Sat', sales: 34 },
                  { day: 'Sun', sales: 29 }
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11px' }}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} 
                  />
                  <Bar dataKey="sales" fill="#111111" radius={[2, 2, 0, 0]} name="Orders Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COMMERCE PRODUCTS DIRECTORY TABLE (SQUARESQUARE INSPIRED) */}
          <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Inventory Management ({myProducts.length} Items)</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Squarespace Commerce product directory. Click edit to configure details.</p>
              </div>
              <button
                onClick={handleCreateNewClick}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black px-4 py-2 rounded uppercase tracking-wider transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] text-neutral-500 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-[10px] tracking-wider">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'name') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('name');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center gap-1 font-bold uppercase hover:text-black transition cursor-pointer"
                      >
                        <span>Product</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    </th>
                    <th className="p-4 font-semibold text-[10px] tracking-wider">SKU / Logistics</th>
                    <th className="p-4 font-semibold text-[10px] tracking-wider">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'price') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('price');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center gap-1 font-bold uppercase hover:text-black transition cursor-pointer"
                      >
                        <span>Price</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    </th>
                    <th className="p-4 font-semibold text-[10px] tracking-wider">Stock Status</th>
                    <th className="p-4 font-semibold text-[10px] tracking-wider">Storefront Tab</th>
                    <th className="p-4 font-semibold text-[10px] tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-600 font-normal">
                  {sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-400">
                        No product offerings recorded currently. Click "+ Add Product" to model a luxurious Squarespace product sheet.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#fcfcfc] transition">
                        <td className="p-4 flex items-center gap-3 max-w-[240px]">
                          <img 
                            src={p.imageUrl} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded border border-gray-200 bg-gray-50 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                            <p className="text-[9px] text-[#7c3aed] uppercase font-bold tracking-wider mt-0.5">ID: {p.id}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-gray-400">
                          <div>{p.specifications?.['Origin'] || 'QUX-GEN'}</div>
                          <div className="text-[9px] mt-0.5">{p.specifications?.['Dimensions'] || 'N/A'}</div>
                        </td>
                        <td className="p-4 font-bold text-neutral-900 whitespace-nowrap">₦{p.price.toLocaleString()}</td>
                        <td className="p-4 font-bold">
                          {p.isApproved ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">Public & Live</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">Awaiting review</span>
                          )}
                        </td>
                        <td className="p-4 text-neutral-800 font-semibold">{p.category}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => handleEditClick(p)}
                            className="text-neutral-700 hover:text-black hover:bg-neutral-100 font-bold border border-neutral-200 rounded p-1 px-2.5 text-xs transition inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => onDeleteProduct(p.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded transition cursor-pointer inline-block"
                            aria-label="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ==========================================================================
           2. SQUARESQUARE-INSPIRED COMMERCE PRODUCT PAGE EDITOR (/config/commerce)
           ========================================================================== */
        <div className="bg-[#fafafa] -mx-4 sm:-mx-8 p-4 sm:p-8 rounded-xl border border-gray-200 shadow-xs space-y-6 animate-fade-in text-left">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingProductId(null);
                }}
                className="text-gray-400 hover:text-black text-xs font-black tracking-widest uppercase flex items-center gap-1 transition"
              >
                <span>✕ Cancel</span>
              </button>
              <div className="h-4 w-[1px] bg-gray-300 hidden sm:block" />
              <div>
                <span className="text-[10px] font-black text-neutral-400 tracking-widest uppercase block leading-none">Commerce / Product Editor</span>
                <span className="text-sm font-semibold text-neutral-900 mt-1 block">
                  {editingProductId ? 'Configure Existing Listing' : 'Create Physical Product Sheets'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Type tag representation */}
              <span className="text-[9px] font-black uppercase tracking-widest bg-neutral-200 border border-neutral-300 px-2 py-1 select-none text-neutral-600 hidden md:inline-block">
                Physical Product Type
              </span>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateProduct}
                className="flex-1 sm:flex-initial bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-black px-6 py-2.5 uppercase tracking-widest rounded transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <span>{editingProductId ? 'Save Product Sheet' : 'Publish Commerce Listing'}</span>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main specifications details (7 cols out of 12) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Core Product Title & Writing Description */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#111] uppercase block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Add a product name... (e.g., Chicago 32 Crimson Varsity Hoodie)"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-white text-neutral-900 font-medium text-lg leading-snug border-b border-gray-200 focus:border-neutral-950 py-1 focus:outline-none transition-all placeholder:text-gray-300"
                  />
                  <p className="text-[9.5px] text-gray-400 mt-1">Unique catalog name visible in standard search listings.</p>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black tracking-widest text-[#111] uppercase block">Description / Specifications</label>
                    <span className="text-[9px] text-[#7c3aed] font-bold">Standard Markdown supported</span>
                  </div>
                  {/* Styled like rich text top bar */}
                  <div className="bg-neutral-50 px-2.5 py-1.5 border border-gray-200 border-b-0 flex gap-4 text-xs text-gray-400 select-none">
                    <span className="hover:text-black cursor-pointer font-bold">B</span>
                    <span className="hover:text-black cursor-pointer italic">I</span>
                    <span className="hover:text-black cursor-pointer underline">U</span>
                    <span className="hover:text-black cursor-pointer">H1</span>
                    <span className="hover:text-black cursor-pointer">H2</span>
                    <span className="hover:text-black cursor-pointer">🔗 Link</span>
                    <span className="hover:text-black cursor-pointer">≣ Bullet</span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Detail the product and item highlights here. Provide specification lists, origin, guarantee terms, and structural parameters..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-white text-xs text-neutral-800 leading-relaxed border border-gray-200 p-3 focus:outline-none focus:border-neutral-950 rounded-b transition"
                  />
                </div>
              </div>

              {/* Card 2: Interactive Dynamic Multi-Photo Gallery (5 slots) */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Product Media Assets ({productImages.filter(Boolean).length}/5)</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Drag & drop files or click an asset slot to link photo sources.</p>
                </div>

                {/* 5-Slot Grid matching Squarespace layout */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3.5">
                  {productImages.map((img, idx) => {
                    const isActive = idx === activeImageSlot;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveImageSlot(idx)}
                        className={`relative aspect-square rounded border cursor-pointer select-none overflow-hidden transition flex flex-col justify-between items-center p-1.5 ${
                          isActive 
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-100' 
                            : 'border-dashed border-gray-200 bg-gray-50 hover:bg-neutral-50/55 hover:border-gray-400'
                        }`}
                      >
                        {img ? (
                          <>
                            <img src={img} alt="" className="h-full w-full object-cover rounded" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition gap-1.5 p-1">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFullscreenPreviewImage(img);
                                }}
                                className="bg-white/95 hover:bg-white text-[#7c3aed] text-[8px] font-black uppercase px-2 py-0.5 rounded cursor-pointer tracking-wider"
                                title="Zoom Full Screen"
                              >
                                🔍 Preview
                              </button>
                              <div className="flex gap-1 items-center justify-center">
                                {idx > 0 && (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // rotate to index 0 (make primary)
                                      const updated = [...productImages];
                                      const currentPrimary = updated[0];
                                      updated[0] = img;
                                      updated[idx] = currentPrimary;
                                      setProductImages(updated);
                                      if (updated[0]) setNewProdImageUrl(updated[0]);
                                    }}
                                    className="bg-white/95 hover:bg-white text-neutral-800 text-[8px] font-bold uppercase px-1 py-0.5 rounded cursor-pointer"
                                    title="Make Primary image"
                                  >
                                    ★ Front
                                  </button>
                                )}
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearImageInSlot(idx);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-sm cursor-pointer"
                                  title="Clear photo slot"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center m-auto text-center space-y-1">
                            <Plus className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-gray-300'}`} />
                            <span className="text-[8px] font-bold text-gray-400">ADD {idx === 0 ? 'FRONT' : `PICTURE`}</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[7px] bg-black/80 font-black px-1 py-0.2 text-white/90 rounded">
                          {idx === 0 ? 'MAIN' : `#${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sub Asset Action Drawer panel (dependent on selected slot) */}
                <div className="bg-neutral-50/50 border border-gray-200/80 rounded p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-700">
                      Configure asset media for <strong className="text-black">Picture #{activeImageSlot + 1}</strong> {activeImageSlot === 0 && '(Primary/Main Showcase Display)'}
                    </span>
                    {productImages[activeImageSlot] && (
                      <button
                        type="button"
                        onClick={() => handleClearImageInSlot(activeImageSlot)}
                        className="text-red-500 hover:text-red-700 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        ✕ Remove Photo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method A: Paste URL */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Method A: Web image url source</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/... or relative URL"
                        value={productImages[activeImageSlot] || ''}
                        onChange={(e) => handleApplyImageInSlot(e.target.value)}
                        className="w-full bg-white text-xs border border-gray-200 rounded p-2 focus:outline-none focus:border-black font-mono transition"
                      />
                    </div>

                    {/* Method B: Upload file */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Method B: Local computer upload</label>
                      <label className="w-full flex items-center justify-center bg-white hover:bg-neutral-50 border border-gray-200 rounded p-1.5 focus:outline-none text-xs font-semibold text-gray-700 cursor-pointer transition">
                        <span>Select image files (Multiple allowed)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const updated = [...productImages];
                              let currentIdx = activeImageSlot;
                              for (let i = 0; i < files.length; i++) {
                                if (currentIdx >= 5) break;
                                const file = files[i];
                                const base64 = await new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      resolve(reader.result);
                                    } else {
                                      resolve('');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                });
                                if (base64) {
                                  updated[currentIdx] = base64;
                                  currentIdx++;
                                }
                              }
                              setProductImages(updated);
                              if (updated[0]) {
                                setNewProdImageUrl(updated[0]);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>



                </div>
              </div>

              {/* Card 3: Squarespace Inventory & Logistics details */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Inventory & Logistics Settings</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Control stock holding and freight calculation specs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  {/* SKU Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[9.5px] font-black text-gray-500 uppercase">SKU (Stock Keeping Unit)</label>
                      {inventorySku && (
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider ${isSkuValid(inventorySku) ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isSkuValid(inventorySku) ? '✓ Valid Format' : '✗ Invalid Format'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. JER-CHIC-32-L"
                      value={inventorySku}
                      onChange={(e) => setInventorySku(e.target.value.toUpperCase())}
                      className={`w-full bg-white border rounded px-2.5 py-2 text-xs focus:ring-1 focus:outline-none font-bold font-mono transition ${
                        !inventorySku 
                          ? 'border-gray-200 focus:ring-black focus:border-black' 
                          : isSkuValid(inventorySku) 
                            ? 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/25' 
                            : 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/25'
                      }`}
                    />
                    {inventorySku && !isSkuValid(inventorySku) && (
                      <p className="text-[9.5px] text-rose-500 font-bold mt-1 leading-snug">
                        Must follow prefix-numeric-suffix format (e.g., QUX-450-XL).
                      </p>
                    )}
                  </div>

                  {/* Stock Limit Option (Unlimited vs numerical state) */}
                  <div>
                    <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1.5">Available Stock Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsUnlimitedQty(true)}
                        className={`flex-1 py-1.5 px-3 border rounded text-xs font-bold uppercase transition ${
                          isUnlimitedQty ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-250 hover:bg-gray-50'
                        }`}
                      >
                        Unlimited
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsUnlimitedQty(false)}
                        className={`flex-1 py-1.5 px-3 border rounded text-xs font-bold uppercase transition ${
                          !isUnlimitedQty ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-250 hover:bg-gray-50'
                        }`}
                      >
                        Set Limit
                      </button>
                    </div>

                    {!isUnlimitedQty && (
                      <input
                        type="number"
                        min={0}
                        placeholder="Stock limit (e.g., 30)"
                        value={inventoryQty}
                        onChange={(e) => setInventoryQty(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded mt-2 px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-black focus:outline-none animate-fade-in"
                      />
                    )}
                  </div>
                </div>

                {/* Weights and cargo dimensions */}
                <div className="space-y-2.5 pt-1">
                  <span className="block text-[10px] font-black text-neutral-800 uppercase tracking-wider">Weight & Dimensions (For Shipping Rates)</span>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Weight (lbs)</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.5"
                        value={inventoryWeight}
                        onChange={(e) => setInventoryWeight(e.target.value)}
                        className="w-full text-center bg-white border border-gray-200 rounded p-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Length (in)</label>
                      <input
                        type="text"
                        placeholder="e.g. 12"
                        value={inventoryLength}
                        onChange={(e) => setInventoryLength(e.target.value)}
                        className="w-full text-center bg-white border border-gray-200 rounded p-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Width (in)</label>
                      <input
                        type="text"
                        placeholder="e.g. 8"
                        value={inventoryWidth}
                        onChange={(e) => setInventoryWidth(e.target.value)}
                        className="w-full text-center bg-white border border-gray-200 rounded p-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Height (in)</label>
                      <input
                        type="text"
                        placeholder="e.g. 4"
                        value={inventoryHeight}
                        onChange={(e) => setInventoryHeight(e.target.value)}
                        className="w-full text-center bg-white border border-gray-200 rounded p-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Card 4: Product Options & Variants */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Product Options & Variants</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Allow buyers to choose multiple versions of this item, like sizes or colors.</p>
                </div>

                {/* Current options configured */}
                {productOptions.length > 0 ? (
                  <div className="space-y-3">
                    <span className="block text-[9.5px] font-black text-gray-500 uppercase">Product Options</span>
                    <div className="space-y-2">
                      {productOptions.map((opt) => (
                        <div key={opt.name} className="flex items-center justify-between bg-neutral-50 p-2.5 rounded border border-gray-200 text-xs text-slate-800">
                          <div>
                            <span className="font-bold text-neutral-800 uppercase text-[10px] mr-2">{opt.name}:</span>
                            <span className="text-gray-600 font-mono text-[11px] bg-white px-2 py-1 rounded border border-gray-150">
                              {opt.values.join(', ')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt.name)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase transition scale-95"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-lg p-5 text-center">
                    <p className="text-xs text-gray-400">No product options defined yet. Add options to automatically generate customizable variations.</p>
                  </div>
                )}

                {/* Add Option Trigger button and form */}
                {!showAddOptionForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddOptionForm(true)}
                    className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Color, Size, etc. Option</span>
                  </button>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded border border-gray-200 space-y-4 animate-fade-in text-xs">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                      <span className="font-black text-neutral-800 uppercase tracking-widest text-[9.5px]">Create Product Option</span>
                      <button
                        type="button"
                        onClick={() => setShowAddOptionForm(false)}
                        className="text-gray-400 hover:text-black cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 col-span-1 text-slate-800">
                      <div>
                        <label className="block text-[8.5px] font-bold text-gray-400 uppercase mb-1">Option Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Size, Color, Capacity"
                          value={newOptionName}
                          onChange={(e) => setNewOptionName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-black focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {['Size', 'Color', 'Material', 'Capacity'].map(sug => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setNewOptionName(sug)}
                              className="px-2 py-0.5 bg-white border border-gray-150 hover:border-gray-400 rounded text-[9.5px] text-gray-500 font-semibold cursor-pointer"
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8.5px] font-bold text-gray-400 uppercase mb-1">Comma-Separated Values</label>
                        <input
                          type="text"
                          placeholder="e.g. S, M, L or Red, Blue, Black"
                          value={newOptionValues}
                          onChange={(e) => setNewOptionValues(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-black focus:outline-none placeholder:text-gray-300"
                        />
                        <p className="text-[9px] text-gray-400 mt-1 leading-snug">Press comma (,) to separate values.</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="w-full py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-wide rounded text-[10px] transition cursor-pointer"
                      >
                        Generate Variants Combinations
                      </button>
                    </div>
                  </div>
                )}

                {/* Generated Combinations / Variants list */}
                {productVariants.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <span className="block text-[9.5px] font-black text-gray-500 uppercase">Interactive Variants List ({productVariants.length})</span>
                    <p className="text-[9.5px] text-gray-400">Configure custom selling prices (₦), stock limits, and unique SKUs for each variant combination.</p>
                    
                    <div className="overflow-x-auto max-w-full rounded border border-gray-150">
                      <table className="w-full text-xs text-left text-gray-500 font-sans divide-y divide-gray-100 table-auto min-w-[400px]">
                        <thead className="bg-[#fcfcfc] text-[9px] font-black uppercase text-neutral-700 tracking-wider">
                          <tr>
                            <th className="px-3 py-2 text-[8px]">Combination</th>
                            <th className="px-3 py-2 text-[8px] w-28">Price (₦)</th>
                            <th className="px-3 py-2 text-[8px] w-20">Stock</th>
                            <th className="px-3 py-2 text-[8px]">SKU Option</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {productVariants.map((v) => {
                            const titleStr = Object.entries(v.options).map(([k, val]) => `${k}: ${val}`).join(', ');
                            return (
                              <tr key={v.id} className="hover:bg-neutral-50/50">
                                <td className="px-3 py-1.5 font-bold text-neutral-800 text-[10px]">
                                  {titleStr}
                                </td>
                                <td className="px-3 py-1.5">
                                  <div className="relative">
                                    <span className="absolute left-1.5 top-1 text-gray-400 text-[10px]">₦</span>
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={(e) => handleUpdateVariantValue(v.id, 'price', e.target.value)}
                                      className="bg-white border border-gray-200 rounded pl-4 pr-1 py-1 text-left font-black text-neutral-900 text-[11px] w-full focus:outline-none focus:border-black"
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => handleUpdateVariantValue(v.id, 'stock', e.target.value)}
                                    className="bg-white border border-gray-200 rounded px-1.5 py-1 text-center font-bold text-gray-800 text-[11px] w-full focus:outline-none focus:border-black"
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    value={v.sku || ''}
                                    onChange={(e) => handleUpdateVariantValue(v.id, 'sku', e.target.value)}
                                    className="bg-white border border-gray-250 rounded px-1.5 py-1 text-left font-mono text-[10px] w-full focus:outline-none focus:border-black"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Sidebar controls/specifiers (5 cols out of 12) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card A: Financial Pricing Panel */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Financial Pricing</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Define sales costs and toggle promotional tags.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Retail Base Price */}
                  <div>
                    <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1">Regular Retail Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₦</span>
                      <input
                        type="number"
                        placeholder="18900"
                        value={newProdOldPrice}
                        onChange={(e) => setNewProdOldPrice(e.target.value)}
                        className="w-full bg-[#fcfcfc] border border-gray-200 rounded pl-7 pr-3 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none text-slate-400 transition"
                      />
                    </div>
                    <p className="text-[8px] text-gray-400 mt-0.5">Standard non-discounted catalog price.</p>
                  </div>

                  {/* Active Sale Price */}
                  <div>
                    <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1">Active Selling Price (₦)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-emerald-600">₦</span>
                      <input
                        type="number"
                        required
                        placeholder="14500"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded pl-7 pr-3 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none text-neutral-900 font-extrabold transition"
                      />
                    </div>
                    <p className="text-[8px] text-gray-400 mt-0.5">Real value billed to purchasing customers.</p>
                  </div>

                  {/* Dynamic discount calculator */}
                  {newProdPrice && newProdOldPrice && parseFloat(newProdOldPrice) > parseFloat(newProdPrice) && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded p-2.5 text-center text-emerald-800 text-[10.5px] font-bold animate-fade-in">
                      Promotional Discount Calculated: -{Math.round(((parseFloat(newProdOldPrice) - parseFloat(newProdPrice)) / parseFloat(newProdOldPrice)) * 100)}% on checkout!
                    </div>
                  )}

                  {/* On Sale switch representation */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-neutral-700">Display "On Sale" slash ribbon</span>
                    <button
                      type="button"
                      onClick={() => {
                        // toggle original pricing relative calculation
                        if (newProdPrice) {
                          const base = parseFloat(newProdPrice);
                          setNewProdOldPrice(newProdOldPrice ? '' : String(Math.round(base * 1.25)));
                        } else {
                          setNewProdOldPrice(newProdOldPrice ? '' : '15000');
                        }
                      }}
                      className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                        newProdOldPrice ? 'bg-neutral-800' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${
                        newProdOldPrice ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card B: Store visibility / approval toggles */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Storefront Visibility</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Control live directory exposure and queue approval status.</p>
                </div>

                {/* Squarespace classic selector button-tabs */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsApprovedDirectly(true)}
                      className={`w-full text-left p-3 rounded border text-xs flex justify-between items-center transition ${
                        isApprovedDirectly 
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-left font-serif">
                        <p className="text-xs uppercase font-sans tracking-wide">Public / Direct Publish</p>
                        <p className={`text-[10px] ${isApprovedDirectly ? 'text-white/70' : 'text-gray-400'}`}>Immediately visible to global commerce searches.</p>
                      </div>
                      {isApprovedDirectly && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsApprovedDirectly(false)}
                      className={`w-full text-left p-3 rounded border text-xs flex justify-between items-center transition ${
                        !isApprovedDirectly 
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="text-left font-serif">
                        <p className="text-xs uppercase font-sans tracking-wide">Save Draft (Pending)</p>
                        <p className={`text-[10px] ${!isApprovedDirectly ? 'text-white/70' : 'text-gray-400'}`}>Requires official review prior to storefront publish.</p>
                      </div>
                      {!isApprovedDirectly && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card C: Store Departments & Categorizations */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Categorization</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Assign item to specific department filters.</p>
                </div>

                <div>
                  <label className="block text-[9.5px] font-black text-gray-500 uppercase mb-1.5">Product Department</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-black focus:outline-none font-semibold text-neutral-800"
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

              {/* Card D: Marketing & Upsells bundling */}
              <div className="bg-white p-6 border border-gray-200 rounded shadow-xs space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-[#111] uppercase">Marketing Options</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Boost average order value via target bundling options.</p>
                </div>

                <div className="space-y-3.5 pt-1">
                  
                  {/* Toggle Add-ons upsell */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block leading-tight">Upsell Bundles</span>
                      <p className="text-[10px] text-gray-400 leading-snug">Present companion items on the checkout sheet.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddonModal(!showAddonModal)}
                      className="text-[10px] font-black tracking-wider text-[#7c3aed] uppercase border border-purple-200 bg-purple-50 px-2.5 py-1 rounded cursor-pointer transition hover:bg-purple-100"
                    >
                      {selectedAddons.length > 0 ? `LINKED (${selectedAddons.length})` : 'EDIT ADD-ONS'}
                    </button>
                  </div>

                  {showAddonModal && (
                    <div className="bg-[#fafafa] border border-gray-200 rounded p-2.5 space-y-2 mt-1 animate-fade-in grid grid-cols-2 gap-2">
                      {[
                        { id: 'co-ord-socks', label: 'Chicago Varsity Socks Set', price: '+ ₦1,800' },
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
                            className={`p-2 rounded border text-left flex flex-col justify-between transition-all select-none ${
                              isSel ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-xs font-bold' : 'bg-white border-gray-150 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-[9px] leading-tight block">{add.label}</span>
                            <span className="text-[9px] text-[#7c3aed] font-bold block mt-1">{add.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <hr className="border-gray-100" />

                  {/* Toggle Related items linking */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block leading-tight">Related Products</span>
                      <p className="text-[10px] text-gray-400 leading-snug">Attach relevant inventory suggestions below.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRelatedModal(!showRelatedModal)}
                      className="text-[10px] font-black tracking-wider text-[#7c3aed] uppercase border border-purple-200 bg-purple-50 px-2.5 py-1 rounded cursor-pointer transition hover:bg-purple-100"
                    >
                      {selectedRelated.length > 0 ? `LINKED (${selectedRelated.length})` : 'EDIT RELATED'}
                    </button>
                  </div>

                  {showRelatedModal && (
                    <div className="bg-[#fafafa] border border-gray-200 rounded p-2.5 mt-1 space-y-1.5 animate-fade-in">
                      <span className="block text-[8px] font-black text-gray-400 uppercase">Select items to correlate</span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {products.slice(0, 5).map((pr) => {
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
                              className={`w-full p-1.5 rounded text-left text-[10px] flex items-center justify-between border ${
                                isSel ? 'bg-purple-50 border-purple-200 text-[#7c3aed] font-bold' : 'bg-white border-gray-150'
                              }`}
                            >
                              <span className="truncate">{pr.name}</span>
                              <span className="text-gray-400 text-[9px] font-mono">₦{pr.price.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <hr className="border-gray-100" />

                  {/* Switch toggle featured product */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-neutral-700">Flag as Featured Listing</span>
                      <p className="text-[10px] text-gray-400">Position this product inside storefront banner layouts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                        isFeatured ? 'bg-neutral-800' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform duration-200 ${
                        isFeatured ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* General Submission Information Notification and Feedback messages */}
            <div className="lg:col-span-12 border-t border-gray-200 pt-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-red-700 text-xs font-bold animate-fade-in flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mb-3 text-emerald-800 text-xs font-bold animate-fade-in flex items-center gap-2">
                  <span className="animate-bounce">✓</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditorOpen(false);
                    setEditingProductId(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-neutral-800 text-xs font-black px-6 py-3 uppercase tracking-widest rounded transition cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black px-8 py-3 uppercase tracking-widest rounded transition flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Inventory...</span>
                    </>
                  ) : (
                    <span>Synchronize to Quxba Storefront</span>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Full-Screen Quality Verification Image Modal */}
      {fullscreenPreviewImage && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setFullscreenPreviewImage(null)} />
          <div className="relative z-10 max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setFullscreenPreviewImage(null)}
              className="absolute -top-14 right-2 sm:right-0 bg-white hover:bg-neutral-100 text-black px-4 py-2 rounded-full z-20 transition shadow-lg shrink-0 cursor-pointer font-black text-xs uppercase hover:scale-[1.02] active:scale-95"
            >
              Close Asset Preview ×
            </button>
            <div className="bg-white/5 p-1 rounded-xl shadow-2xl border border-white/10 max-w-full">
              <img
                src={fullscreenPreviewImage}
                alt="Quality Verification Preview"
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-white/80 text-[10px] font-bold mt-4 bg-white/10 border border-white/5 backdrop-blur-sm px-3.5 py-1.5 rounded uppercase tracking-widest leading-none">
              High-Fidelity Asset Quality Verification Mode
            </p>
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
