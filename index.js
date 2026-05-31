var PluginModule = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => YouTubeMetadataPlugin
  });

  // src/segments/audio_source.ts
  var AudioSourceEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async getStreamingUrl(id, quality) {
      const data = await this.request("player", { videoId: id });
      if (!data.streamingData) {
        throw new Error("No streaming data available");
      }
      const formats = data.streamingData.adaptiveFormats || [];
      let format = formats.find((f) => f.audioStreamQuality === "AUDIO_QUALITY_MEDIUM");
      if (!format) {
        format = formats.find((f) => f.audioStreamQuality === "AUDIO_QUALITY_LOW");
      }
      if (!format) {
        format = formats[0];
      }
      return {
        url: format.url,
        itag: format.itag,
        bitrate: parseInt(format.bitrate || "0"),
        contentLength: parseInt(format.contentLength || "0"),
        mimeType: format.mimeType
      };
    }
    async getQualities() {
      return [
        { id: "AUDIO_QUALITY_LOW", name: "Low (64kbps)", bitrate: 64 },
        { id: "AUDIO_QUALITY_MEDIUM", name: "Medium (128kbps)", bitrate: 128 },
        { id: "AUDIO_QUALITY_HIGH", name: "High (256kbps)", bitrate: 256 }
      ];
    }
    async request(endpoint, body) {
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
      });
      return response.json();
    }
  };

  // src/segments/auth.ts
  var AuthEndpoint = class {
    authStatus() {
      return Promise.resolve({ isAuth: false });
    }
    authenticate() {
    }
    deauthenticate() {
    }
    get accessToken() {
      return null;
    }
  };

  // src/segments/album.ts
  var AlbumEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async getAlbum(id) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
      const data = await this.request("browse", { browseId: id });
      const header = (_a = data.header) == null ? void 0 : _a.musicDetailHeaderRenderer;
      const shelf = ((_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = (_b = data.contents) == null ? void 0 : _b.singleColumnBrowseResultsRenderer) == null ? void 0 : _c.tabs) == null ? void 0 : _d[0]) == null ? void 0 : _e.tabRenderer) == null ? void 0 : _f.content) == null ? void 0 : _g.sectionListRenderer) == null ? void 0 : _h.contents) == null ? void 0 : _i[0]) == null ? void 0 : _j.musicShelfRenderer) || ((_s = (_r = (_q = (_p = (_o = (_n = (_m = (_l = (_k = data.contents) == null ? void 0 : _k.singleColumnBrowseResultsRenderer) == null ? void 0 : _l.tabs) == null ? void 0 : _m[0]) == null ? void 0 : _n.tabRenderer) == null ? void 0 : _o.content) == null ? void 0 : _p.sectionListRenderer) == null ? void 0 : _q.contents) == null ? void 0 : _r[0]) == null ? void 0 : _s.musicPlaylistShelfRenderer);
      const albumName = this.t(header == null ? void 0 : header.title);
      const albumArtists = (((_t = header == null ? void 0 : header.subtitle) == null ? void 0 : _t.runs) || []).filter((r) => {
        var _a2, _b2, _c2;
        return (_c2 = (_b2 = (_a2 = r.navigationEndpoint) == null ? void 0 : _a2.browseEndpoint) == null ? void 0 : _b2.browseId) == null ? void 0 : _c2.startsWith("UC");
      }).map((r) => ({
        id: r.navigationEndpoint.browseEndpoint.browseId,
        name: r.text
      }));
      return {
        id,
        name: albumName,
        artists: albumArtists,
        artwork: (_y = (_x = (_w = (_v = (_u = header == null ? void 0 : header.thumbnail) == null ? void 0 : _u.croppedSquareThumbnailRenderer) == null ? void 0 : _v.thumbnail) == null ? void 0 : _w.thumbnails) == null ? void 0 : _x.pop()) == null ? void 0 : _y.url,
        tracks: ((shelf == null ? void 0 : shelf.contents) || []).map((item) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2;
          const r = item.musicResponsiveListItemRenderer;
          if (!r) return null;
          return {
            id: (_a2 = r.playlistItemData) == null ? void 0 : _a2.videoId,
            name: this.t((_d2 = (_c2 = (_b2 = r.flexColumns) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _d2.text),
            artists: albumArtists,
            album: { id, name: albumName },
            duration: this.parseDuration(this.t((_h2 = (_g2 = (_f2 = r.flexColumns) == null ? void 0 : _f2[((_e2 = r.flexColumns) == null ? void 0 : _e2.length) - 1]) == null ? void 0 : _g2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _h2.text)),
            artwork: (_m2 = (_l2 = (_k2 = (_j2 = (_i2 = header == null ? void 0 : header.thumbnail) == null ? void 0 : _i2.croppedSquareThumbnailRenderer) == null ? void 0 : _j2.thumbnail) == null ? void 0 : _k2.thumbnails) == null ? void 0 : _l2[0]) == null ? void 0 : _m2.url
          };
        }).filter(Boolean)
      };
    }
    async tracks(id, offset, limit) {
      const album = await this.getAlbum(id);
      return {
        items: album.tracks.slice(offset || 0, limit || 20),
        total: album.tracks.length,
        hasMore: (offset || 0) + (limit || 20) < album.tracks.length
      };
    }
    async releases(offset, limit) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
      const data = await this.request("browse", { browseId: "FEmusic_home" });
      const sections = ((_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.singleColumnBrowseResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[0]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) || [];
      const albums = [];
      for (const section of sections) {
        const shelf = section.musicShelfRenderer;
        if (shelf == null ? void 0 : shelf.contents) {
          for (const item of shelf.contents) {
            const r = item.musicResponsiveListItemRenderer;
            if (r) {
              const title = this.t((_j = (_i = (_h = r.flexColumns) == null ? void 0 : _h[0]) == null ? void 0 : _i.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _j.text);
              const subtitleRuns = ((_n = (_m = (_l = (_k = r.flexColumns) == null ? void 0 : _k[1]) == null ? void 0 : _l.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _m.text) == null ? void 0 : _n.runs) || [];
              const artists = subtitleRuns.filter((run) => {
                var _a2, _b2, _c2;
                return (_c2 = (_b2 = (_a2 = run.navigationEndpoint) == null ? void 0 : _a2.browseEndpoint) == null ? void 0 : _b2.browseId) == null ? void 0 : _c2.startsWith("UC");
              }).map((run) => ({ id: run.navigationEndpoint.browseEndpoint.browseId, name: run.text }));
              albums.push({
                id: ((_p = (_o = r.navigationEndpoint) == null ? void 0 : _o.browseEndpoint) == null ? void 0 : _p.browseId) || "",
                name: title,
                artists,
                artwork: (_u = (_t = (_s = (_r = (_q = r.thumbnail) == null ? void 0 : _q.musicThumbnailRenderer) == null ? void 0 : _r.thumbnail) == null ? void 0 : _s.thumbnails) == null ? void 0 : _t.pop()) == null ? void 0 : _u.url
              });
            }
          }
        }
      }
      return {
        items: albums.slice(offset || 0, limit || 20),
        total: albums.length,
        hasMore: (offset || 0) + (limit || 20) < albums.length
      };
    }
    async save(ids) {
    }
    async unsave(ids) {
    }
    async request(endpoint, body) {
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
      if (!text) return 0;
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
  };

  // src/segments/artist.ts
  var ArtistEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async getArtist(id) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I;
      const data = await this.request("browse", { browseId: id });
      const header = ((_a = data.header) == null ? void 0 : _a.musicImmersiveHeaderRenderer) || ((_b = data.header) == null ? void 0 : _b.musicVisualHeaderRenderer);
      const name = this.t(header == null ? void 0 : header.title);
      const topTracksSection = (_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = data.contents) == null ? void 0 : _c.singleColumnBrowseResultsRenderer) == null ? void 0 : _d.tabs) == null ? void 0 : _e[0]) == null ? void 0 : _f.tabRenderer) == null ? void 0 : _g.content) == null ? void 0 : _h.sectionListRenderer) == null ? void 0 : _i.contents) == null ? void 0 : _j.find((s) => s.musicShelfRenderer);
      const topTracks = (((_k = topTracksSection == null ? void 0 : topTracksSection.musicShelfRenderer) == null ? void 0 : _k.contents) || []).map((item) => {
        var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2, _n2, _o2;
        const r = item.musicResponsiveListItemRenderer;
        if (!r) return null;
        return {
          id: ((_a2 = r.playlistItemData) == null ? void 0 : _a2.videoId) || ((_c2 = (_b2 = r.navigationEndpoint) == null ? void 0 : _b2.watchEndpoint) == null ? void 0 : _c2.videoId),
          name: this.t((_f2 = (_e2 = (_d2 = r.flexColumns) == null ? void 0 : _d2[0]) == null ? void 0 : _e2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _f2.text),
          artists: [{ id, name }],
          album: null,
          duration: this.parseDuration(this.t((_j2 = (_i2 = (_h2 = r.flexColumns) == null ? void 0 : _h2[((_g2 = r.flexColumns) == null ? void 0 : _g2.length) - 1]) == null ? void 0 : _i2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _j2.text)),
          artwork: (_o2 = (_n2 = (_m2 = (_l2 = (_k2 = r.thumbnail) == null ? void 0 : _k2.musicThumbnailRenderer) == null ? void 0 : _l2.thumbnail) == null ? void 0 : _m2.thumbnails) == null ? void 0 : _n2.pop()) == null ? void 0 : _o2.url
        };
      }).filter(Boolean);
      const albumsSection = (_s = (_r = (_q = (_p = (_o = (_n = (_m = (_l = data.contents) == null ? void 0 : _l.singleColumnBrowseResultsRenderer) == null ? void 0 : _m.tabs) == null ? void 0 : _n[0]) == null ? void 0 : _o.tabRenderer) == null ? void 0 : _p.content) == null ? void 0 : _q.sectionListRenderer) == null ? void 0 : _r.contents) == null ? void 0 : _s.find((s) => s.musicCarouselShelfRenderer);
      const albums = [];
      if ((_t = albumsSection == null ? void 0 : albumsSection.musicCarouselShelfRenderer) == null ? void 0 : _t.contents) {
        for (const item of albumsSection.musicCarouselShelfRenderer.contents) {
          const r = item.musicTwoRowItemRenderer;
          if (r) {
            albums.push({
              id: ((_y = (_x = (_w = (_v = (_u = r.thumbnailRenderer) == null ? void 0 : _u.musicThumbnailRenderer) == null ? void 0 : _v.thumbnail) == null ? void 0 : _w.thumbnails) == null ? void 0 : _x[0]) == null ? void 0 : _y.query) || "",
              name: this.t(r.title),
              artists: [{ id, name }],
              artwork: (_D = (_C = (_B = (_A = (_z = r.thumbnailRenderer) == null ? void 0 : _z.musicThumbnailRenderer) == null ? void 0 : _A.thumbnail) == null ? void 0 : _B.thumbnails) == null ? void 0 : _C.pop()) == null ? void 0 : _D.url
            });
          }
        }
      }
      return {
        id,
        name,
        artwork: (_I = (_H = (_G = (_F = (_E = header == null ? void 0 : header.thumbnail) == null ? void 0 : _E.musicThumbnailRenderer) == null ? void 0 : _F.thumbnail) == null ? void 0 : _G.thumbnails) == null ? void 0 : _H.pop()) == null ? void 0 : _I.url,
        topTracks,
        albums: { items: albums, total: albums.length, hasMore: false },
        singles: { items: [], total: 0, hasMore: false },
        related: { items: [], total: 0, hasMore: false }
      };
    }
    async albums(id, offset, limit) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
      const data = await this.request("browse", { browseId: id });
      const albumsSection = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.singleColumnBrowseResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[0]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) == null ? void 0 : _h.find((s) => s.musicCarouselShelfRenderer);
      const albums = [];
      if ((_i = albumsSection == null ? void 0 : albumsSection.musicCarouselShelfRenderer) == null ? void 0 : _i.contents) {
        for (const item of albumsSection.musicCarouselShelfRenderer.contents) {
          const r = item.musicTwoRowItemRenderer;
          if (r) {
            albums.push({
              id: ((_n = (_m = (_l = (_k = (_j = r.thumbnailRenderer) == null ? void 0 : _j.musicThumbnailRenderer) == null ? void 0 : _k.thumbnail) == null ? void 0 : _l.thumbnails) == null ? void 0 : _m[0]) == null ? void 0 : _n.query) || "",
              name: this.t(r.title),
              artists: [],
              artwork: (_s = (_r = (_q = (_p = (_o = r.thumbnailRenderer) == null ? void 0 : _o.musicThumbnailRenderer) == null ? void 0 : _p.thumbnail) == null ? void 0 : _q.thumbnails) == null ? void 0 : _r.pop()) == null ? void 0 : _s.url
            });
          }
        }
      }
      return {
        items: albums.slice(offset || 0, limit || 20),
        total: albums.length,
        hasMore: (offset || 0) + (limit || 20) < albums.length
      };
    }
    async topTracks(id) {
      const artist = await this.getArtist(id);
      return artist.topTracks;
    }
    async related(id) {
      return [];
    }
    async wikipedia(id) {
      return "";
    }
    async request(endpoint, body) {
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
      if (!text) return 0;
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
  };

  // src/segments/browse.ts
  var BrowseEndpoint = class {
    async featuredPlaylists(offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
    async newReleases(offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
    async categories(offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
    async category(id, offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
    async moods(offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
  };

  // src/segments/playlist.ts
  var PlaylistEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async getPlaylist(id) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
      const data = await this.request("browse", { browseId: `VLMPL:${id}` });
      const header = ((_a = data.header) == null ? void 0 : _a.musicDetailHeaderRenderer) || ((_b = data.header) == null ? void 0 : _b.musicEditablePlaylistDetailHeaderRenderer);
      const contents = ((_l = (_k = (_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = data.contents) == null ? void 0 : _c.singleColumnBrowseResultsRenderer) == null ? void 0 : _d.tabs) == null ? void 0 : _e[0]) == null ? void 0 : _f.tabRenderer) == null ? void 0 : _g.content) == null ? void 0 : _h.sectionListRenderer) == null ? void 0 : _i.contents) == null ? void 0 : _j[0]) == null ? void 0 : _k.musicShelfRenderer) == null ? void 0 : _l.contents) || [];
      return {
        id,
        name: this.t(header == null ? void 0 : header.title),
        description: this.t(header == null ? void 0 : header.secondSubtitle),
        author: (((_m = header == null ? void 0 : header.subtitle) == null ? void 0 : _m.runs) || []).map((r) => {
          var _a2, _b2;
          return {
            id: ((_b2 = (_a2 = r.navigationEndpoint) == null ? void 0 : _a2.browseEndpoint) == null ? void 0 : _b2.browseId) || "",
            name: r.text
          };
        }).filter((a) => a.id),
        artwork: (_r = (_q = (_p = (_o = (_n = header == null ? void 0 : header.thumbnail) == null ? void 0 : _n.croppedSquareThumbnailRenderer) == null ? void 0 : _o.thumbnail) == null ? void 0 : _p.thumbnails) == null ? void 0 : _q.pop()) == null ? void 0 : _r.url,
        tracks: contents.map((item) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2;
          const r = item.musicResponsiveListItemRenderer;
          if (!r) return null;
          return {
            id: (_a2 = r.playlistItemData) == null ? void 0 : _a2.videoId,
            name: this.t((_d2 = (_c2 = (_b2 = r.flexColumns) == null ? void 0 : _b2[0]) == null ? void 0 : _c2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _d2.text),
            artists: [],
            album: null,
            duration: this.parseDuration(this.t((_h2 = (_g2 = (_f2 = r.flexColumns) == null ? void 0 : _f2[((_e2 = r.flexColumns) == null ? void 0 : _e2.length) - 1]) == null ? void 0 : _g2.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _h2.text)),
            artwork: (_m2 = (_l2 = (_k2 = (_j2 = (_i2 = r.thumbnail) == null ? void 0 : _i2.musicThumbnailRenderer) == null ? void 0 : _j2.thumbnail) == null ? void 0 : _k2.thumbnails) == null ? void 0 : _l2.pop()) == null ? void 0 : _m2.url
          };
        }).filter(Boolean),
        trackCount: contents.length
      };
    }
    async tracks(id, offset, limit) {
      const playlist = await this.getPlaylist(id);
      return {
        items: playlist.tracks.slice(offset || 0, limit || 100),
        total: playlist.tracks.length,
        hasMore: (offset || 0) + (limit || 100) < playlist.tracks.length
      };
    }
    async featured() {
      return [];
    }
    async categories() {
      return [];
    }
    async category(id, offset, limit) {
      return { items: [], total: 0, hasMore: false };
    }
    async request(endpoint, body) {
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
      if (!text) return 0;
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
  };

  // src/segments/search.ts
  var SearchEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async all(query) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
      const data = await this.request("search", {
        query,
        params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ=="
      });
      const items = ((_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.tabbedSearchResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[0]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) == null ? void 0 : _h.find((c) => c.musicShelfRenderer)) == null ? void 0 : _i.musicShelfRenderer) == null ? void 0 : _j.contents) || [];
      const tracks = [];
      for (const item of items) {
        const r = item.musicResponsiveListItemRenderer;
        if (!r) continue;
        const title = this.t((_m = (_l = (_k = r.flexColumns) == null ? void 0 : _k[0]) == null ? void 0 : _l.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _m.text);
        const subtitleRuns = ((_q = (_p = (_o = (_n = r.flexColumns) == null ? void 0 : _n[1]) == null ? void 0 : _o.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _p.text) == null ? void 0 : _q.runs) || [];
        const artists = [];
        let album = null;
        let duration = 0;
        subtitleRuns.forEach((run) => {
          var _a2, _b2, _c2;
          const browseId = (_b2 = (_a2 = run.navigationEndpoint) == null ? void 0 : _a2.browseEndpoint) == null ? void 0 : _b2.browseId;
          if (browseId) {
            if (browseId.startsWith("UC") || browseId.startsWith("Fm")) {
              artists.push({ id: browseId, name: run.text });
            } else if (browseId.startsWith("MPRE")) {
              album = { id: browseId, name: run.text };
            }
          } else if ((_c2 = run.text) == null ? void 0 : _c2.includes(":")) {
            duration = this.parseDuration(run.text);
          }
        });
        const id = ((_r = r.playlistItemData) == null ? void 0 : _r.videoId) || ((_t = (_s = r.navigationEndpoint) == null ? void 0 : _s.watchEndpoint) == null ? void 0 : _t.videoId);
        if (id) {
          tracks.push({
            id,
            name: title,
            artists,
            album: album || { id: "", name: "YouTube Music" },
            duration,
            artwork: (_y = (_x = (_w = (_v = (_u = r.thumbnail) == null ? void 0 : _u.musicThumbnailRenderer) == null ? void 0 : _v.thumbnail) == null ? void 0 : _w.thumbnails) == null ? void 0 : _x.pop()) == null ? void 0 : _y.url
          });
        }
      }
      return { tracks };
    }
    async tracks(query) {
      const result = await this.all(query);
      return result.tracks;
    }
    async albums(query) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const data = await this.request("search", {
        query,
        params: "EgWKAQIaAWoKEAMQBBAJEAoQBQ=="
      });
      const items = ((_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.tabbedSearchResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[1]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) == null ? void 0 : _h.find((c) => c.musicShelfRenderer)) == null ? void 0 : _i.musicShelfRenderer) == null ? void 0 : _j.contents) || [];
      return items.map((item) => {
        var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k, _l;
        const r = item.musicTwoRowItemRenderer;
        if (!r) return null;
        const titleRuns = ((_a2 = r.title) == null ? void 0 : _a2.runs) || [];
        const subtitleRuns = ((_b2 = r.subtitle) == null ? void 0 : _b2.runs) || [];
        return {
          id: ((_g2 = (_f2 = (_e2 = (_d2 = (_c2 = r.thumbnailRenderer) == null ? void 0 : _c2.musicThumbnailRenderer) == null ? void 0 : _d2.thumbnail) == null ? void 0 : _e2.thumbnails) == null ? void 0 : _f2[0]) == null ? void 0 : _g2.query) || "",
          name: titleRuns.map((r2) => r2.text).join(""),
          artists: subtitleRuns.filter((r2) => {
            var _a3, _b3, _c3;
            return (_c3 = (_b3 = (_a3 = r2.navigationEndpoint) == null ? void 0 : _a3.browseEndpoint) == null ? void 0 : _b3.browseId) == null ? void 0 : _c3.startsWith("UC");
          }).map((r2) => ({
            id: r2.navigationEndpoint.browseEndpoint.browseId,
            name: r2.text
          })),
          artwork: (_l = (_k = (_j2 = (_i2 = (_h2 = r.thumbnailRenderer) == null ? void 0 : _h2.musicThumbnailRenderer) == null ? void 0 : _i2.thumbnail) == null ? void 0 : _j2.thumbnails) == null ? void 0 : _k.pop()) == null ? void 0 : _l.url
        };
      }).filter(Boolean);
    }
    async artists(query) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const data = await this.request("search", {
        query,
        params: "EgWKAQIoAWoKEAMQBBAJEAoQBQ=="
      });
      const items = ((_j = (_i = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.tabbedSearchResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[2]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) == null ? void 0 : _h.find((c) => c.musicShelfRenderer)) == null ? void 0 : _i.musicShelfRenderer) == null ? void 0 : _j.contents) || [];
      return items.map((item) => {
        var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2;
        const r = item.musicTwoRowItemRenderer;
        if (!r) return null;
        return {
          id: ((_e2 = (_d2 = (_c2 = (_b2 = (_a2 = r.thumbnailRenderer) == null ? void 0 : _a2.musicThumbnailRenderer) == null ? void 0 : _b2.thumbnail) == null ? void 0 : _c2.thumbnails) == null ? void 0 : _d2[0]) == null ? void 0 : _e2.query) || "",
          name: this.t(r.title),
          artwork: (_j2 = (_i2 = (_h2 = (_g2 = (_f2 = r.thumbnailRenderer) == null ? void 0 : _f2.musicThumbnailRenderer) == null ? void 0 : _g2.thumbnail) == null ? void 0 : _h2.thumbnails) == null ? void 0 : _i2.pop()) == null ? void 0 : _j2.url
        };
      }).filter(Boolean);
    }
    async playlists(query) {
      return [];
    }
    async request(endpoint, body) {
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
      if (!text) return 0;
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
  };

  // src/segments/track.ts
  var TrackEndpoint = class {
    constructor() {
      __publicField(this, "apiKey", "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30");
      __publicField(this, "baseUrl", "https://music.youtube.com/youtubei/v1");
    }
    async getTrack(id) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
      const data = await this.request("player", { videoId: id });
      if ((_a = data.streamingData) == null ? void 0 : _a.adaptiveFormats) {
        const format = data.streamingData.adaptiveFormats.find((f) => f.audioStreamQuality === "AUDIO_QUALITY_MEDIUM") || data.streamingData.adaptiveFormats.find((f) => f.audioStreamQuality === "AUDIO_QUALITY_LOW");
        return {
          id,
          name: ((_b = data.videoDetails) == null ? void 0 : _b.title) || "",
          artists: (((_c = data.videoDetails) == null ? void 0 : _c.author) || "").split(",").map((name, i) => ({
            id: "",
            name: name.trim()
          })),
          album: {
            id: ((_d = data.videoDetails) == null ? void 0 : _d.musicVideoType) || "",
            name: ((_e = data.videoDetails) == null ? void 0 : _e.title) || ""
          },
          duration: parseInt(((_h = (_g = (_f = data.streamingData) == null ? void 0 : _f.formats) == null ? void 0 : _g[0]) == null ? void 0 : _h.approxDurationMs) || "0"),
          artwork: ((_l = (_k = (_j = (_i = data.videoDetails) == null ? void 0 : _i.thumbnail) == null ? void 0 : _j.thumbnails) == null ? void 0 : _k.pop()) == null ? void 0 : _l.url) || ""
        };
      }
      const searchData = await this.request("search", {
        query: id,
        params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ=="
      });
      const item = (_w = (_v = (_u = (_t = (_s = (_r = (_q = (_p = (_o = (_n = (_m = searchData.contents) == null ? void 0 : _m.tabbedSearchResultsRenderer) == null ? void 0 : _n.tabs) == null ? void 0 : _o[0]) == null ? void 0 : _p.tabRenderer) == null ? void 0 : _q.content) == null ? void 0 : _r.sectionListRenderer) == null ? void 0 : _s.contents) == null ? void 0 : _t.find((c) => c.musicShelfRenderer)) == null ? void 0 : _u.musicShelfRenderer) == null ? void 0 : _v.contents) == null ? void 0 : _w[0];
      if (item == null ? void 0 : item.musicResponsiveListItemRenderer) {
        const r = item.musicResponsiveListItemRenderer;
        return this.parseTrackResult(r, id);
      }
      throw new Error("Track not found");
    }
    async recommendations(seedTracks) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      if (!(seedTracks == null ? void 0 : seedTracks.length)) return [];
      const data = await this.request("browse", {
        browseId: "FEmusic_home",
        params: "hmVvA"
      });
      const section = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = data.contents) == null ? void 0 : _a.singleColumnBrowseResultsRenderer) == null ? void 0 : _b.tabs) == null ? void 0 : _c[0]) == null ? void 0 : _d.tabRenderer) == null ? void 0 : _e.content) == null ? void 0 : _f.sectionListRenderer) == null ? void 0 : _g.contents) == null ? void 0 : _h.find((s) => s.musicShelfRenderer);
      const items = ((_i = section == null ? void 0 : section.musicShelfRenderer) == null ? void 0 : _i.contents) || [];
      return items.map((item) => {
        const r = item.musicResponsiveListItemRenderer;
        if (!r) return null;
        return this.parseTrackResult(r);
      }).filter(Boolean).slice(0, 20);
    }
    async save(ids) {
    }
    async unsave(ids) {
    }
    async request(endpoint, body) {
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
      if (!text) return 0;
      const parts = text.split(":").map(Number);
      if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1e3;
      if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1e3;
      return 0;
    }
    parseTrackResult(r, videoId) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const title = this.t((_c = (_b = (_a = r.flexColumns) == null ? void 0 : _a[0]) == null ? void 0 : _b.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _c.text);
      const subtitleRuns = ((_g = (_f = (_e = (_d = r.flexColumns) == null ? void 0 : _d[1]) == null ? void 0 : _e.musicResponsiveListItemFlexColumnRenderer) == null ? void 0 : _f.text) == null ? void 0 : _g.runs) || [];
      const artists = [];
      let album = null;
      let duration = 0;
      subtitleRuns.forEach((run) => {
        var _a2, _b2, _c2;
        const browseId = (_b2 = (_a2 = run.navigationEndpoint) == null ? void 0 : _a2.browseEndpoint) == null ? void 0 : _b2.browseId;
        if (browseId) {
          if (browseId.startsWith("UC") || browseId.startsWith("Fm")) {
            artists.push({ id: browseId, name: run.text });
          } else if (browseId.startsWith("MPRE")) {
            album = { id: browseId, name: run.text };
          }
        } else if ((_c2 = run.text) == null ? void 0 : _c2.includes(":")) {
          duration = this.parseDuration(run.text);
        }
      });
      const id = videoId || ((_h = r.playlistItemData) == null ? void 0 : _h.videoId) || ((_j = (_i = r.navigationEndpoint) == null ? void 0 : _i.watchEndpoint) == null ? void 0 : _j.videoId);
      return {
        id,
        name: title,
        artists,
        album: album || { id: "", name: "YouTube Music" },
        duration,
        artwork: (_o = (_n = (_m = (_l = (_k = r.thumbnail) == null ? void 0 : _k.musicThumbnailRenderer) == null ? void 0 : _l.thumbnail) == null ? void 0 : _m.thumbnails) == null ? void 0 : _n.pop()) == null ? void 0 : _o.url
      };
    }
  };

  // src/segments/user.ts
  var UserEndpoint = class {
    me() {
      return Promise.resolve({ id: "", name: "", email: "" });
    }
    playlists(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    savedTracks(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    savedAlbums(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    savedArtists(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    followedArtists(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    topTracks(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
    topArtists(offset, limit) {
      return Promise.resolve({ items: [], total: 0, hasMore: false });
    }
  };

  // src/segments/core.ts
  var CorePlugin = class {
    async scrobble(track, position) {
    }
    async nowPlaying(track) {
    }
    async support() {
      return { isPatron: false };
    }
  };

  // src/index.ts
  var YouTubeMetadataPlugin = class {
    constructor() {
      __publicField(this, "audioSource");
      __publicField(this, "auth");
      __publicField(this, "album");
      __publicField(this, "artist");
      __publicField(this, "browse");
      __publicField(this, "playlist");
      __publicField(this, "search");
      __publicField(this, "track");
      __publicField(this, "user");
      __publicField(this, "core");
      this.auth = new AuthEndpoint();
      this.audioSource = new AudioSourceEndpoint();
      this.album = new AlbumEndpoint();
      this.artist = new ArtistEndpoint();
      this.browse = new BrowseEndpoint();
      this.core = new CorePlugin();
      this.playlist = new PlaylistEndpoint();
      this.search = new SearchEndpoint();
      this.track = new TrackEndpoint();
      this.user = new UserEndpoint();
    }
  };
  return __toCommonJS(index_exports);
})();
for(var key in PluginModule) { this[key] = PluginModule[key]; }
