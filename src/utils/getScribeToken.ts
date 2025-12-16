/**
 * Generate a single-use token for Scribe v2 Realtime
 * Note: This is a client-side implementation for demo purposes only.
 * In production, this should be done on the server to protect your API key.
 */
export async function getScribeToken(apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to generate token: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating Scribe token:', error);
    throw error;
  }
}
