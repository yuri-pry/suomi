import { createContext, useContext } from 'react';
import type { Lang } from '../lib/types';
import type { Speaker } from '../lib/speech';
import { haptic } from '../lib/haptics';
import { splitWords } from '../lib/words';

/** The device's Finnish voice, or null when it has none. */
export const SpeakerContext = createContext<Speaker | null>(null);

/** Finnish text whose words can be tapped to hear them. Other text, or a device with no voice, gets plain text. */
export function Speakable({ text, lang }: { text: string; lang: Lang }) {
  const speaker = useContext(SpeakerContext);
  if (lang !== 'fi' || !speaker) return <>{text}</>;
  return (
    <>
      {splitWords(text).map((part, i) =>
        part.word ? (
          <button
            key={i}
            type="button"
            className="word"
            onClick={() => {
              haptic('tap');
              speaker.speak(part.text);
            }}
          >
            {part.text}
          </button>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
