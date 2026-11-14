/**
 * Splits text into words and the text between them, so each word can be tapped and heard.
 * A blank (___) and punctuation are not words. Hyphens, apostrophes and colons stay inside a word (EU:ssa, vaa'an).
 */
export function splitWords(text: string): { text: string; word: boolean }[] {
  return text
    .split(/([\p{L}\p{N}]+(?:[-'’:][\p{L}\p{N}]+)*)/u)
    .map((part, i) => ({ text: part, word: i % 2 === 1 })) // split puts the captured words at odd positions
    .filter((part) => part.text !== '');
}
