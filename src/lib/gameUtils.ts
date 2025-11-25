export async function loadWords(): Promise<string[]> {
  try {
    const response = await fetch('/words.csv');
    const text = await response.text();
    const lines = text.trim().split('\n');
    const words = lines.slice(1).filter(line => line.trim());
    return words;
  } catch (error) {
    console.error('Error loading words:', error);
    return ['apple', 'ocean', 'mountain', 'coffee', 'music'];
  }
}

export function getRandomWord(words: string[], excludeWord?: string): string {
  const availableWords = excludeWord
    ? words.filter(w => w !== excludeWord)
    : words;

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}