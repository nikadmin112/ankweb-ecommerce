"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export function OfferCarousel() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || offers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, offers.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="h-40 sm:h-48 md:h-56 flex items-center justify-center">
            <div className="text-zinc-500">Loading offers...</div>
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Carousel container */}
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div key={offer.id} className="min-w-full">
              <a
                href={offer.link || '#'}
                onClick={!offer.link ? (e) => e.preventDefault() : undefined}
                className="block relative h-40 sm:h-48 md:h-56 bg-zinc-900 border border-zinc-800 overflow-hidden"
              >
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  priority={currentIndex === 0}
                  loading={currentIndex === 0 ? undefined : 'lazy'}
                  quality={90}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-center px-6">
                  <div className="z-10">
                    <h3 className="mb-1 text-2xl font-bold text-white sm:text-3xl">{offer.title}</h3>
                    <p className="text-lg text-white/90 sm:text-xl">{offer.description}</p>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-lg transition-all hover:bg-white hover:scale-110"
          aria-label="Previous offer"
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-lg transition-all hover:bg-white hover:scale-110"
          aria-label="Next offer"
        >
          <ChevronRight className="h-5 w-5 text-gray-800" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="mt-3 flex justify-center gap-1.5">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-gray-800' : 'w-1.5 bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
