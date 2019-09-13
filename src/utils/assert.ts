export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    const fullMessage = message ? `ASSERT (${message})` : 'ASSERT';
    throw new AssertionError(fullMessage);
  }
}
