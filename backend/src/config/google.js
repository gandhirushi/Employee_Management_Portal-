import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token (JWT) sent from the frontend
 * @param {string} idToken
 * @returns {Promise<import("google-auth-library").TokenPayload>}
 */
export async function verifyGoogleToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId || undefined,
  });

  return ticket.getPayload();
}

export default googleClient;

