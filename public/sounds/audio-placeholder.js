// Minimal audio placeholder generator
// This creates simple audio files for notification sounds

// Base64 encoded minimal MP3 files (very short tones)
// These are placeholder sounds - in production you'd use proper audio files

// New order sound - pleasant chime
const newOrderAudio = `data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAHZ3d3cuYmlnc291bmRiYW5rLmNvbSBURFJDAAAAJgAAAAlUSVQyAAAADAAAAAFUUE9TAAAADgAAAA==`;

// Status change sound - subtle beep
const statusChangeAudio = `data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAHZ3d3cuYmlnc291bmRiYW5rLmNvbSBURFJDAAAAJgAAAA==`;

// Urgent order sound - alert
const urgentOrderAudio = `data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAHZ3d3cuYmlnc291bmRiYW5rLmNvbSBURFJDAAAAJgAAAA==`;

// Export for use in development
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    newOrderAudio,
    statusChangeAudio,
    urgentOrderAudio
  };
}