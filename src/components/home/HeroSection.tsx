'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Film,
  CheckCircle2,
} from 'lucide-react';
import { StoreSettings } from '@/types';

interface HeroSectionProps {
  settings: StoreSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // High-resolution signature shawarma poster image
  const posterUrl =
    settings.hero_poster_url || '/images/hero-shawarma-cinematic.jpg';
  const videoUrl = settings.hero_video_url || '/videos/hero-shawarma.mp4';

  useEffect(() => {
    // Attempt auto-play when mounted
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser autoplay policy might pause until user interaction
            setIsPlaying(false);
          });
      }
    }
  }, [videoUrl]);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-espresso-950 text-ivory">
      {/* =========================================================================
          CINEMATIC FOOD COMMERCIAL BACKDROP
          ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
        {/* Layer 1: Photorealistic Luxury Shawarma Poster Image with Ambient Zoom */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[12000ms] ease-out scale-105 hover:scale-110 ${
            videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url(${posterUrl})`,
            backgroundPosition: 'center 45%',
          }}
          role="img"
          aria-label="Freshly prepared artisan shawarma sliced open with juicy grilled meat, fresh vegetables and creamy sauce"
        />

        {/* Layer 2: Seamless Autoplaying Background Video */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            poster={posterUrl}
            onLoadedData={() => {
              setVideoLoaded(true);
              setVideoError(false);
            }}
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => {
              // Gracefully switch to the ultra-high resolution cinematic poster
              setVideoError(true);
              setVideoLoaded(false);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src="/videos/hero-shawarma.mp4" type="video/mp4" />
          </video>
        )}

        {/* Layer 3: Warm Lighting & Luxury Restaurant Cinematography Gradients */}
        {/* Top-to-bottom dark vignette for razor-sharp typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/45 to-espresso-950/75 pointer-events-none" />

        {/* Radial perimeter vignette focusing viewer eyes on the central food action */}
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            background:
              'radial-gradient(circle at center, transparent 35%, rgba(22, 13, 11, 0.65) 75%, rgba(22, 13, 11, 0.95) 100%)',
          }}
        />

        {/* Subtle warm amber/caramel glow to accentuate sizzling meats and dripping sauces */}
        <div className="absolute inset-0 bg-radial-gradient from-caramel/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          CINEMATIC CONTROLS (Sound & Playback)
          ========================================================================= */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        {/* Video / Cinematography Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-medium text-ivory/80 shadow-sm">
          <Film className="w-3.5 h-3.5 text-caramel" />
          <span>Cinematic Food Showcase</span>
        </div>

        {/* Play / Pause Toggle */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-ivory/80 hover:text-white hover:bg-black/60 transition-all border border-white/10 shadow-sm"
          title={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Audio Mute / Unmute Toggle */}
        <button
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-ivory/80 hover:text-white hover:bg-black/60 transition-all border border-white/10 shadow-sm flex items-center gap-1.5"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400 hidden md:inline">
                Sound On
              </span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          HERO CONTENT CONTAINER
          ========================================================================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32 flex flex-col items-center">
        {/* Brand Kicker Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-caramel/25 backdrop-blur-md border border-caramel/40 text-sand text-xs uppercase tracking-[0.25em] font-medium mb-6 shadow-warm animate-in fade-in slide-in-from-bottom-3 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-caramel" />
          <span>Artisan Food & Bakery Experience</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ivory max-w-4xl leading-[1.1] text-balance drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {settings.hero_headline}
        </h1>

        {/* Supporting Subheadline */}
        <p className="mt-6 text-base sm:text-xl text-ivory/90 max-w-2xl font-light leading-relaxed drop-shadow animate-in fade-in slide-in-from-bottom-5 duration-700">
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
        <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-ivory/80 w-full max-w-3xl">
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg sm:text-xl font-bold text-sand">100%</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/70 mt-0.5">
              Freshly Prepared
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg sm:text-xl font-bold text-sand">Express</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/70 mt-0.5">
              Lagos Delivery
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg sm:text-xl font-bold text-sand">Direct Transfer</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/70 mt-0.5">
              Instant Verification
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-serif text-lg sm:text-xl font-bold text-sand">Artisan</span>
            <span className="text-[11px] uppercase tracking-wider text-ivory/70 mt-0.5">
              Handcrafted With Love
            </span>
          </div>
        </div>
      </div>

      {/* Elegant Animated Scroll Down Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] tracking-widest uppercase text-ivory/70">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-ivory/30 flex items-start justify-center p-1">
          <div className="w-1 h-2 bg-caramel rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
