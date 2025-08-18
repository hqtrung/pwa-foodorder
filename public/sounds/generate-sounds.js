// Simple script to generate notification sounds using Web Audio API
// Run this in a browser console to download generated audio files

function generateTone(frequency, duration, volume = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
  
  return audioContext;
}

// Generate pleasant bell sound (C major chord)
function generateNewOrderSound() {
  generateTone(523.25, 0.8); // C5
  setTimeout(() => generateTone(659.25, 0.6), 100); // E5
  setTimeout(() => generateTone(783.99, 0.4), 200); // G5
}

// Generate subtle notification
function generateStatusChangeSound() {
  generateTone(800, 0.2);
}

// Generate urgent alert
function generateUrgentSound() {
  for(let i = 0; i < 3; i++) {
    setTimeout(() => {
      generateTone(1000, 0.15);
      setTimeout(() => generateTone(1200, 0.15), 200);
    }, i * 600);
  }
}

console.log('Sound generation functions loaded. Call:');
console.log('- generateNewOrderSound() for new order chime');
console.log('- generateStatusChangeSound() for status change beep'); 
console.log('- generateUrgentSound() for urgent alert');