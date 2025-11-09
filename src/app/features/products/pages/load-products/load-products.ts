import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoDirective } from '@ngneat/transloco';
import { LocaleRouteService } from '../../../../core/services/locale-route.service';
import { ProductsService } from '../../services/products.service';
import type { LoadFileStatus } from '../../../../shared/models/loadFileStatus.model';
import type { LoadFileJob } from '../../../../shared/models/loadFileJob.model';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-load-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslocoDirective
  ],
  templateUrl: './load-products.html',
  styleUrl: './load-products.scss'
})
export class LoadProducts implements OnDestroy {
  private localeRouteService = inject(LocaleRouteService);
  private productsService = inject(ProductsService);

  private pollingSubscription: Subscription | null = null;
  private readonly pollingInterval = 1000;

  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage: string | null = null;
  errorDetails: string | null = null;
  successMessage: string | null = null;
  loadFileStatus: LoadFileStatus | null = null;
  private isProgressDeterminate = false;

  get progressBarMode(): 'determinate' | 'indeterminate' {
    return this.isProgressDeterminate ? 'determinate' : 'indeterminate';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'loadProducts.errors.invalidFileType';
      this.errorDetails = null;
      this.selectedFile = null;
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'loadProducts.errors.fileTooLarge';
      this.errorDetails = null;
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = null;
    this.errorDetails = null;
    this.successMessage = null;
    this.isProgressDeterminate = false;
  }

  onCancel(): void {
    this.selectedFile = null;
    this.errorMessage = null;
    this.errorDetails = null;
    this.successMessage = null;
    this.loadFileStatus = null;
    this.stopPolling();
    this.isUploading = false;
    this.uploadProgress = 0;
    this.isProgressDeterminate = false;
    this.localeRouteService.navigateToRoute('products');
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'loadProducts.errors.noFileSelected';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.isProgressDeterminate = false;
    this.errorMessage = null;
    this.errorDetails = null;
    this.successMessage = null;
    this.loadFileStatus = null;

    this.productsService.addProductsFromFile(this.selectedFile).subscribe({
      next: (job: LoadFileJob) => {
        this.startPolling(job.jobId);
      },
      error: (error) => {
        this.handleUploadError(error);
      }
    });
  }

  getFileName(): string {
    return this.selectedFile?.name || '';
  }

  downloadExampleFile(): void {
    // CSV header with product fields
    const csvHeader = 'nombre,descripcion,precio,stock,fecha_vencimiento,categoria,proveedor\n';
    
    // Example rows with sample data
    const exampleRows = [
      'Paracetamol 500mg,Analgesico y antipiretico para el alivio del dolor y la fiebre,5000,100,2025-12-31,Medicinas,Distribuidora MediPro S.A.S.',
      'Jeringas Desechables 5ml,Jeringas esteriles desechables para uso medico,10000,250,2026-06-30,Medicinas,Distribuidora MediPro S.A.S.',
      'Guantes Nitrilo L,Guantes de nitrilo desechables talla grande,15000,500,2027-03-15,Medicinas,Distribuidora MediPro S.A.S.',
      'Termometro Digital,Termometro digital con pantalla LCD,20000,50,2028-01-20,Medicinas,Distribuidora MediPro S.A.S.',
      'Mascarilla Quirurgica,Mascarilla de proteccion quirurgica de 3 capas,5000,1000,2025-11-15,Medicinas,Distribuidora MediPro S.A.S.'
    ];
    
    const csvContent = csvHeader + exampleRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'ejemplo_productos.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(jobId: string): void {
    this.stopPolling();
    this.pollingSubscription = timer(0, this.pollingInterval)
      .pipe(switchMap(() => this.productsService.getLoadFileStatus(jobId)))
      .subscribe({
        next: (status) => this.handleStatusUpdate(status),
        error: (error) => {
          this.handleUploadError(error);
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private handleStatusUpdate(status: LoadFileStatus): void {
    this.loadFileStatus = status;
    const computedProgress = this.computeProgressPercentage(status);
    this.isProgressDeterminate = computedProgress !== null;

    if (computedProgress !== null) {
      this.uploadProgress = computedProgress;
    }

    if (this.isTerminalStatus(status.status)) {
      this.isUploading = false;
      this.stopPolling();

      if (this.isSuccessStatus(status.status)) {
        if (!this.isProgressDeterminate || this.uploadProgress < 100) {
          this.uploadProgress = 100;
          this.isProgressDeterminate = true;
        }
        this.successMessage = 'loadProducts.success.uploadComplete';
        this.errorMessage = null;
        this.errorDetails = null;
        setTimeout(() => {
          this.localeRouteService.navigateToRoute('products');
        }, 2000);
      } else {
        this.errorMessage = 'loadProducts.errors.uploadFailed';
        this.errorDetails = null;
        this.successMessage = null;
        if (!this.isProgressDeterminate) {
          this.uploadProgress = 0;
        }
      }
    }
  }

  private isTerminalStatus(status: string | undefined): boolean {
    if (!status) {
      return false;
    }

    const normalized = status.toLowerCase();
    return [
      'completed',
      'finished',
      'success',
      'done',
      'failed',
      'error',
      'cancelled',
      'canceled',
      'fallido',
      'fallida',
      'completado',
      'completada',
      'terminado',
      'terminada'
    ].includes(normalized);
  }

  private isSuccessStatus(status: string | undefined): boolean {
    if (!status) {
      return false;
    }

    const normalized = status.toLowerCase();
    return [
      'completed',
      'finished',
      'success',
      'done',
      'completado',
      'completada',
      'exitoso',
      'exitosa',
      'terminado',
      'terminada'
    ].includes(normalized);
  }

  private handleUploadError(error: unknown): void {
    this.isUploading = false;
    this.uploadProgress = 0;
    this.isProgressDeterminate = false;
    this.loadFileStatus = null;
    this.successMessage = null;

    const httpError = this.extractHttpError(error);

    if (httpError) {
      if (httpError.status >= 500) {
        this.errorMessage = 'loadProducts.errors.serverError';
      } else if (httpError.status === 0) {
        this.errorMessage = 'loadProducts.errors.networkError';
      } else {
        this.errorMessage = 'loadProducts.errors.uploadFailed';
      }

      this.errorDetails = this.buildHttpErrorDetails(httpError);
    } else {
      this.errorMessage = 'loadProducts.errors.uploadFailed';
      this.errorDetails = null;
    }

    this.stopPolling();
  }

  private computeProgressPercentage(status: LoadFileStatus | null): number | null {
    const progress = status?.progress;
    if (!progress) {
      return null;
    }

    if (typeof progress.percentage === 'number') {
      return Math.max(0, Math.min(100, progress.percentage));
    }

    const totalLines = progress.totalLines ?? 0;
    const processedLines = progress.processedLines ?? 0;

    if (totalLines > 0 && processedLines >= 0) {
      const computed = (processedLines / totalLines) * 100;
      return Math.max(0, Math.min(100, computed));
    }

    return null;
  }

  private extractHttpError(error: unknown): HttpErrorResponse | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    if (error instanceof HttpErrorResponse) {
      return error;
    }

    const candidate = error as Partial<HttpErrorResponse>;
    if (typeof candidate.status === 'number') {
      return new HttpErrorResponse({
        status: candidate.status,
        statusText: candidate.statusText ?? '',
        url: candidate.url ?? undefined,
        error: candidate.error ?? null
      });
    }

    return null;
  }

  private buildHttpErrorDetails(error: HttpErrorResponse): string | null {
    const details: string[] = [];

    if (error.status) {
      details.push(`Error ${error.status}${error.statusText ? ` - ${error.statusText}` : ''}`);
    }

    const backendMessage = this.resolveBackendErrorMessage(error.error);
    if (backendMessage) {
      details.push(backendMessage);
    } else if (error.message && !error.message.startsWith('Http failure response')) {
      details.push(error.message);
    }

    return details.length > 0 ? details.join('. ') : null;
  }

  private resolveBackendErrorMessage(errorPayload: unknown): string | null {
    if (!errorPayload) {
      return null;
    }

    if (typeof errorPayload === 'string') {
      return errorPayload;
    }

    if (typeof errorPayload === 'object') {
      const maybeMessage = (errorPayload as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
        return maybeMessage;
      }
    }

    return null;
  }
}
