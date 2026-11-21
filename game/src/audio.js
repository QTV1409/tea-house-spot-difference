// All sound is synthesised with WebAudio: short oscillator notes, no audio files,
// no network. The game creates the context on the first user gesture.

export function createAudio() {
  let context = null;
  let enabled = true;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function note(frequency, startAt, length, type, volume) {
    const audio = ensure();
    if (audio === null || !enabled) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + length);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(audio.currentTime + startAt);
    oscillator.stop(audio.currentTime + startAt + length + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    get enabled() {
      return enabled;
    },
    click() {
      note(660, 0, 0.07, 'triangle', 0.12);
    },
    find() {
      // A bright two-note chime when a difference is found.
      note(880, 0, 0.16, 'sine', 0.22);
      note(1318.5, 0.07, 0.22, 'sine', 0.18);
    },
    wrong() {
      // A soft low buzz for a click on empty picture.
      note(160, 0, 0.18, 'sawtooth', 0.08);
    },
    hint() {
      note(1174.7, 0, 0.12, 'sine', 0.14);
      note(1568, 0.08, 0.16, 'sine', 0.12);
    },
    levelClear() {
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        note(frequency, index * 0.09, 0.22, 'triangle', 0.18);
      });
    },
    gameOver() {
      [392, 329.63, 261.63].forEach((frequency, index) => {
        note(frequency, index * 0.12, 0.25, 'triangle', 0.15);
      });
    },
  };
}
