export default class CorePlugin {
  async scrobble(track: any, position: number): Promise<void> {}
  
  async nowPlaying(track: any): Promise<void> {}
  
  async support(): Promise<{ isPatron: boolean; patronName?: string }> {
    return { isPatron: false }
  }
}