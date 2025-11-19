import { Injectable, ErrorHandler, NgZone } from '@angular/core';

/**
 * Service to handle chunk loading errors that can occur during deployments.
 * This is especially important when the browser has cached an old index.html
 * that references chunk files that no longer exist after a new deployment.
 */
@Injectable({
  providedIn: 'root'
})
export class ChunkLoadingErrorHandler implements ErrorHandler {
  private hasReloaded = false;

  constructor(private ngZone: NgZone) {}

  handleError(error: any): void {
    // Check if this is a chunk loading error
    if (this.isChunkLoadingError(error)) {
      if (this.hasReloaded) {
        // Already tried reloading, just log the error
        console.error('Chunk loading error persists after reload:', error);
        return;
      }

      console.warn('Chunk loading error detected. Reloading page...');
      this.hasReloaded = true;
      
      // Reload the page - if server has proper cache headers, this will get fresh index.html
      this.ngZone.runOutsideAngular(() => {
        window.location.reload();
      });
    } else {
      // Not a chunk loading error, log it normally
      console.error('Application error:', error);
    }
  }

  /**
   * Check if the error is a chunk loading error
   */
  private isChunkLoadingError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString() || '';
    const errorStack = error.stack || '';

    // Common chunk loading error patterns
    const chunkErrorPatterns = [
      'Loading chunk',
      'ChunkLoadError',
      'Failed to fetch dynamically imported module',
      'Importing a module script failed',
      'Failed to load module script',
      'Loading CSS chunk',
      'networkerror',
      'Failed to fetch'
    ];

    // Check if error message or stack contains chunk loading indicators
    const isChunkError = chunkErrorPatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
      errorStack.toLowerCase().includes(pattern.toLowerCase())
    );

    // Also check for 404 errors on .js files (likely chunk files)
    if (error.status === 404 || error.status === 0) {
      const url = error.url || errorMessage;
      if (url && (url.includes('.js') || url.includes('chunk-'))) {
        return true;
      }
    }

    return isChunkError;
  }
}

