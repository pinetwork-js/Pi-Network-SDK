/**
 * Generate UUID for transferts
 * @returns The generated UUID
 */
export function generateUUID(): string {
  let timestamp = new Date().getTime()
  const uuidTemplate = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

  return uuidTemplate.replace(/[xy]/g, letter => {
    const randomNumber = (timestamp + 16 * Math.random()) % 16 | 0
    timestamp = Math.floor(timestamp / 16)

    return (letter === 'x' ? randomNumber : (3 & randomNumber) | 8).toString(16)
  })
}
