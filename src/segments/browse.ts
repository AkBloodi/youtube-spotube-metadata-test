import type { 
  SpotubePlaylistObject, 
  SpotubePaginationResponseObject,
  SpotubeTrackObject 
} from "@spotube-app/plugin"

export default class BrowseEndpoint {
  async featuredPlaylists(offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubePlaylistObject>> {
    return { items: [], total: 0, hasMore: false }
  }

  async newReleases(offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubePlaylistObject>> {
    return { items: [], total: 0, hasMore: false }
  }

  async categories(offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<any>> {
    return { items: [], total: 0, hasMore: false }
  }

  async category(id: string, offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubePlaylistObject>> {
    return { items: [], total: 0, hasMore: false }
  }

  async moods(offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<any>> {
    return { items: [], total: 0, hasMore: false }
  }
}