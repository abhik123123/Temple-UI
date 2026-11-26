import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'temple.audio';
const TARGET_VOLUME = 0.6;
const FADE_MS = 1200;

// A recording of the chant is used when public/audio/om-namah-shivaya.mp3 exists;
// otherwise the browser falls back to the generated Om drone.
const SOURCES = ['/audio/om-namah-shivaya.mp3', '/audio/om-drone.mp3'];

const readPref = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};
const writePref = (value) => {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* storage unavailable */ }
};

const SpeakerOn = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
const SpeakerOff = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M16 9l6 6M22 9l-6 6" />
  </svg>
);

/**
 * Floating Om Namah Shivaya button, shown on every page. Browsers only allow
 * sound after the visitor interacts, so it starts muted; once turned on, the
 * choice is remembered and the chant resumes on the visitor's next tap.
 */
export default function TempleAudio() {
  const { t } = useLanguage();
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const fadeTo = useCallback((target, done) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearInterval(fadeRef.current);
    const start = audio.volume;
    const began = performance.now();
    fadeRef.current = setInterval(() => {
      const k = Math.min(1, (performance.now() - began) / FADE_MS);
      audio.volume = start + (target - start) * k;
      if (k === 1) {
        clearInterval(fadeRef.current);
        if (done) done();
      }
    }, 40);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      audio.volume = 0;
      await audio.play();
      setPlaying(true);
      fadeTo(TARGET_VOLUME);
      return true;
    } catch {
      return false; // blocked until the visitor interacts
    }
  }, [fadeTo]);

  const stop = useCallback(() => {
    setPlaying(false);
    fadeTo(0, () => audioRef.current?.pause());
  }, [fadeTo]);

  const toggle = () => {
    if (playing) {
      writePref('off');
      stop();
    } else {
      writePref('on');
      play();
    }
  };

  // Visitor turned it on before: start now, or on their first tap anywhere.
  useEffect(() => {
    if (readPref() !== 'on') return undefined;
    let cancelled = false;
    const resume = () => {
      if (!cancelled && readPref() === 'on') play();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    play().then((ok) => {
      if (!ok && !cancelled) {
        window.addEventListener('pointerdown', resume, { once: true });
        window.addEventListener('keydown', resume, { once: true });
      }
    });
    return () => { cancelled = true; cleanup(); };
  }, [play]);

  useEffect(() => () => clearInterval(fadeRef.current), []);

  const label = playing ? t('audio_mute') : t('audio_play');

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- instrumental/chant ambience, no speech to caption */}
      <audio ref={audioRef} loop preload="none">
        {SOURCES.map((src) => <source key={src} src={src} type="audio/mpeg" />)}
      </audio>
      <button
        type="button"
        className={`temple-audio${playing ? ' is-playing' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={label}
        title={label}
      >
        {playing ? <SpeakerOn /> : <SpeakerOff />}
        <span className="temple-audio__text">{t('audio_om')}</span>
      </button>
    </>
  );
}
