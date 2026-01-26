/**
 * Version tracking utility
 * Provides app version information from package.json and build metadata
 */

// Version will be injected by Vite during build
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
export const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || new Date().toISOString()

export interface VersionInfo {
  version: string
  buildTime: string
  buildDate: string
}

/**
 * Get complete version information
 */
export function getVersionInfo(): VersionInfo {
  const buildDate = new Date(BUILD_TIME).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    version: APP_VERSION,
    buildTime: BUILD_TIME,
    buildDate
  }
}

/**
 * Get formatted version string for display
 */
export function getVersionString(): string {
  return `v${APP_VERSION}`
}

/**
 * Get formatted version with build date
 */
export function getVersionWithBuildDate(): string {
  const info = getVersionInfo()
  return `${getVersionString()} (Built: ${info.buildDate})`
}
