export default class UserEndpoint {
  me(): Promise<any> {
    return Promise.resolve({ id: "", name: "", email: "" })
  }

  playlists(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  savedTracks(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  savedAlbums(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  savedArtists(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  followedArtists(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  topTracks(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }

  topArtists(offset?: number, limit?: number): Promise<any> {
    return Promise.resolve({ items: [], total: 0, hasMore: false })
  }
}