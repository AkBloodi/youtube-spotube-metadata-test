var PluginModule = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // spotube-youtube-plugin/src/index.ts
  var index_exports = {};
  __export(index_exports, {
    YouTubeMetadataPlugin: () => YouTubeMetadataPlugin
  });
  var YouTubeMetadataPlugin = class {
    apiKey = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
    baseUrl = "https://music.youtube.com/youtubei/v1";
    async request(endpoint, body) {
      const response = await fetch(`${this.baseUrl}/${endpoint}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
      });
      return response.json();
    }
    t(obj) {
      if (!obj) return "";
      if (obj.runs) return obj.runs.map((r) => r.text).join("");
      if (obj.simpleText) return obj.simpleText;
      return "";
    }
    parseDuration(text) {
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
    async searchTracks(query) {
      const data = await this.request("search", {
        query,
        params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ=="
      });
      const items = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.find((c) => c.musicShelfRenderer)?.musicShelfRenderer?.contents || [];
      return items.map((item) => {
        const r = item.musicResponsiveListItemRenderer;
        if (!r) return null;
        const title = this.t(r.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text);
        const subtitleRuns = r.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
        const artists = [];
        let album = null;
        let duration = 0;
        subtitleRuns.forEach((run) => {
          const browseId = run.navigationEndpoint?.browseEndpoint?.browseId;
          if (browseId) {
            if (browseId.startsWith("UC") || browseId.startsWith("Fm")) {
              artists.push({ id: browseId, name: run.text });
            } else if (browseId.startsWith("MPRE")) {
              album = { id: browseId, name: run.text };
            }
          } else if (run.text.includes(":")) {
            duration = this.parseDuration(run.text);
          }
        });
        const videoId = r.playlistItemData?.videoId || r.navigationEndpoint?.watchEndpoint?.videoId;
        return {
          id: videoId,
          name: title,
          artists,
          album: album || { id: "", name: "YouTube Music" },
          duration,
          artwork: r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
        };
      }).filter(Boolean);
    }
    async getAlbum(id) {
      const data = await this.request("browse", { browseId: id });
      const header = data.header?.musicDetailHeaderRenderer;
      const shelf = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer || data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer;
      const albumName = this.t(header?.title);
      const albumArtists = header?.subtitle?.runs?.filter((r) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith("UC")).map((r) => ({ id: r.navigationEndpoint.browseEndpoint.browseId, name: r.text })) || [];
      return {
        id,
        name: albumName,
        artists: albumArtists,
        artwork: header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url,
        tracks: shelf?.contents?.map((item) => {
          const r = item.musicResponsiveListItemRenderer;
          if (!r) return null;
          return {
            id: r.playlistItemData?.videoId,
            name: this.t(r.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text),
            artists: albumArtists,
            album: { id, name: albumName },
            duration: this.parseDuration(this.t(r.flexColumns[r.flexColumns.length - 1]?.musicResponsiveListItemFlexColumnRenderer?.text)),
            artwork: header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url
          };
        }).filter(Boolean)
      };
    }
    async getArtist(id) {
      const data = await this.request("browse", { browseId: id });
      const header = data.header?.musicImmersiveHeaderRenderer || data.header?.musicVisualHeaderRenderer;
      return {
        id,
        name: this.t(header?.title),
        artwork: header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url
      };
    }
  };
  return __toCommonJS(index_exports);
})();
for(var key in PluginModule) { this[key] = PluginModule[key]; }
