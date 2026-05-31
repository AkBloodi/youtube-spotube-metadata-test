import type { SpotubeAuthStatus } from "@spotube-app/plugin"

export default class AuthEndpoint {
  authStatus(): Promise<SpotubeAuthStatus> {
    return Promise.resolve({ isAuth: false })
  }

  authenticate(): Promise<void> {}
  
  deauthenticate(): Promise<void> {}

  get accessToken(): string | null {
    return null
  }
}