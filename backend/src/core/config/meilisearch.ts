import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';
dotenv.config();

export const meiliClient = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey', // Change this to match your MeiliSearch master key
});

export const EVENTS_INDEX = 'events';

export const initMeilisearch = async () => {
  try {
    // Check if the index exists, if not, it will be created automatically upon adding documents.
    // However, we can update settings like searchable attributes and filtering attributes.
    await meiliClient.index(EVENTS_INDEX).updateSettings({
      searchableAttributes: ['title', 'description'],
      filterableAttributes: ['event_type', 'location_type'],
      sortableAttributes: ['start_time']
    });
    console.log(`[MeiliSearch] Configured settings for ${EVENTS_INDEX} index.`);
  } catch (error) {
    console.error('[MeiliSearch] Initialization error:', error);
  }
};
