import type { MusicPresetId } from "@/lib/media-utils";

interface SynthNote {
  freq: number;
  duration: number;
  gain: number;
}

const PRESET_PATTERNS: Record<
  Exclude<MusicPresetId, "">,
  {
    wave: OscillatorType;
    stepMs: number;
    notes: ReadonlyArray<SynthNote>;
  }
> = {
  "piano-lembut": {
    wave: "triangle",
    stepMs: 950,
    notes: [
      { freq: 261.63, duration: 1.5, gain: 0.08 }, // C4
      { freq: 329.63, duration: 1.4, gain: 0.07 }, // E4
      { freq: 392.0, duration: 1.6, gain: 0.07 }, // G4
      { freq: 493.88, duration: 1.7, gain: 0.06 }, // B4
      { freq: 440.0, duration: 1.5, gain: 0.07 }, // A4
      { freq: 349.23, duration: 1.4, gain: 0.07 }, // F4
      { freq: 329.63, duration: 1.6, gain: 0.07 }, // E4
      { freq: 293.66, duration: 1.7, gain: 0.07 }, // D4
    ],
  },
  "kotak-musik": {
    wave: "sine",
    stepMs: 680,
    notes: [
      { freq: 523.25, duration: 1.2, gain: 0.06 }, // C5
      { freq: 659.25, duration: 1.1, gain: 0.05 }, // E5
      { freq: 783.99, duration: 1.2, gain: 0.05 }, // G5
      { freq: 659.25, duration: 1.0, gain: 0.05 }, // E5
      { freq: 587.33, duration: 1.2, gain: 0.06 }, // D5
      { freq: 698.46, duration: 1.1, gain: 0.05 }, // F5
      { freq: 659.25, duration: 1.2, gain: 0.05 }, // E5
      { freq: 523.25, duration: 1.4, gain: 0.06 }, // C5
    ],
  },
  "akustik-hangat": {
    wave: "sine",
    stepMs: 1100,
    notes: [
      { freq: 220.0, duration: 1.8, gain: 0.08 }, // A3
      { freq: 329.63, duration: 1.6, gain: 0.06 }, // E4
      { freq: 293.66, duration: 1.8, gain: 0.07 }, // D4
      { freq: 369.99, duration: 1.6, gain: 0.06 }, // F#4
      { freq: 246.94, duration: 1.8, gain: 0.08 }, // B3
      { freq: 392.0, duration: 1.6, gain: 0.06 }, // G4
      { freq: 293.66, duration: 1.8, gain: 0.07 }, // D4
      { freq: 329.63, duration: 1.9, gain: 0.06 }, // E4
    ],
  },
};

export interface PresetSynthController {
  start: () => Promise<boolean>;
  stop: () => void;
  dispose: () => void;
}

export function createPresetSynth(
  presetId: Exclude<MusicPresetId, "">
): PresetSynthController {
  let audioContext: AudioContext | null = null;
  let timerId: number | null = null;
  let stepIndex = 0;

  const pattern = PRESET_PATTERNS[presetId];

  const triggerNote = (ctx: AudioContext, note: SynthNote) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = pattern.wave;
    osc.frequency.setValueAtTime(note.freq, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(note.gain, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + note.duration + 0.05);
  };

  const stop = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
    if (audioContext && audioContext.state === "running") {
      void audioContext.suspend();
    }
  };

  const start = async (): Promise<boolean> => {
    if (typeof window === "undefined") {
      return false;
    }

    const AudioCtxCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtxCtor) {
      return false;
    }

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioCtxCtor();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (timerId !== null) {
      window.clearInterval(timerId);
    }

    const playNext = () => {
      if (!audioContext || audioContext.state !== "running") {
        return;
      }
      const note = pattern.notes[stepIndex % pattern.notes.length];
      if (note) {
        triggerNote(audioContext, note);
      }
      stepIndex += 1;
    };

    playNext();
    timerId = window.setInterval(playNext, pattern.stepMs);
    return true;
  };

  const dispose = () => {
    stop();
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
    audioContext = null;
  };

  return { start, stop, dispose };
}
