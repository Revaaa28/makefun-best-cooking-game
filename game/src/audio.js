// Every sound in the game is synthesised with WebAudio — no audio files, no network,
// just oscillators and filtered noise. The kitchen sizzles, chops, dings and cheers.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  /** Create the context on the first user gesture; browsers forbid audio before one. */
  unlock() {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctor) return;
      this.context = new Ctor();
    } catch {
      this.context = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  tone(freq, seconds, type, gainValue, when = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(this.context.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  noise(seconds, filterFreq, gainValue, when = 0) {
    if (!this.context || this.muted) return;
    const t0 = this.context.currentTime + when;
    const length = Math.max(1, Math.floor(this.context.sampleRate * seconds));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.context.createGain();
    gain.gain.value = gainValue;
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start(t0);
  }

  pickup() { this.tone(520, 0.09, 'sine', 0.12); }
  place() { this.tone(330, 0.08, 'triangle', 0.12); this.noise(0.05, 900, 0.05); }
  chop() { this.noise(0.07, 1400, 0.22); this.tone(180, 0.06, 'square', 0.08); }
  grillOn() { this.noise(0.25, 3200, 0.10); }
  ding() { this.tone(880, 0.35, 'sine', 0.16); this.tone(1318, 0.4, 'sine', 0.10, 0.08); }
  serve() {
    this.tone(523, 0.12, 'triangle', 0.16);
    this.tone(659, 0.12, 'triangle', 0.16, 0.1);
    this.tone(784, 0.22, 'triangle', 0.18, 0.2);
  }
  error() { this.tone(160, 0.16, 'sawtooth', 0.10); }
  trash() { this.noise(0.18, 500, 0.14); }
  tick() { this.tone(980, 0.05, 'square', 0.05); }
  rush() {
    this.tone(392, 0.14, 'triangle', 0.16);
    this.tone(523, 0.14, 'triangle', 0.16, 0.13);
    this.tone(659, 0.2, 'triangle', 0.16, 0.26);
  }
  fanfare() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.16, i * 0.12));
  }

  /** A looping grill hiss while at least one patty cooks; call every frame, it is cheap. */
  updateSizzle(cooking) {
    if (!this.context || this.muted) return;
    if (cooking && !this.sizzleNodes) {
      const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = this.context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4200;
      const gain = this.context.createGain();
      gain.gain.value = 0.028;
      source.connect(filter).connect(gain).connect(this.context.destination);
      source.start();
      this.sizzleNodes = { source, gain };
    } else if (!cooking && this.sizzleNodes) {
      this.stopSizzle();
    }
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try { this.sizzleNodes.source.stop(); } catch { /* already stopped */ }
    this.sizzleNodes = null;
  }
}
