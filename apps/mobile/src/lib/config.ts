const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is required");
}

export const apiUrl = rawApiUrl.replace(/\/$/, "");
