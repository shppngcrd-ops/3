/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const BACKEND_URL = 'https://ais-dev-laf744sbs5oooqekyl2mla-61846893738.asia-east1.run.app';

export function getApiUrl(path: string): string {
  if (path.startsWith('/api/')) {
    const host = window.location.hostname;
    const isLocalOrContainer = 
      host.includes('localhost') || 
      host.includes('127.0.0.1') || 
      host.includes('asia-east1.run.app');
      
    if (!isLocalOrContainer) {
      return `${BACKEND_URL}${path}`;
    }
  }
  return path;
}

export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let finalInput = input;
  if (typeof input === 'string') {
    finalInput = getApiUrl(input);
  }
  return fetch(finalInput, init);
};
