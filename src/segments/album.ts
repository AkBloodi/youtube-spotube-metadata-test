import type { 
  SpotubeAlbumObject, 
  SpotubeArtistObject, 
  SpotubeFullAlbumObject, 
  SpotubePaginationResponseObject, 
  SpotubeTrackObject 
} from "@spotube-app/plugin"

export default class AlbumEndpoint {
  async getAlbum(id: string): Promise<SpotubeFullAlbumObject> {
    const data = await this.request("browse", { browseId: id })
    
    const header = data.header?.musicDetailHeaderRenderer
    const shelf = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer || 
                  data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer
    
    const albumName = this.t(header?.title)
    const albumArtists = (header?.subtitle?.runs || [])
      .filter((r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("UC"))
      .map((r: any) => ({ 
        id: r.navigationEndpoint.browseEndpoint.browseId, 
        name: r.text 
      }))
    
    return {
      id,
      name: albumName,
      artists: albumArtists,
      artwork: header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url,
      tracks: (shelf?.contents || []).map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        return {
          id: r.playlistItemData?.videoId,
          name: this.t(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text),
          artists: albumArtists,
          album: { id, name: albumName },
          duration: this.parseDuration(this.t(r.flexColumns?.[r.flexColumns?.length - 1]?.musicResponsiveListItemFlexColumnRenderer?.text)),
          artwork: header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url
        }
      }).filter(Boolean)
    }
  }

  async tracks(id: string, offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubeTrackObject>> {
    const album = await this.getAlbum(id)
    return {
      items: album.tracks.slice(offset || 0, limit || 20),
      total: album.tracks.length,
      hasMore: (offset || 0) + (limit || 20) < album.tracks.length
    }
  }

  async releases(offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubeAlbumObject>> {
    const data = await this.request("browse", { browseId: "FEmusic_home" })
    const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || []
    
    const albums: SpotubeAlbumObject[] = []
    for (const section of sections) {
      const shelf = section.musicShelfRenderer
      if (shelf?.contents) {
        for (const item of shelf.contents) {
          const r = item.musicResponsiveListItemRenderer
          if (r) {
            const title = this.t(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text)
            const subtitleRuns = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []
            const artists = subtitleRuns
              .filter((run: any) => run.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("UC"))
              .map((run: any) => ({ id: run.navigationEndpoint.browseEndpoint.browseId, name: run.text }))
            
            albums.push({
              id: r.navigationEndpoint?.browseEndpoint?.browseId || "",
              name: title,
              artists,
              artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
            })
          }
        }
      }
    }
    
    return {
      items: albums.slice(offset || 0, limit || 20),
      total: albums.length,
      hasMore: (offset || 0) + (limit || 20) < albums.length
    }
  }

  async save(ids: string[]): Promise<void> {}
  async unsave(ids: string[]): Promise<void> {}

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