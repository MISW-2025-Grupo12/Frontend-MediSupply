import { Routes } from "@angular/router";
import { SalesComponent } from "./pages/sales/sales.component";
import { SalesReportComponent } from "./pages/sales-report/sales-report.component";
import { SalesPlanComponent } from "./pages/sales-plan/sales-plan";
import { CreateSalesPlan } from "./pages/create-sales-plan/create-sales-plan";

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
    path: 'reportes-de-ventas',
    component: SalesReportComponent,
    data: { titleKey: 'titles.salesReport' }
  },
  {
    path: 'sales-plan',
    component: SalesPlanComponent,
    data: { titleKey: 'titles.salesPlan' }
  },
  {
    path: 'plan-de-ventas',
    component: SalesPlanComponent,
    data: { titleKey: 'titles.salesPlan' }
  },
  {
    path: 'add-sales-plan',
    component: CreateSalesPlan,
    data: { titleKey: 'titles.addSalesPlan' }
  },
  {
    path: 'anadir-plan-de-ventas',
    component: CreateSalesPlan,
    data: { titleKey: 'titles.addSalesPlan' }
  }
];