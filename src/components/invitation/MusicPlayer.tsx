"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { isTrustedMediaUrl } from "@/lib/config-schema";
import { isValidMusicPreset } from "@/lib/media-utils";
import type { PresetSynthController } from "@/lib/preset-synth";

export interface MusicPlayerHandle {
  start: () => void;
}

interface MusicPlayerProps {
  ref?: Ref<MusicPlayerHandle>;
  musicUrl: string;
  musicPreset: string;
  isOpened: boolean;
}

export function MusicPlayer({
  ref,
  musicUrl,
  musicPreset,
  isOpened,
}: MusicPlayerProps) {
  const rawTrimmedUrl = musicUrl.trim();
  const trimmedUrl =
    rawTrimmedUrl.length > 0 && isTrustedMediaUrl(rawTrimmedUrl)
      ? rawTrimmedUrl
      : "";
  const validPreset = isValidMusicPreset(musicPreset) ? musicPreset : null;
  const hasMusic = trimmedUrl.length > 0 || validPreset !== null;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<PresetSynthController | null>(null);
  const shouldResumeOnVisibleRef = useRef(false);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthRef.current) {
      synthRef.current.stop();
    }
    setIsPlaying(false);
  };

  const startPlayback = () => {
    if (!hasMusic) {
      return;
    }

    if (trimmedUrl.length > 0) {
      if (!audioRef.current || audioRef.current.src !== trimmedUrl) {
        audioRef.current?.pause();
        const audio = new window.Audio(trimmedUrl);
        audio.loop = true;
        audio.volume = 0.7;
        audio.preload = "none";
        audioRef.current = audio;
      }

      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
      return;
    }

    if (validPreset) {
      if (synthRef.current) {
        void synthRef.current.start().then((started) => {
          setIsPlaying(started);
        });
        return;
      }

      void import("@/lib/preset-synth")
        .then(({ createPresetSynth }) => {
          const controller = createPresetSynth(validPreset);
          synthRef.current = controller;
          return controller.start();
        })
        .then((started) => {
          setIsPlaying(started);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  useImperativeHandle(ref, () => ({
    start: startPlayback,
  }));

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          shouldResumeOnVisibleRef.current = true;
          stopPlayback();
        }
      } else if (shouldResumeOnVisibleRef.current) {
        shouldResumeOnVisibleRef.current = false;
        startPlayback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [trimmedUrl, validPreset]);

  if (!hasMusic || !isOpened) {
    return null;
  }

  const handleToggle = () => {
    if (isPlaying) {
      shouldResumeOnVisibleRef.current = false;
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Matikan musik latar" : "Putar musik latar"}
      title={isPlaying ? "Matikan musik" : "Putar musik"}
      className="fixed right-4 bottom-5 z-40 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{
        backgroundColor: isPlaying
          ? "var(--color-primary)"
          : "var(--color-background)",
        borderColor: "var(--color-primary)",
        color: isPlaying ? "var(--color-background)" : "var(--color-primary)",
      }}
    >
      {isPlaying ? (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
}
