import { Pagination } from "../types/pagination";

export interface PaginatedResponseDTO<T> {
  items: T[];
  pagination: Pagination;
}