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
