
class AudioEngine {
  ctx: AudioContext | null = null;
  isEnabled: boolean = false;
  isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContext();
            this.isEnabled = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
  }

  // Resume context if suspended (browser policy)
  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
        this.resume();
    }
  }

  // UI Click: Crisp, short, non-intrusive (Buttons)
  playClick() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    // Slightly lower pitch start, faster decay for a "premium" feel
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Tap/Thud: Soft, grounded (Card selection)
  playTap() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine'; // Changed from triangle to sine for softness
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Tick: Extremely short, high-precision click (Slider)
  playTick() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    // Do not force resume here to prevent stutter during rapid sliding
    if (this.ctx.state === 'suspended') return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Sine wave prevents the harsh digital "buzz" of a square wave
    osc.type = 'sine';
    
    // A sharp pitch drop creates a "click" transient without needing high volume
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.01);
    
    // Very low gain, extremely short duration
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  // Mechanical Shutter: Soft, analogue cloth shutter (Leica-style)
  playShutter() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    
    // 1. Low Frequency Resonance (The Body Thud)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(180, t); 
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1); 
    
    // Softer attack to avoid click, heavier sustain
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);

    // 2. Mechanism Friction (The "Chhh") - Warm/Soft
    const bufferSize = this.ctx.sampleRate * 0.1; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    // Lowpass filter drastically reduces "metallic" high end
    // 600Hz is very warm/muffled
    filter.type = 'lowpass';
    filter.frequency.value = 600; 
    filter.Q.value = 0.8;

    noiseGain.gain.setValueAtTime(0.25, t); // Slightly louder noise for texture
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // A low-pitched mechanical thwack (film advance lever)
  playAdvance() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // 1. Mechanical "Thwack" (Pitch Down)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.03);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);

    // 2. Latch Noise (Weight)
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    // Lowpass filter for weight
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; 

    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noise.start(t);
  }

  // Success: Major Chord (Ethereal)
  playSuccess() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    
    // Softened attack and release
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = now + i * 0.04; // Faster arpeggio
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.2);
    });
  }

  // Failure/Dissonance
  playDissonance() {
    if (!this.isEnabled || !this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    
    // Diminished/Dissonant cluster
    [200, 210, 190].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle'; // Softer than sawtooth
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq - 30, now + 0.4);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    });
  }

  triggerHaptic(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
          navigator.vibrate(pattern);
      } catch (e) {
          // Ignore haptic errors
      }
    }
  }
}

export const audio = new AudioEngine();
