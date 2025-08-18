// Simple audio file generator for notifications
// Run this in a browser console to generate audio files

function generateTone(frequency, duration, sampleRate = 44100) {
  const samples = Math.floor(duration * sampleRate);
  const buffer = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const fadeTime = 0.05; // 50ms fade
    let envelope = 1;
    
    if (t < fadeTime) {
      envelope = t / fadeTime;
    } else if (t > duration - fadeTime) {
      envelope = (duration - t) / fadeTime;
    }
    
    buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
  }
  
  return buffer;
}

function bufferToWav(buffer, sampleRate = 44100) {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return arrayBuffer;
}

function downloadAudio(buffer, filename) {
  const wav = bufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Generate notification sounds
console.log('Generating notification sounds...');

// New order - pleasant chime (C major chord)
const newOrderBuffer = new Float32Array(44100 * 0.8);
const frequencies = [523.25, 659.25, 783.99]; // C, E, G
for (let i = 0; i < newOrderBuffer.length; i++) {
  const t = i / 44100;
  const envelope = Math.exp(-t * 3);
  let sample = 0;
  for (const freq of frequencies) {
    sample += Math.sin(2 * Math.PI * freq * t) * envelope;
  }
  newOrderBuffer[i] = sample * 0.1;
}

// Status change - simple beep
const statusBuffer = generateTone(800, 0.3);

// Urgent order - warbling alarm
const urgentBuffer = new Float32Array(44100 * 1.2);
for (let i = 0; i < urgentBuffer.length; i++) {
  const t = i / 44100;
  const freq = 700 + 300 * Math.sin(2 * Math.PI * 5 * t);
  const envelope = Math.exp(-t * 2) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 3 * t));
  urgentBuffer[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
}

// Download the files
downloadAudio(newOrderBuffer, 'new-order.wav');
downloadAudio(statusBuffer, 'status-change.wav');
downloadAudio(urgentBuffer, 'urgent-order.wav');

console.log('Audio files generated and downloaded!');