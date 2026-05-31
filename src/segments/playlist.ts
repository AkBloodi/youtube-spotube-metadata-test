import type { 
  SpotubePlaylistObject, 
  SpotubePaginationResponseObject,
  SpotubeTrackObject 
} from "@spotube-app/plugin"

export default class PlaylistEndpoint {
  async getPlaylist(id: string): Promise<SpotubePlaylistObject> {
    const data = await this.request("browse", { browseId: `VLMPL:${id}` })
    
    const header = data.header?.musicDetailHeaderRenderer || 
                  data.header?.musicEditablePlaylistDetailHeaderRenderer
    
    const contents = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents || []
    
    return {
      id,
      name: this.t(header?.title),
      description: this.t(header?.secondSubtitle),
      author: (header?.subtitle?.runs || []).map((r: any) => ({
        id: r.navigationEndpoint?.browseEndpoint?.browseId || "",
        name: r.text
      })).filter((a: any) => a.id),
      artwork: header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url,
      tracks: contents.map((item: any) => {
        const r = item.musicResponsiveListItemRenderer
        if (!r) return null
        return {
          id: r.playlistItemData?.videoId,
          name: this.t(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text),
          artists: [],
          album: null,
          duration: this.parseDuration(this.t(r.flexColumns?.[r.flexColumns?.length - 1]?.musicResponsiveListItemFlexColumnRenderer?.text)),
          artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
        }
      }).filter(Boolean),
      trackCount: contents.length
    }
  }

  async tracks(id: string, offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubeTrackObject>> {
    const playlist = await this.getPlaylist(id)
    return {
      items: playlist.tracks.slice(offset || 0, limit || 100),
      total: playlist.tracks.length,
      hasMore: (offset || 0) + (limit || 100) < playlist.tracks.length
    }
  }

  async featured(): Promise<SpotubePlaylistObject[]> {
    return []
  }

  async categories(): Promise<any[]> {
    return []
  }

  async category(id: string, offset?: number, limit?: number): Promise<SpotubePaginationResponseObject<SpotubePlaylistObject>> {
    return { items: [], total: 0, hasMore: false }
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