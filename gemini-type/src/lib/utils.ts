export const calculateWPM = (correctChars: number, duration: number) => {
  if (duration === 0) return 0
  const minutes = duration / 60
  const words = correctChars / 5 // Standard is 5 chars per word
  return Math.round(words / minutes)
}

export const calculateAccuracy = (correctChars: number, totalTyped: number) => {
  if (totalTyped === 0) return 100
  return Math.round((correctChars / totalTyped) * 100)
}
