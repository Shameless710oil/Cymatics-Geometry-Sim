export class AudioController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  public audioElement: HTMLAudioElement | null = null;

  // Beat Detection State
  private bassHistory: number[] = [];
  private lastBeatTime: number = 0;

  constructor() {}

  async setupMicrophone(): Promise<void> {
    if (this.audioContext) await this.cleanup(); // Ensure clean state
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.analyser = this.audioContext.createAnalyser();
    // Use 2048 to get 1024 frequency bins. High resolution.
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async setupFile(file: File): Promise<void> {
    if (this.audioContext) await this.cleanup();

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048; // Consistent with mic
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.audioElement = new Audio();
    this.audioElement.src = URL.createObjectURL(file);
    this.audioElement.loop = true;
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  play() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    this.audioElement?.play();
  }

  pause() {
    this.audioElement?.pause();
  }

  getAnalysis() {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Calculate broad ranges
      // SKIP BIN 0 (0-21Hz) to avoid DC offset / hardware noise (the "charging port" issue)
      const bass = this.getAverageVolume(1, 8);   // ~20Hz - 170Hz
      const mid = this.getAverageVolume(8, 100);  // ~170Hz - 2kHz
      const treble = this.getAverageVolume(100, 300); // ~2kHz - 6kHz
      
      // --- Beat Detection Logic ---
      
      // 1. Maintain history of bass energy to determine "local average"
      if (this.bassHistory.length > 20) this.bassHistory.shift();
      this.bassHistory.push(bass);
      
      const avgLocalBass = this.bassHistory.reduce((a, b) => a + b, 0) / this.bassHistory.length;
      
      // 2. Detect Beat
      // A beat is when current bass is significantly higher than recent average
      // AND above a noise floor (40/255)
      let beat = 0;
      const now = Date.now();
      
      // Threshold 1.4x means a 40% spike over average
      if (bass > 40 && bass > avgLocalBass * 1.4) {
        // Prevent double-triggering too fast
        if (now - this.lastBeatTime > 200) { 
           beat = 1.0;
           this.lastBeatTime = now;
        }
      }
      
      // Decay beat value for visual smoothness if needed, 
      // but for now we return impulsive 1 or 0, or normalized spike
      // Let's return a "pulse" strength
      const pulse = Math.max(0, (bass - avgLocalBass) / 128);

      return {
        raw: this.dataArray,
        bass: bass / 255,
        mid: mid / 255,
        treble: treble / 255,
        beat: beat > 0 ? beat : pulse, // Return a strong value on beat, or the pulse otherwise
        average: avgLocalBass / 255
      };
    }
    return { raw: new Uint8Array(0), bass: 0, mid: 0, treble: 0, beat: 0, average: 0 };
  }

  private getAverageVolume(start: number, end: number) {
    if (!this.dataArray) return 0;
    let sum = 0;
    let count = 0;
    // Bounds check
    const safeEnd = Math.min(end, this.dataArray.length);
    for (let i = start; i < safeEnd; i++) {
      sum += this.dataArray[i];
      count++;
    }
    return count > 0 ? sum / count : 0;
  }

  async cleanup() {
    this.audioElement?.pause();
    this.audioElement?.remove();
    this.audioElement = null;
    
    this.source?.disconnect();
    this.source = null;
    
    this.analyser?.disconnect();
    this.analyser = null;
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.dataArray = null;
    this.bassHistory = [];
  }
}

export const audioController = new AudioController();