'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Volume2, VolumeX, Play } from 'lucide-react';
import { StoreSettings } from '@/types';

interface HeroSectionProps {
  settings: StoreSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-espresso-950 text-ivory">
      {/* Cinematic Background Video with Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster={settings.hero_poster_url}
          className="w-full h-full object-cover object-center scale-105 transform filter brightness-75 contrast-105"
        >
          <source src={settings.hero_video_url} type="video/mp4" />
          {/* Fallback image */}
          <img
            src={settings.hero_poster_url}
            alt="DEE BAKES Signature Shawarma"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Cinematic Multi-layered Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/40 to-espresso-950/70" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-espresso-950/30 to-espresso-950/80" />
      </div>

      {/* Video Control Pills */}
      <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2">
        <button
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-ivory/80 hover:text-white hover:bg-black/60 transition-all border border-white/10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32 flex flex-col items-center">
        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-caramel/25 backdrop-blur-md border border-caramel/40 text-sand text-xs uppercase tracking-[0.25em] font-medium mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-caramel" />
          <span>Artisan Food & Bakery Experience</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ivory max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
          {settings.hero_headline}
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-ivory/80 max-w-2xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700">
          {settings.hero_subheadline}
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-caramel hover:bg-caramel-600 text-ivory font-semibold text-base tracking-wide transition-all shadow-lg hover:shadow-caramel-glow flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Explore Our Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/custom-cakes"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-ivory font-semibold text-base tracking-wide border border-ivory/20 hover:border-ivory/40 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-sand" />
            <span>Order Custom Cakes</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-ivory/70 w-full max-w-3xl">
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-sand">100%</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60 mt-0.5">Freshly Prepared</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-sand">Express</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60 mt-0.5">Lagos Delivery</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-sand">Direct Transfer</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60 mt-0.5">Instant Verification</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg font-bold text-sand">Artisan</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/60 mt-0.5">Handcrafted With Love</span>
          </div>
        </div>
      </div>

      {/* Elegant Scroll Down Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-widest uppercase text-ivory/60">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-ivory/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-caramel rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
