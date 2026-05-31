import type { 
  SpotubeTrackObject, 
  SpotubePlaylistObject, 
  SpotubePaginationResponseObject 
} from "@spotube-app/plugin"

export default class TrackEndpoint {
  async getTrack(id: string): Promise<SpotubeTrackObject> {
    const data = await this.request("player", { videoId: id })
    
    if (data.streamingData?.adaptiveFormats) {
      const format = data.streamingData.adaptiveFormats.find((f: any) => f.audioStreamQuality === "AUDIO_QUALITY_MEDIUM") ||
                     data.streamingData.adaptiveFormats.find((f: any) => f.audioStreamQuality === "AUDIO_QUALITY_LOW")
      
      return {
        id,
        name: data.videoDetails?.title || "",
        artists: (data.videoDetails?.author || "").split(",").map((name: string, i: number) => ({ 
          id: "", 
          name: name.trim() 
        })),
        album: {
          id: data.videoDetails?.musicVideoType || "",
          name: data.videoDetails?.title || ""
        },
        duration: parseInt(data.streamingData?.formats?.[0]?.approxDurationMs || "0"),
        artwork: data.videoDetails?.thumbnail?.thumbnails?.pop()?.url || ""
      }
    }
    
    // Fallback: search for track metadata
    const searchData = await this.request("search", {
      query: id,
      params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ=="
    })
    
    const item = searchData.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((c: any) => c.musicShelfRenderer)?.musicShelfRenderer?.contents?.[0]
    
    if (item?.musicResponsiveListItemRenderer) {
      const r = item.musicResponsiveListItemRenderer
      return this.parseTrackResult(r, id)
    }
    
    throw new Error("Track not found")
  }

  async recommendations(seedTracks?: string[]): Promise<SpotubeTrackObject[]> {
    if (!seedTracks?.length) return []
    
    const data = await this.request("browse", { 
      browseId: "FEmusic_home",
      params: "hmVvA"
    })
    
    const section = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((s: any) => s.musicShelfRenderer)
    const items = section?.musicShelfRenderer?.contents || []
    
    return items.map((item: any) => {
      const r = item.musicResponsiveListItemRenderer
      if (!r) return null
      return this.parseTrackResult(r)
    }).filter(Boolean).slice(0, 20)
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

  private parseTrackResult(r: any, videoId?: string): SpotubeTrackObject {
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
    
    const id = videoId || r.playlistItemData?.videoId || r.navigationEndpoint?.watchEndpoint?.videoId
    
    return {
      id,
      name: title,
      artists,
      album: album || { id: "", name: "YouTube Music" },
      duration,
      artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
    }
  }
}