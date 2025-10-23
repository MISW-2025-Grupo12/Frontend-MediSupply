export const environment = {
  production: true,
  // Use the dynamic base URL for backendApiUrl
  backendApiUrl: 'http://localhost:8080',
  // Derive other API URLs from the dynamic base URL
  usersApiUrl: `http://localhost:8080/usuarios/api`,
  productsApiUrl: `http://localhost:8080/productos/api`,
  logisticsApiUrl: `http://localhost:8080/logistica/api`,
  salesApiUrl: `http://localhost:8080/ventas/api`
};
