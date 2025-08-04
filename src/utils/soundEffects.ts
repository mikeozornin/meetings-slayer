// Утилита для звуковых эффектов
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // Инициализируем AudioContext только при первом использовании
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported');
      this.isEnabled = false;
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    return { oscillator, gainNode };
  }

  playExplosion() {
    if (!this.audioContext || !this.isEnabled) return;

    // Создаем несколько осцилляторов для более богатого звука
    const frequencies = [200, 300, 400, 600];
    const duration = 0.3;

    frequencies.forEach((freq, index) => {
      const { oscillator, gainNode } = this.createOscillator(freq, 'square') || {};
      if (!oscillator || !gainNode) return;

      const startTime = this.audioContext!.currentTime + index * 0.05;
      
      gainNode.gain.setValueAtTime(0.1, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  playBounce() {
    if (!this.audioContext || !this.isEnabled) return;

    const { oscillator, gainNode } = this.createOscillator(800, 'sine') || {};
    if (!oscillator || !gainNode) return;

    const duration = 0.1;
    const startTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0.05, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  playLaunch() {
    if (!this.audioContext || !this.isEnabled) return;

    const { oscillator, gainNode } = this.createOscillator(400, 'sawtooth') || {};
    if (!oscillator || !gainNode) return;

    const duration = 0.2;
    const startTime = this.audioContext.currentTime;

    oscillator.frequency.setValueAtTime(200, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, startTime + duration);

    gainNode.gain.setValueAtTime(0.1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    console.log(`🔊 Sound ${this.isEnabled ? 'ENABLED' : 'DISABLED'}`);
  }

  isSoundEnabled() {
    return this.isEnabled;
  }
}

export const soundManager = new SoundManager(); 