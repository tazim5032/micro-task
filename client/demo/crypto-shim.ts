// Browser stand-in for Node's `crypto` (randomUUID / randomBytes) in the live demo build.
export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

export function randomBytes(n: number) {
  const a = new Uint8Array(n);
  globalThis.crypto.getRandomValues(a);
  // Behaves like a Buffer for `.toString('hex')` and stays array-like for bcryptjs.
  (a as any).toString = () => Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
  return a as Uint8Array & { toString(enc?: string): string };
}

export default { randomUUID, randomBytes };
