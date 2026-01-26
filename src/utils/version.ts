/**
 * Version tracking utility
 * Provides app version information from package.json and release metadata
 * Supports both MyApps (MA) and Read Tracker (RT) version prefixes
 */

import { marked } from 'marked'

// Version will be injected by Vite during build
// For backward compatibility, use APP_VERSION if specific versions not set
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
export const RELEASE_TIME = import.meta.env.VITE_RELEASE_TIME || new Date().toISOString()
export const RELEASE_NOTES = import.meta.env.VITE_RELEASE_NOTES || ''

// MyApps (MA) specific version info
export const MA_VERSION = import.meta.env.VITE_MA_VERSION || APP_VERSION
export const MA_RELEASE_TIME = import.meta.env.VITE_MA_RELEASE_TIME || RELEASE_TIME
export const MA_RELEASE_NOTES = import.meta.env.VITE_MA_RELEASE_NOTES || ''

// Read Tracker (RT) specific version info
export const RT_VERSION = import.meta.env.VITE_RT_VERSION || APP_VERSION
export const RT_RELEASE_TIME = import.meta.env.VITE_RT_RELEASE_TIME || RELEASE_TIME
export const RT_RELEASE_NOTES = import.meta.env.VITE_RT_RELEASE_NOTES || ''

export interface VersionInfo {
  version: string
  releaseTime: string
  releaseDate: string
  releaseNotes: string
}

/**
 * Get complete version information (default - uses APP_VERSION for backward compatibility)
 */
export function getVersionInfo(): VersionInfo {
  const releaseDate = new Date(RELEASE_TIME).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    version: APP_VERSION,
    releaseTime: RELEASE_TIME,
    releaseDate,
    releaseNotes: RELEASE_NOTES
  }
}

/**
 * Get MyApps (MA) version information
 */
export function getMAVersionInfo(): VersionInfo {
  const releaseDate = new Date(MA_RELEASE_TIME).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    version: MA_VERSION,
    releaseTime: MA_RELEASE_TIME,
    releaseDate,
    releaseNotes: MA_RELEASE_NOTES
  }
}

/**
 * Get Read Tracker (RT) version information
 */
export function getRTVersionInfo(): VersionInfo {
  const releaseDate = new Date(RT_RELEASE_TIME).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return {
    version: RT_VERSION,
    releaseTime: RT_RELEASE_TIME,
    releaseDate,
    releaseNotes: RT_RELEASE_NOTES
  }
}

/**
 * Get formatted version string for display (default)
 */
export function getVersionString(): string {
  return `v${APP_VERSION}`
}

/**
 * Get formatted MyApps (MA) version string for display
 */
export function getMAVersionString(): string {
  return `v${MA_VERSION}`
}

/**
 * Get formatted Read Tracker (RT) version string for display
 */
export function getRTVersionString(): string {
  return `v${RT_VERSION}`
}

/**
 * Get formatted version with release date
 */
export function getVersionWithReleaseDate(): string {
  const info = getVersionInfo()
  return `${getVersionString()} (Released: ${info.releaseDate})`
}

/**
 * Get release notes formatted for display (default)
 * Renders markdown to HTML
 */
export function getFormattedReleaseNotes(): string {
  if (!RELEASE_NOTES) return ''
  // Convert escaped newlines to actual newlines
  const notes = RELEASE_NOTES.replace(/\\n/g, '\n')
  // Render markdown to HTML
  return marked.parse(notes) as string
}

/**
 * Get MyApps (MA) release notes formatted for display
 * Renders markdown to HTML
 */
export function getMAFormattedReleaseNotes(): string {
  if (!MA_RELEASE_NOTES) return ''
  // Convert escaped newlines to actual newlines
  const notes = MA_RELEASE_NOTES.replace(/\\n/g, '\n')
  // Render markdown to HTML
  return marked.parse(notes) as string
}

/**
 * Get Read Tracker (RT) release notes formatted for display
 * Renders markdown to HTML
 */
export function getRTFormattedReleaseNotes(): string {
  if (!RT_RELEASE_NOTES) return ''
  // Convert escaped newlines to actual newlines
  const notes = RT_RELEASE_NOTES.replace(/\\n/g, '\n')
  // Render markdown to HTML
  return marked.parse(notes) as string
}
