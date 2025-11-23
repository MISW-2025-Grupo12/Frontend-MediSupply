import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TranslocoDirective } from '@ngneat/transloco';
import { SellerReport } from '../../../../shared/models/sellerReport.model';

@Component({
  selector: 'app-sellers-report',
  imports: [CommonModule, MatTableModule, TranslocoDirective],
  templateUrl: './sellers-report.html',
  styleUrl: './sellers-report.scss'
})
export class SellersReport {
  sellers = input.required<SellerReport[]>();

  displayedColumns: string[] = ['position', 'sellerName', 'totalOrders', 'totalSales', 'totalCustomers'];

  tableData = computed(() => {
    return this.sellers().map((seller, index) => ({
      position: index + 1,
      sellerName: seller.sellerName || 'N/A',
      totalOrders: seller.totalOrders ?? 0,
      totalSales: seller.totalSales ?? 0,
      totalCustomers: seller.totalCustomers ?? 0
    }));
  });
}

