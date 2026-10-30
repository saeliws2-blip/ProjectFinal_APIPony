export function createBattleMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  master.gain.value = 0.12;
  filter.connect(master);
  master.connect(context.destination);

  const drones = [55, 82.41].map((frequency, index) => {
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = index ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    volume.gain.value = index ? 0.18 : 0.34;
    oscillator.connect(volume);
    volume.connect(filter);
    oscillator.start();
    return oscillator;
  });

  const notes = [110, 116.54, 98, 87.31, 98, 116.54];
  let noteIndex = 0;
  const playNote = () => {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(notes[noteIndex % notes.length], now);
    oscillator.frequency.exponentialRampToValueAtTime(notes[noteIndex % notes.length] * 0.72, now + 1.35);
    volume.gain.setValueAtTime(0.001, now);
    volume.gain.exponentialRampToValueAtTime(0.16, now + 0.12);
    volume.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    oscillator.connect(volume);
    volume.connect(filter);
    oscillator.start(now);
    oscillator.stop(now + 1.45);
    noteIndex += 1;
  };

  playNote();
  const timer = window.setInterval(playNote, 1550);
  void context.resume();

  return {
    stop() {
      window.clearInterval(timer);
      drones.forEach((oscillator) => oscillator.stop());
      void context.close();
    },
  };
}
