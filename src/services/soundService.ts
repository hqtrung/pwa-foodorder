'use client';

import { SoundSettings } from '@/types/order';

// Sound types for different notifications
export type SoundType = 'new_order' | 'status_change' | 'urgent_order' | 'test';

// Sound file mappings
const SOUND_FILES: Record<SoundType, string> = {
  new_order: '/sounds/new-order.mp3',
  status_change: '/sounds/status-change.mp3',
  urgent_order: '/sounds/urgent-order.mp3',
  test: '/sounds/new-order.mp3'
};

// Default sound settings
const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7,
  newOrder: true,
  statusChange: true,
  urgentOrder: true,
  soundPack: 'default'
};

class SoundService {
  private audioContext: AudioContext | null = null;
  private settings: SoundSettings = DEFAULT_SETTINGS;
  private audioBuffers: Map<SoundType, AudioBuffer> = new Map();
  private isInitialized = false;
  private pendingSounds: SoundType[] = [];

  constructor() {
    this.loadSettings();
    
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initializeOnUserInteraction();
    }
  }

  /**
   * Initialize audio context on first user interaction
   * Required for autoplay policy compliance
   */
  private initializeOnUserInteraction() {
    const initAudio = async () => {
      if (!this.isInitialized) {
        await this.initialize();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('keydown', initAudio);
  }

  /**
   * Initialize the audio context and preload sounds
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Preload all sound files
      await this.preloadSounds();
      
      this.isInitialized = true;
      console.log('Sound service initialized successfully');

      // Play any pending sounds
      this.playPendingSounds();

      return true;
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
      return false;
    }
  }

  /**
   * Preload all sound files into memory
   */
  private async preloadSounds(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises = Object.entries(SOUND_FILES).map(async ([soundType, filePath]) => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        
        this.audioBuffers.set(soundType as SoundType, audioBuffer);
        console.log(`Preloaded sound: ${soundType}`);
      } catch (error) {
        console.warn(`Failed to preload sound ${soundType}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Play a sound with the specified type
   */
  async playSound(type: SoundType, options: { volume?: number; loop?: boolean } = {}): Promise<boolean> {
    // Check if sounds are enabled
    if (!this.settings.enabled) {
      return false;
    }

    // Check specific sound type settings
    if (type === 'new_order' && !this.settings.newOrder) return false;
    if (type === 'status_change' && !this.settings.statusChange) return false;
    if (type === 'urgent_order' && !this.settings.urgentOrder) return false;

    // If not initialized, queue the sound
    if (!this.isInitialized) {
      this.pendingSounds.push(type);
      await this.initialize();
      return false;
    }

    if (!this.audioContext) {
      console.warn('Audio context not available');
      return false;
    }

    try {
      const audioBuffer = this.audioBuffers.get(type);
      if (!audioBuffer) {
        console.warn(`Sound buffer not found for type: ${type}`);
        return false;
      }

      // Create buffer source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      const volume = options.volume ?? this.settings.volume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      // Set loop if specified
      if (options.loop) {
        source.loop = true;
      }

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play sound
      source.start();
      
      console.log(`Played sound: ${type} at volume ${volume}`);
      return true;
    } catch (error) {
      console.error(`Failed to play sound ${type}:`, error);
      return false;
    }
  }

  /**
   * Play any sounds that were queued before initialization
   */
  private playPendingSounds(): void {
    while (this.pendingSounds.length > 0) {
      const soundType = this.pendingSounds.shift();
      if (soundType) {
        this.playSound(soundType);
      }
    }
  }

  /**
   * Play notification sound based on order event
   */
  async playOrderNotification(
    type: 'new_order' | 'status_change' | 'urgent_order',
    options: { volume?: number } = {}
  ): Promise<boolean> {
    return await this.playSound(type, options);
  }

  /**
   * Test sound playback
   */
  async testSound(type: SoundType = 'test'): Promise<boolean> {
    return await this.playSound(type, { volume: this.settings.volume });
  }

  /**
   * Update sound settings
   */
  updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current sound settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Check if audio is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           (!!window.AudioContext || !!(window as any).webkitAudioContext);
  }

  /**
   * Check if service is ready to play sounds
   */
  isReady(): boolean {
    return this.isInitialized && !!this.audioContext && this.audioBuffers.size > 0;
  }

  /**
   * Get audio context state
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'not-initialized';
  }

  /**
   * Resume audio context (useful for user interaction handlers)
   */
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('foodorder-sound-settings');
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('foodorder-sound-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffers.clear();
    this.isInitialized = false;
    this.pendingSounds = [];
  }
}

// Export singleton instance
export const soundService = new SoundService();

// Export class for testing
export { SoundService };