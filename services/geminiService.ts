import { GoogleGenAI } from "@google/genai";
import { SearchResult, Movie } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateWithRetry = async (params: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      const isInternalError = 
        error.status === 500 || 
        error.status === 503 || 
        (error.message && error.message.includes("Internal error"));

      if (isInternalError && i < retries - 1) {
        const delay = 1000 * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached");
};

/**
 * Clean JSON string from Markdown code blocks
 */
const cleanJsonString = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

/**
 * Feature 1: Theatrical & Critical Hits (Last Month)
 */
export const searchTheatricalHits = async (month: string, year: number): Promise<SearchResult> => {
  const prompt = `
    Find a list of movies released in ${month} ${year} that are critically acclaimed OR box office hits.
    
    CRITICAL INSTRUCTIONS:
    1. Search for: English, Malayalam, Tamil, Telugu, and Hindi movies.
    2. Criteria: High ratings, commercial success, or high discussion on Reddit.
    3. Output: A strict JSON array of objects.
    
    JSON Format:
    [
      {
        "title": "Movie Title",
        "language": "Language",
        "releaseDate": "YYYY-MM-DD",
        "status": "Blockbuster/Hit/Critical Darling",
        "rottenTomatoes": "90% or N/A",
        "imdb": "8.0/10 or N/A",
        "availability": "Theaters or Specific OTT Name",
        "summary": "Short summary",
        "redditVibe": "What redditors are saying",
        "director": "Director Name",
        "cast": ["Actor 1", "Actor 2", "Actor 3"]
      }
    ]

    Do not add any text outside the JSON.
  `;

  const response = await generateWithRetry({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = cleanJsonString(response.text || "[]");
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  try {
    const movies = JSON.parse(text) as Movie[];
    return { movies, groundingChunks };
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return { movies: [], groundingChunks };
  }
};

/**
 * Feature 2: Fresh on OTT (Last 30 Days)
 */
export const searchNewOTTReleases = async (): Promise<SearchResult> => {
  const prompt = `
    Find a list of movies that were newly released on streaming platforms (Netflix, Prime, Disney+, Hotstar, SonyLIV, SunNXT, ManoramaMax) in the last 30 days.
    
    CRITICAL INSTRUCTIONS:
    1. Filter for Quality: Only include movies with good reviews (RT > 70% or IMDb > 7.0) or massive audience hype.
    2. Output: A strict JSON array of objects.
    
    JSON Format:
    [
      {
        "title": "Movie Title",
        "language": "Language",
        "releaseDate": "YYYY-MM-DD",
        "status": "Fresh on OTT",
        "rottenTomatoes": "Score",
        "imdb": "Score",
        "availability": "Specific OTT Platform Name",
        "summary": "Short summary",
        "redditVibe": "Reaction to OTT release",
        "director": "Director Name",
        "cast": ["Actor 1", "Actor 2", "Actor 3"]
      }
    ]

    Do not add any text outside the JSON.
  `;

  const response = await generateWithRetry({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = cleanJsonString(response.text || "[]");
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  try {
    const movies = JSON.parse(text) as Movie[];
    return { movies, groundingChunks };
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return { movies: [], groundingChunks };
  }
};

/**
 * Feature 3: Check Availability Updates for Watchlist
 */
export const checkWatchlistUpdates = async (watchlist: Movie[]): Promise<Movie[]> => {
  if (watchlist.length === 0) return [];

  const titles = watchlist.map(m => `${m.title} (${m.language})`).join(", ");
  
  const prompt = `
    I have a watchlist of movies: ${titles}.
    For each movie, find out WHERE it is currently available to watch (Theaters or specific OTT platform).
    
    Output a strict JSON array of objects with the updated availability.
    [
      {
        "title": "Movie Title",
        "availability": "Updated Platform or Theaters"
      }
    ]
  `;

  const response = await generateWithRetry({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = cleanJsonString(response.text || "[]");
  
  try {
    const updates = JSON.parse(text) as {title: string, availability: string}[];
    
    // Merge updates back into watchlist objects
    return watchlist.map(movie => {
      const update = updates.find(u => u.title.toLowerCase().includes(movie.title.toLowerCase()) || movie.title.toLowerCase().includes(u.title.toLowerCase()));
      if (update) {
        return { ...movie, availability: update.availability, lastUpdated: new Date().toISOString() };
      }
      return movie;
    });
  } catch (e) {
    console.error("Failed to parse updates", e);
    return watchlist;
  }
};