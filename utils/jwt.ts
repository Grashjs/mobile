/* eslint-disable no-bitwise */
import { decode as decodeLib, encode as encodeLib } from 'base-64';

export const JWT_SECRET = 'Grash4785@jk';
export const JWT_EXPIRES_IN = 3600 * 24 * 2;

export const sign = (
  payload: Record<string, any>,
  privateKey: string,
  header: Record<string, any>
) => {
  const now = new Date();
  header.expiresIn = new Date(now.getTime() + header.expiresIn);
  const encodedHeader = encodeLib(JSON.stringify(header));
  const encodedPayload = encodeLib(JSON.stringify(payload));
  const signature = encodeLib(
    Array.from(encodedPayload)
      .map((item: string, key) =>
        String.fromCharCode(
          item.charCodeAt(0) ^ privateKey[key % privateKey.length].charCodeAt(0)
        )
      )
      .join('')
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const decode = (token: string): any => {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  const header = JSON.parse(decodeLib(encodedHeader));
  const payload = JSON.parse(decodeLib(encodedPayload));
  const now = new Date();

  if (now < header.expiresIn) {
    throw new Error('Expired token');
  }

  const verifiedSignature = encodeLib(
    Array.from(encodedPayload)
      .map((item, key) =>
        String.fromCharCode(
          item.charCodeAt(0) ^ JWT_SECRET[key % JWT_SECRET.length].charCodeAt(0)
        )
      )
      .join('')
  );

  if (verifiedSignature !== signature) {
    throw new Error('Invalid signature');
  }

  return payload;
};

export const verify = (
  token: string,
  privateKey: string
): Record<string, any> => {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  const header = JSON.parse(decodeLib(encodedHeader));
  const payload = JSON.parse(decodeLib(encodedPayload));
  const now = new Date();

  if (now < header.expiresIn) {
    throw new Error('The token is expired!');
  }

  const verifiedSignature = encodeLib(
    Array.from(encodedPayload)
      .map((item, key) =>
        String.fromCharCode(
          item.charCodeAt(0) ^ privateKey[key % privateKey.length].charCodeAt(0)
        )
      )
      .join('')
  );

  if (verifiedSignature !== signature) {
    //TODO
    //throw new Error('The signature is invalid!');
  }

  return payload;
};
