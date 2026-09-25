// ======================================================
// CITYPULSE SECURITY ALARM UTILITY
// ======================================================

let audioContext = null;
let oscillator = null;
let gainNode = null;

// ======================================================
// Initialize Alarm Audio
// ======================================================

export const initializeAlarmAudio = async () => {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      console.warn(
        "Web Audio API is not supported."
      );

      return false;
    }

    if (!audioContext) {
      audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return true;
  } catch (error) {
    console.error(
      "Failed to initialize alarm audio:",
      error
    );

    return false;
  }
};

// ======================================================
// Start Alarm
// ======================================================

export const startSecurityAlarm = async () => {
  try {
    // Prevent duplicate alarm instances
    if (oscillator) {
      return;
    }

    const initialized =
      await initializeAlarmAudio();

    if (!initialized || !audioContext) {
      return;
    }

    oscillator =
      audioContext.createOscillator();

    gainNode =
      audioContext.createGain();

    oscillator.type = "square";

    oscillator.frequency.setValueAtTime(
      880,
      audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(
      0.08,
      audioContext.currentTime
    );

    oscillator.connect(gainNode);

    gainNode.connect(
      audioContext.destination
    );

    oscillator.start();

    console.log(
      "🚨 Security alarm activated"
    );
  } catch (error) {
    console.error(
      "Failed to start security alarm:",
      error
    );

    oscillator = null;
    gainNode = null;
  }
};

// ======================================================
// Stop Alarm
// ======================================================

export const stopSecurityAlarm = () => {
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();

      oscillator = null;
    }

    if (gainNode) {
      gainNode.disconnect();

      gainNode = null;
    }

    console.log(
      "🔕 Security alarm stopped"
    );
  } catch (error) {
    console.error(
      "Failed to stop security alarm:",
      error
    );

    oscillator = null;
    gainNode = null;
  }
};

// ======================================================
// Check Alarm Status
// ======================================================

export const isSecurityAlarmRunning = () => {
  return oscillator !== null;
};

// ======================================================
// Destroy Alarm Audio
// ======================================================

export const destroySecurityAlarm = async () => {
  try {
    stopSecurityAlarm();

    if (audioContext) {
      await audioContext.close();

      audioContext = null;
    }
  } catch (error) {
    console.error(
      "Failed to destroy alarm audio:",
      error
    );

    audioContext = null;
  }
};

// ======================================================
// Backward-Compatible Aliases
// ======================================================

// If your existing components use these names,
// they will continue to work.

export const initializeAlarm = initializeAlarmAudio;

export const startAlarm = startSecurityAlarm;

export const stopAlarm = stopSecurityAlarm;