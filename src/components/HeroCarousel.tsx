import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Gift, Percent, Calendar, Sparkles } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { isSupabaseEnabled, supabase, supabaseGetAdverts } from '../supabase';
import { Advertisement } from '../types';
import clearanceMegaSaleImage from '../assets/images/clearance_mega_sale_1780330738754.png';

interface HeroCarouselProps {
  onSelectCategory: (category: string) => void;
}

const resolveBgGradient = (color: string) => {
  if (!color) return 'from-purple-700 via-violet-500 to-fuchsia-400';
  if (color.startsWith('from-')) return color;
  
  switch (color.toLowerCase()) {
    case 'indigo':
    case 'blue':
      return 'from-blue-700 via-indigo-600 to-purple-600';
    case 'emerald':
    case 'green':
      return 'from-emerald-700 via-teal-600 to-cyan-600';
    case 'orange':
    case 'red':
      return 'from-orange-600 via-red-500 to-amber-500';
    case 'midnight':
    case 'dark':
      return 'from-neutral-950 via-neutral-900 to-gray-800';
    case 'fuchsia':
    case 'pink':
      return 'from-fuchsia-700 via-pink-600 to-rose-500';
    case 'purple':
    default:
      return 'from-purple-700 via-violet-500 to-fuchsia-400';
  }
};

export default function HeroCarousel({ onSelectCategory }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customAdverts, setCustomAdverts] = useState<Advertisement[]>([]);

  // 1. Fetch custom advertisements in real-time
  useEffect(() => {
    if (isSupabaseEnabled) {
      const fetchSupabaseAdverts = async () => {
        try {
          const ads = await supabaseGetAdverts();
          setCustomAdverts(ads);
        } catch (e) {
          console.warn("Supabase fetch adverts error:", e);
        }
      };

      fetchSupabaseAdverts();

      const channel = supabase
        .channel('adverts-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'adverts' },
          () => {
            fetchSupabaseAdverts();
          }
        )
        .subscribe();

      const altChannel = supabase
        .channel('advertisements-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'advertisements' },
          () => {
            fetchSupabaseAdverts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(altChannel);
      };
    }

    const q = query(collection(db, 'adverts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ads: Advertisement[] = [];
      snapshot.forEach((docSnap) => {
        ads.push({ id: docSnap.id, ...docSnap.data() } as Advertisement);
      });
      setCustomAdverts(ads);
    }, (error) => {
      console.warn("Adverts subscription warning (offline / guest permission check):", error);
    });

    return () => unsubscribe();
  }, []);

  const defaultSlides = [
    {
      id: 'anniversary-sale',
      title: 'Quxba Anniversary Mega Sale is Live! 🌟',
      subtitle: 'Up to 60% OFF Top Electronics, Home Appliances, Tech & Fashion',
      buttonText: 'SHOP THE SALE',
      badge: 'ANNIVERSARY CELEBRATION',
      image: clearanceMegaSaleImage,
      bgColor: 'from-purple-700 via-violet-500 to-fuchsia-400',
      action: () => onSelectCategory('Electronics & Appliances')
    }
  ];

  // Convert custom advertisements to slides style
  const formattedCustomSlides = customAdverts.map(ad => ({
    id: ad.id,
    title: ad.title,
    subtitle: ad.subtitle,
    buttonText: ad.buttonText || 'VIEW DEALS',
    badge: ad.badge || 'PROMOTION',
    image: ad.imageUrl,
    videoUrl: ad.videoUrl,
    bgColor: resolveBgGradient(ad.bgColor),
    action: () => onSelectCategory(ad.category || 'All Categories')
  }));

  // Combine, putting custom customAdverts first so they see their changes on top, then fallbacks
  const slides = formattedCustomSlides.length > 0 
    ? [...formattedCustomSlides, ...defaultSlides] 
    : defaultSlides;

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (slides.length === 0) return 0;
        return (prev + 1) % slides.length;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-100" id="anniversary-hero">
      <div className="relative h-[220px] sm:h-[300px] md:h-[400px] w-full transition-all duration-700 ease-in-out">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full flex items-stretch transition-opacity duration-1000 cursor-pointer ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onClick={slide.action}
          >
            {/* Slide Banner Graphics - Expanded to full width */}
            <div className="w-full h-full relative select-none overflow-hidden bg-purple-50">
              {slide.videoUrl ? (
                <video
                  src={slide.videoUrl}
                  className="w-full h-full object-cover object-center"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Slide Selectors */}
      {slides.length > 1 && (
        <>
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
        </>
      )}

      {/* Circle slide count markers */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? 'bg-[#7c3aed] w-6' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

