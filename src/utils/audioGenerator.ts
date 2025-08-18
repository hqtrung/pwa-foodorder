'use client';

/**
 * Generate audio data for notification sounds
 * This creates simple tone-based sounds as placeholders
 */

export interface AudioTone {
  frequency: number;
  duration: number;
  volume: number;
}

export class AudioGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Generate a simple tone
   */
  generateTone(frequency: number, duration: number, volume: number = 0.5): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Simple sine wave with fade in/out
      const fadeTime = 0.1; // 100ms fade
      let envelope = 1;
      
      if (t < fadeTime) {
        envelope = t / fadeTime;
      } else if (t > duration - fadeTime) {
        envelope = (duration - t) / fadeTime;
      }
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * volume * envelope;
    }

    return buffer;
  }

  /**
   * Generate a pleasant chime sound (for new orders)
   */
  generateChime(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a pleasant chord: C, E, G
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Envelope for pleasant fade
      const envelope = Math.exp(-t * 3) * (t < 0.1 ? t / 0.1 : 1);
      
      // Add harmonics
      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t) * envelope;
      }
      
      data[i] = sample * 0.3; // Reduce volume
    }

    return buffer;
  }

  /**
   * Generate an urgent alert sound
   */
  generateUrgentAlert(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.2;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Create urgency with frequency modulation
      const baseFreq = 800;
      const modFreq = 10; // 10 Hz modulation
      const frequency = baseFreq + 200 * Math.sin(2 * Math.PI * modFreq * t);
      
      // Envelope with multiple pulses
      const pulseFreq = 4; // 4 pulses per second
      const pulse = Math.abs(Math.sin(2 * Math.PI * pulseFreq * t));
      const envelope = pulse * Math.exp(-t * 1.5);
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }

    return buffer;
  }

  /**
   * Generate a subtle status change sound
   */
  generateStatusChange(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Simple ascending notes
      const frequency = 600 + (t * 200); // 600Hz to 800Hz
      const envelope = Math.exp(-t * 8);
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return buffer;
  }

  /**
   * Create and download audio file (for development)
   */
  async createAudioFile(audioBuffer: AudioBuffer, filename: string): Promise<void> {
    if (!audioBuffer) return;

    // Convert AudioBuffer to WAV
    const wav = this.audioBufferToWav(audioBuffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Convert AudioBuffer to WAV format
   */
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }

  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export function to generate all notification sounds
export async function generateNotificationSounds(): Promise<void> {
  const generator = new AudioGenerator();
  
  // Generate different sounds
  const chime = generator.generateChime();
  const urgent = generator.generateUrgentAlert();
  const statusChange = generator.generateStatusChange();
  
  if (chime) await generator.createAudioFile(chime, 'new-order.wav');
  if (urgent) await generator.createAudioFile(urgent, 'urgent-order.wav');
  if (statusChange) await generator.createAudioFile(statusChange, 'status-change.wav');
  
  generator.dispose();
}