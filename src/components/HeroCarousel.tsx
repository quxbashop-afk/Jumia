import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Gift, Percent, Calendar, Sparkles } from 'lucide-react';

interface HeroCarouselProps {
  onSelectCategory: (category: string) => void;
}

export default function HeroCarousel({ onSelectCategory }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'anniversary-sale',
      title: 'Quxba Anniversary Mega Sale is Live! 🌟',
      subtitle: 'Up to 60% OFF Top Electronics, Home Appliances, Tech & Fashion',
      buttonText: 'SHOP THE SALE',
      badge: 'ANNIVERSARY CELEBRATION',
      image: '/src/assets/images/jumia_anniversary_hero_1779974244611.png',
      bgColor: 'from-purple-700 via-violet-500 to-fuchsia-400',
      action: () => onSelectCategory('Electronics & Appliances')
    },
    {
      id: 'electronics-clearance',
      title: 'Premium Home Electronics & Cooling Solutions ❄️',
      subtitle: 'Premium Smart Refrigerators & Turbo-charge Air Conditioners with full warranty',
      buttonText: 'BROWSE COOLING DEALS',
      badge: 'EXPRESS COLDTECH',
      image: '/src/assets/images/refrigerator_product_1779974264736.png',
      bgColor: 'from-blue-700 via-indigo-600 to-purple-600',
      action: () => onSelectCategory('Electronics & Appliances')
    },
    {
      id: 'supermarket-stock',
      title: 'Weekly Supermarket & Groceries Restock 🥦',
      subtitle: 'Cooking Oils, Cereal packs, Grains, Cosmetics & Household essentials',
      buttonText: 'RESTOCK NOW',
      badge: 'BEST PRICE GUARANTEE',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      bgColor: 'from-emerald-700 via-teal-600 to-cyan-600',
      action: () => onSelectCategory('Supermarket & Groceries')
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-100" id="anniversary-hero">
      <div className="relative h-[280px] sm:h-[350px] md:h-[450px] w-full transition-all duration-700 ease-in-out">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-stretch transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Slide Information */}
            <div className={`w-full md:w-[45%] bg-gradient-to-br ${slide.bgColor} text-white p-8 md:p-12 flex flex-col justify-center items-start relative overflow-hidden`}>
              {/* Background Shapes */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                <Gift className="w-64 h-64" />
              </div>
              
              <span className="bg-white/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.badge}
              </span>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight leading-tight mb-3">
                {slide.title}
              </h1>
              
              <p className="text-sm sm:text-base text-purple-50/90 mb-6 max-w-sm line-clamp-2 md:line-clamp-none">
                {slide.subtitle}
              </p>
              
              <button
                onClick={slide.action}
                className="bg-white hover:bg-purple-50 text-gray-900 font-bold px-6 py-3 rounded-md text-sm shadow-md transition-all active:scale-95 duration-150 inline-flex items-center gap-2"
              >
                <span>{slide.buttonText}</span>
              </button>
            </div>

            {/* Slide Banner Graphics or Woman walking through port image */}
            <div className="w-full md:w-[55%] relative select-none overflow-hidden bg-purple-50 min-h-[140px] md:min-h-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-transparent to-transparent h-20 md:hidden" />
            </div>
          </div>
        ))}
      </div>

      {/* Manual Slide Selectors */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-20 hover:scale-105 active:scale-95 transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-20 hover:scale-105 active:scale-95 transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Circle slide count markers */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-[#7c3aed] w-6' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
