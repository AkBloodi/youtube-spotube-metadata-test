import type { 
  SpotubeArtistObject, 
  SpotubeFullArtistObject,
  SpotubePaginationResponseObject,
  SpotubeAlbumObject,
  SpotubeTrackObject
} from "@spotube-app/plugin"

export default class ArtistEndpoint {
  async getArtist(id: string): Promise<SpotubeFullArtistObject> {
    const data = await this.request("browse", { browseId: id })
    const header = data.header?.musicImmersiveHeaderRenderer || data.header?.musicVisualHeaderRenderer
    
    const name = this.t(header?.title)
    
    // Get top tracks
    const topTracksSection = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((s: any) => s.musicShelfRenderer)
    const topTracks = (topTracksSection?.musicShelfRenderer?.contents || []).map((item: any) => {
      const r = item.musicResponsiveListItemRenderer
      if (!r) return null
      return {
        id: r.playlistItemData?.videoId || r.navigationEndpoint?.watchEndpoint?.videoId,
        name: this.t(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text),
        artists: [{ id, name }],
        album: null,
        duration: this.parseDuration(this.t(r.flexColumns?.[r.flexColumns?.length - 1]?.musicResponsiveListItemFlexColumnRenderer?.text)),
        artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
      }
    }).filter(Boolean)
    
    // Get albums
    const albumsSection = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((s: any) => s.musicCarouselShelfRenderer)
    const albums: SpotubeAlbumObject[] = []
    
    if (albumsSection?.musicCarouselShelfRenderer?.contents) {
      for (const item of albumsSection.musicCarouselShelfRenderer.contents) {
        const r = item.musicTwoRowItemRenderer
        if (r) {
          albums.push({
            id: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.query || "",
            name: this.t(r.title),
            artists: [{ id, name }],
            artwork: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
          })
        }
      }
    }

    return {
      id,
      name,
      artwork: header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url,
      topTracks,
      albums: { items: albums, total: albums.length, hasMore: false },
      singles: { items: [], total: 0, hasMore: false },
      related: { items: [], total: 0, hasMore: false }
    }
  }

  async albums(id: string, offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubeAlbumObject>> {
    const data = await this.request("browse", { browseId: id })
    const albumsSection = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((s: any) => s.musicCarouselShelfRenderer)
    
    const albums: SpotubeAlbumObject[] = []
    if (albumsSection?.musicCarouselShelfRenderer?.contents) {
      for (const item of albumsSection.musicCarouselShelfRenderer.contents) {
        const r = item.musicTwoRowItemRenderer
        if (r) {
          albums.push({
            id: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.query || "",
            name: this.t(r.title),
            artists: [],
            artwork: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
          })
        }
      }
    }
    
    return {
      items: albums.slice(offset || 0, limit || 20),
      total: albums.length,
      hasMore: (offset || 0) + (limit || 20) < albums.length
    }
  }

  async topTracks(id: string): Promise<SpotubeTrackObject[]> {
    const artist = await this.getArtist(id)
    return artist.topTracks
  }

  async related(id: string): Promise<SpotubeArtistObject[]> {
    return []
  }

  async wikipedia(id: string): Promise<string> {
    return ""
  }

  private apiKey = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"
  private baseUrl = "https://music.youtube.com/youtubei/v1"

  private async request(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}/${endpoint}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB_REMIX",
            clientVersion: "1.20240522.01.00",
            hl: "en",
            gl: "US"
          }
        },
        ...body
      })
    })
    return response.json()
  }

  private t(obj: any): string {
    if (!obj) return ""
    if (obj.runs) return obj.runs.map((r: any) => r.text).join("")
    if (obj.simpleText) return obj.simpleText
    return ""
  }

  private parseDuration(text: string): number {
    if (!text) return 0
    const parts = text.split(":").map(Number)
    if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000
    if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
    return 0
  }
}