// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Bounded HTTP client for read-only API calls.
 * No credentials, no mutation, no upstream code execution.
 */
export async function fetchJson(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.name = 'FetchError';
    throw error;
  }
  return response.json();
}
