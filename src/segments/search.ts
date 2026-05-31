import type { 
  SpotubeTrackObject, 
  SpotubeAlbumObject, 
  SpotubeArtistObject, 
  SpotubePlaylistObject,
  SpotubeSearchResultObject 
} from "@spotube-app/plugin"

export default class SearchEndpoint {
  async all(query: string): Promise<SpotubeSearchResultObject> {
    const data = await this.request("search", {
      query,
      params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ=="
    })
    
    const items = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((c: any) => c.musicShelfRenderer)?.musicShelfRenderer?.contents || []
    
    const tracks: SpotubeTrackObject[] = []
    
    for (const item of items) {
      const r = item.musicResponsiveListItemRenderer
      if (!r) continue
      
      const title = this.t(r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text)
      const subtitleRuns = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []
      
      const artists: any[] = []
      let album: any = null
      let duration = 0
      
      subtitleRuns.forEach((run: any) => {
        const browseId = run.navigationEndpoint?.browseEndpoint?.browseId
        if (browseId) {
          if (browseId.startsWith("UC") || browseId.startsWith("Fm")) {
            artists.push({ id: browseId, name: run.text })
          } else if (browseId.startsWith("MPRE")) {
            album = { id: browseId, name: run.text }
          }
        } else if (run.text?.includes(":")) {
          duration = this.parseDuration(run.text)
        }
      })
      
      const id = r.playlistItemData?.videoId || r.navigationEndpoint?.watchEndpoint?.videoId
      
      if (id) {
        tracks.push({
          id,
          name: title,
          artists,
          album: album || { id: "", name: "YouTube Music" },
          duration,
          artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
        })
      }
    }
    
    return { tracks }
  }

  async tracks(query: string): Promise<SpotubeTrackObject[]> {
    const result = await this.all(query)
    return result.tracks
  }

  async albums(query: string): Promise<SpotubeAlbumObject[]> {
    const data = await this.request("search", {
      query,
      params: "EgWKAQIaAWoKEAMQBBAJEAoQBQ=="
    })
    
    const items = data.contents?.tabbedSearchResultsRenderer?.tabs?.[1]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((c: any) => c.musicShelfRenderer)?.musicShelfRenderer?.contents || []
    
    return items.map((item: any) => {
      const r = item.musicTwoRowItemRenderer
      if (!r) return null
      
      const titleRuns = r.title?.runs || []
      const subtitleRuns = r.subtitle?.runs || []
      
      return {
        id: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.query || "",
        name: titleRuns.map((r: any) => r.text).join(""),
        artists: subtitleRuns.filter((r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("UC")).map((r: any) => ({
          id: r.navigationEndpoint.browseEndpoint.browseId,
          name: r.text
        })),
        artwork: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
      }
    }).filter(Boolean)
  }

  async artists(query: string): Promise<SpotubeArtistObject[]> {
    const data = await this.request("search", {
      query,
      params: "EgWKAQIoAWoKEAMQBBAJEAoQBQ=="
    })
    
    const items = data.contents?.tabbedSearchResultsRenderer?.tabs?.[2]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((c: any) => c.musicShelfRenderer)?.musicShelfRenderer?.contents || []
    
    return items.map((item: any) => {
      const r = item.musicTwoRowItemRenderer
      if (!r) return null
      
      return {
        id: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.query || "",
        name: this.t(r.title),
        artwork: r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
      }
    }).filter(Boolean)
  }

  async playlists(query: string): Promise<SpotubePlaylistObject[]> {
    return []
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