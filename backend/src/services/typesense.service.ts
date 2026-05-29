import { Client } from 'typesense';
import { env } from '../config/env';

class TypesenseService {
  private client: Client;
  private isOnline: boolean = false;
  private hasInitialized: boolean = false;

  constructor() {
    this.client = new Client({
      nodes: [
        {
          host: env.TYPESENSE_HOST,
          port: env.TYPESENSE_PORT,
          protocol: env.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: env.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    });
  }

  /**
   * Initializes the mentorship_sessions collection in Typesense if it doesn't already exist.
   * Runs in a safe try-catch so that if Typesense is offline, server startup is not blocked.
   */
  async initCollection() {
    if (this.hasInitialized) return this.isOnline;
    this.hasInitialized = true;

    try {
      console.log('Connecting to Typesense server...');
      // Check health
      await this.client.health.retrieve();
      this.isOnline = true;
      console.log('Typesense server is online.');

      // Check if collection exists
      const collections = await this.client.collections().retrieve();
      const exists = collections.some((c) => c.name === 'mentorship_sessions');

      if (!exists) {
        console.log('Creating mentorship_sessions collection schema in Typesense...');
        await this.client.collections().create({
          name: 'mentorship_sessions',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'skills', type: 'string[]' },
            { name: 'duration', type: 'string' },
            { name: 'mentor_name', type: 'string' },
            { name: 'headline', type: 'string', optional: true },
          ],
        });
        console.log('Typesense collection schema created.');
      }
    } catch (error) {
      this.isOnline = false;
      console.warn('Typesense is offline or unreachable. Search will use PostgreSQL fallback queries.', (error as Error).message);
    }

    return this.isOnline;
  }

  /**
   * Index or update a mentorship session document in Typesense
   */
  async indexSession(session: {
    id: string | number;
    title: string;
    skills: string[];
    duration: string;
    mentor_name: string;
    headline?: string;
  }) {
    const online = await this.initCollection();
    if (!online) return;

    try {
      const document = {
        id: session.id.toString(),
        title: session.title,
        skills: session.skills || [],
        duration: session.duration,
        mentor_name: session.mentor_name,
        headline: session.headline || '',
      };

      await this.client
        .collections('mentorship_sessions')
        .documents()
        .upsert(document);
      console.log(`Typesense: Indexed session ID ${session.id}`);
    } catch (error) {
      console.warn(`Typesense: Failed to index session ID ${session.id}:`, (error as Error).message);
    }
  }

  /**
   * Delete a mentorship session document from Typesense
   */
  async deleteSession(sessionId: string | number) {
    const online = await this.initCollection();
    if (!online) return;

    try {
      await this.client
        .collections('mentorship_sessions')
        .documents(sessionId.toString())
        .delete();
      console.log(`Typesense: Deleted session ID ${sessionId}`);
    } catch (error) {
      console.warn(`Typesense: Failed to delete session ID ${sessionId}:`, (error as Error).message);
    }
  }

  /**
   * Search for mentorship sessions using a query string.
   * Returns an array of matching session IDs or null if Typesense is offline/errors.
   */
  async searchSessions(searchQuery: string): Promise<string[] | null> {
    const online = await this.initCollection();
    if (!online) return null;

    if (!searchQuery || searchQuery.trim() === '') {
      return [];
    }

    try {
      const searchParameters = {
        q: searchQuery,
        query_by: 'title,skills,mentor_name,headline',
        prefix: true,
      };

      const searchResults = await this.client
        .collections('mentorship_sessions')
        .documents()
        .search(searchParameters);

      const ids = (searchResults.hits || []).map((hit) => (hit.document as any).id as string);
      return ids;
    } catch (error) {
      console.warn('Typesense search failed. Falling back to DB search.', (error as Error).message);
      return null;
    }
  }
}

export const typesenseService = new TypesenseService();
