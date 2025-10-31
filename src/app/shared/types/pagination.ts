export type Pagination = {
  has_next: boolean;
  has_prev: boolean;
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}