/**
 * React Native / Hermes has no `crypto.subtle`, so @supabase/auth-js falls back to PKCE "plain"
 * and logs a warning. This wires SHA-256 via expo-crypto before Supabase client loads.
 */
import 'react-native-get-random-values';
import * as ExpoCrypto from 'expo-crypto';

const g = globalThis as typeof globalThis & { crypto?: Crypto };

if (typeof g.crypto === 'undefined') {
  g.crypto = {} as Crypto;
}

if (typeof g.crypto.getRandomValues !== 'function') {
  g.crypto.getRandomValues = ExpoCrypto.getRandomValues.bind(ExpoCrypto) as typeof g.crypto.getRandomValues;
}

if (!g.crypto.subtle || typeof g.crypto.subtle.digest !== 'function') {
  g.crypto.subtle = {
    async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
      const name = typeof algorithm === 'string' ? algorithm : (algorithm as { name: string }).name;
      if (name !== 'SHA-256') {
        throw new DOMException('Not supported', 'NotSupportedError');
      }
      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
    },
  } as SubtleCrypto;
}
