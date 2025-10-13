import { Routes } from "@angular/router";
import { SalesComponent } from "./pages/sales/sales.component";
import { SalesReportComponent } from "./pages/sales-report/sales-report.component";

export const SALES_ROUTES: Routes = [
  { 
    path: '', 
    component: SalesComponent,
    data: { titleKey: 'titles.sales' }
  },
  {
    path: 'sales-report',
    component: SalesReportComponent,
    data: { titleKey: 'titles.salesReport' }
  },
  {
    path: 'reporteDeVentas',
    component: SalesReportComponent,
    data: { titleKey: 'titles.salesReport' }
  }
];