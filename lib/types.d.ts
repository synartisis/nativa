import type * as http from 'node:http'

export interface Config {
  /**
   * nativa root directory  
   * must be set to the root of content location
   * @example rootDir: 'my_content/'
   */
  rootDir: string

  /**
   * url of admin section
   * @default '/admin/'
   * @example adminUrl: '/administrator/'
   */
  adminUrl?: string

  /**
   * nativa supported languages  
   * the first one will be the default
   * @example languages: ['en', 'fr']
   */
  languages?: string[]
}


export namespace nativa {

  type Session = { sessionId: string, username: string, roles: string[] }

  type Request = http.IncomingMessage & { session?: Session }

  type Response = http.ServerResponse & { locals: any }

  type RequestListener = (req: Request, res: Response) => void

}

