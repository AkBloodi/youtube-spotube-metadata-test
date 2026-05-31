import type { 
  SpotubeAudioSourceQualityObject,
  SpotubeAudioSourceObject 
} from "@spotube-app/plugin"

export default class AudioSourceEndpoint {
  async getStreamingUrl(id: string, quality?: string): Promise<SpotubeAudioSourceObject> {
    const data = await this.request("player", { videoId: id })
    
    if (!data.streamingData) {
      throw new Error("No streaming data available")
    }
    
    const formats = data.streamingData.adaptiveFormats || []
    
    let format = formats.find((f: any) => f.audioStreamQuality === "AUDIO_QUALITY_MEDIUM")
    if (!format) {
      format = formats.find((f: any) => f.audioStreamQuality === "AUDIO_QUALITY_LOW")
    }
    if (!format) {
      format = formats[0]
    }
    
    return {
      url: format.url,
      itag: format.itag,
      bitrate: parseInt(format.bitrate || "0"),
      contentLength: parseInt(format.contentLength || "0"),
      mimeType: format.mimeType
    }
  }

  async getQualities(): Promise<SpotubeAudioSourceQualityObject[]> {
    return [
      { id: "AUDIO_QUALITY_LOW", name: "Low (64kbps)", bitrate: 64 },
      { id: "AUDIO_QUALITY_MEDIUM", name: "Medium (128kbps)", bitrate: 128 },
      { id: "AUDIO_QUALITY_HIGH", name: "High (256kbps)", bitrate: 256 }
    ]
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
}