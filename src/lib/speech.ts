/** Pure so it can be tested: pick a Finnish voice from whatever the device offers. */
export function finnishVoice<T extends { lang: string }>(voices: T[]): T | null {
  // Exact "fi" or "fi-XX": a plain prefix test would also match Filipino ("fil").
  return voices.find((v) => /^fi([-_]|$)/i.test(v.lang)) ?? null;
}

/**
 * Resolves with a Finnish voice, or null when the device has none.
 * Browsers fill the voice list asynchronously, so wait for it briefly.
 */
export function loadFinnishVoice(timeoutMs = 1500): Promise<SpeechSynthesisVoice | null> {
  if (typeof speechSynthesis === 'undefined') return Promise.resolve(null);
  const now = finnishVoice(speechSynthesis.getVoices());
  if (now) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      speechSynthesis.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(finnishVoice(speechSynthesis.getVoices()));
    };
    const timer = setTimeout(done, timeoutMs);
    speechSynthesis.addEventListener('voiceschanged', done);
  });
}

export function speak(text: string, voice: SpeechSynthesisVoice) {
  speechSynthesis.cancel(); // a replay should restart, not queue behind the first one
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.9;
  speechSynthesis.speak(utterance);
}
