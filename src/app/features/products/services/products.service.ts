import { inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ApiClientService, ServiceType } from '../../../core/services/api-client.service';
import { CategoryDTO } from '../../../shared/DTOs/categoryDTO.model';
import { ProviderDTO } from '../../../shared/DTOs/providerDTO.model';
import { Category } from '../../../shared/models/category.model';
import { Provider } from '../../../shared/models/provider.model';
import { Product } from '../../../shared/models/product.model';
import { AddProductDTO } from '../../../shared/DTOs/addProductDTO.model';
import { ProductDTO } from '../../../shared/DTOs/productDTO.model';
import { ProductWithLocationDTO } from '../../../shared/DTOs/productWithLocationDTO.model';
import { ProductWithLocation } from '../../../shared/models/productWithLocation.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiClient = inject(ApiClientService);
  private serviceType: ServiceType = 'products';

  getProviders(): Observable<Provider[]> {
    return this.apiClient.get<ProviderDTO[]>('/proveedores', 'users')
      .pipe(
        map(providers => providers.map(p => ({
          id: p.id,
          name: p.nombre,
          email: p.email,
          address: p.direccion
        })))
      );
  }

  getCategories(): Observable<Category[]> {
    return this.apiClient.get<CategoryDTO[]>('/categorias', this.serviceType)
      .pipe(
        map(categories => categories.map(c => ({
          id: c.id,
          name: c.nombre,
          description: c.descripcion
        })))
      );
  }

  addProduct(product: Product): Observable<Product> {
    const addProductDTO: AddProductDTO = {
      nombre: product.name,
      descripcion: product.description,
      precio: product.price,
      stock: product.stock,
      fecha_vencimiento: product.expirationDate.toISOString(),
      categoria: product.category.name,
      categoria_id: product.category.id.toString(),
      proveedor_id: product.provider.id.toString(),
    }

    debugger;

    return this.apiClient.post<ProductDTO>('/productos/con-inventario', addProductDTO, this.serviceType)
      .pipe(
        map(product => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            stock: product.stock,
            expirationDate: new Date(product.fecha_vencimiento),
            category: {
              id: product.categoria.id,
              name: product.categoria.nombre,
              description: product.categoria.descripcion
            },
            provider: {
              id: product.proveedor.id,
              name: product.proveedor.nombre,
              email: product.proveedor.email,
              address: product.proveedor.direccion
            }
          }))
      );
  }

  getProducts(): Observable<Product[]> {
    // TODO: Replace with real API call when backend is ready
    // return this.apiClient.get<ProductDTO[]>('/productos', 'products')
    //   .pipe(
    //     map(products => products.map(p => ({
    //       id: p.id,
    //       name: p.nombre,
    //       description: p.descripcion,
    //       price: p.precio,
    //       stock: p.stock,
    //       expirationDate: new Date(p.fecha_vencimiento),
    //       category: {
    //         id: p.categoria.id,
    //         name: p.categoria.nombre,
    //         description: p.categoria.descripcion
    //       },
    //       provider: {
    //         id: p.proveedor.id,
    //         name: p.proveedor.nombre,
    //         email: p.proveedor.email,
    //         address: p.proveedor.direccion
    //       }
    //     })))
    //   );

    // Mock data for development
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Aspirin 500mg',
        description: 'Pain reliever and fever reducer. Effective for headaches, muscle aches, and minor pains.',
        price: 12.99,
        stock: 150,
        expirationDate: new Date('2025-12-31'),
        category: {
          id: '1',
          name: 'Medicines',
          description: 'Medical products and pharmaceuticals'
        },
        provider: {
          id: '1',
          name: 'PharmaCorp Inc.',
          email: 'contact@pharmacorp.com',
          address: '123 Medical St.'
        }
      },
      {
        id: '2',
        name: 'Surgical Gloves - Latex',
        description: 'Sterile latex surgical gloves. Size M. Box of 100 units.',
        price: 24.50,
        stock: 8,
        expirationDate: new Date('2026-06-30'),
        category: {
          id: '2',
          name: 'Equipment',
          description: 'Medical equipment and tools'
        },
        provider: {
          id: '2',
          name: 'MediEquip Solutions',
          email: 'sales@mediequip.com',
          address: '456 Healthcare Ave.'
        }
      },
      {
        id: '3',
        name: 'Bandages Roll',
        description: 'Elastic bandage roll for wound care and support. 10cm x 4.5m.',
        price: 8.75,
        stock: 200,
        expirationDate: new Date('2027-03-15'),
        category: {
          id: '3',
          name: 'Supplies',
          description: 'Medical supplies and consumables'
        },
        provider: {
          id: '3',
          name: 'HealthCare Supplies Co.',
          email: 'info@healthcaresupplies.com',
          address: '789 Supply Lane'
        }
      },
      {
        id: '4',
        name: 'Digital Thermometer',
        description: 'Fast and accurate digital thermometer with fever alarm. Battery included.',
        price: 15.99,
        stock: 45,
        expirationDate: new Date('2028-01-20'),
        category: {
          id: '2',
          name: 'Equipment',
          description: 'Medical equipment and tools'
        },
        provider: {
          id: '2',
          name: 'MediEquip Solutions',
          email: 'sales@mediequip.com',
          address: '456 Healthcare Ave.'
        }
      },
      {
        id: '5',
        name: 'Antiseptic Solution 500ml',
        description: 'Broad-spectrum antiseptic solution for skin disinfection and wound cleaning.',
        price: 18.25,
        stock: 5,
        expirationDate: new Date('2025-11-15'),
        category: {
          id: '3',
          name: 'Supplies',
          description: 'Medical supplies and consumables'
        },
        provider: {
          id: '1',
          name: 'PharmaCorp Inc.',
          email: 'contact@pharmacorp.com',
          address: '123 Medical St.'
        }
      },
      {
        id: '6',
        name: 'Hand Sanitizer Gel 250ml',
        description: 'Alcohol-based hand sanitizer gel. Kills 99.9% of germs. Fresh scent.',
        price: 6.50,
        stock: 180,
        expirationDate: new Date('2026-08-10'),
        category: {
          id: '4',
          name: 'Personal Care',
          description: 'Personal care and hygiene products'
        },
        provider: {
          id: '3',
          name: 'HealthCare Supplies Co.',
          email: 'info@healthcaresupplies.com',
          address: '789 Supply Lane'
        }
      },
      {
        id: '7',
        name: 'Blood Pressure Monitor',
        description: 'Automatic digital blood pressure monitor with large LCD display and memory function.',
        price: 89.99,
        stock: 22,
        expirationDate: new Date('2029-05-25'),
        category: {
          id: '2',
          name: 'Equipment',
          description: 'Medical equipment and tools'
        },
        provider: {
          id: '2',
          name: 'MediEquip Solutions',
          email: 'sales@mediequip.com',
          address: '456 Healthcare Ave.'
        }
      },
      {
        id: '8',
        name: 'Ibuprofen 400mg',
        description: 'Anti-inflammatory and pain relief medication. 30 tablets per box.',
        price: 14.99,
        stock: 120,
        expirationDate: new Date('2026-02-28'),
        category: {
          id: '1',
          name: 'Medicines',
          description: 'Medical products and pharmaceuticals'
        },
        provider: {
          id: '1',
          name: 'PharmaCorp Inc.',
          email: 'contact@pharmacorp.com',
          address: '123 Medical St.'
        }
      },
      {
        id: '9',
        name: 'Disposable Face Masks',
        description: '3-layer disposable face masks. Box of 50 units. Comfortable ear loops.',
        price: 19.99,
        stock: 3,
        expirationDate: new Date('2025-10-30'),
        category: {
          id: '5',
          name: 'Emergency',
          description: 'Emergency and protective equipment'
        },
        provider: {
          id: '3',
          name: 'HealthCare Supplies Co.',
          email: 'info@healthcaresupplies.com',
          address: '789 Supply Lane'
        }
      },
      {
        id: '10',
        name: 'Sterile Gauze Pads',
        description: 'Sterile gauze pads for wound dressing. 10x10cm. Pack of 20.',
        price: 11.50,
        stock: 95,
        expirationDate: new Date('2027-09-12'),
        category: {
          id: '3',
          name: 'Supplies',
          description: 'Medical supplies and consumables'
        },
        provider: {
          id: '3',
          name: 'HealthCare Supplies Co.',
          email: 'info@healthcaresupplies.com',
          address: '789 Supply Lane'
        }
      },
      {
        id: '11',
        name: 'First Aid Kit',
        description: 'Complete first aid kit with essential supplies for emergency care. 100 pieces.',
        price: 45.00,
        stock: 35,
        expirationDate: new Date('2028-04-18'),
        category: {
          id: '5',
          name: 'Emergency',
          description: 'Emergency and protective equipment'
        },
        provider: {
          id: '2',
          name: 'MediEquip Solutions',
          email: 'sales@mediequip.com',
          address: '456 Healthcare Ave.'
        }
      },
      {
        id: '12',
        name: 'Vitamin C Tablets 1000mg',
        description: 'High-potency vitamin C supplement. Supports immune system. 60 tablets.',
        price: 16.75,
        stock: 7,
        expirationDate: new Date('2025-11-05'),
        category: {
          id: '4',
          name: 'Personal Care',
          description: 'Personal care and hygiene products'
        },
        provider: {
          id: '1',
          name: 'PharmaCorp Inc.',
          email: 'contact@pharmacorp.com',
          address: '123 Medical St.'
        }
      }
    ];

    return of(mockProducts);
  }

  getProductsWithLocation(): Observable<ProductWithLocation[]> {
    return this.apiClient.get<ProductWithLocationDTO[]>('/bodegas/productos', 'logistics')
      .pipe(
        map(products => products.map(p => ({
          id: p.id,
          name: p.nombre,
          description: p.descripcion,
          price: p.precio,
          stock: p.stock,
          expirationDate: new Date(p.fecha_vencimiento),
          category: {
            id: p.categoria.id,
            name: p.categoria.nombre,
            description: p.categoria.descripcion
          },
          provider: {
            id: p.proveedor.id,
            name: p.proveedor.nombre,
            email: p.proveedor.email,
            address: p.proveedor.direccion
          },
          requiresColdChain: p.requiere_cadena_frio,
          locations: p.ubicaciones.map(l => ({
            id: l.id,
            name: l.nombre,
            aisle: l.pasillo,
            rack: l.estante,
            available_quantity: l.stock_disponible,
            reserved_quantity: l.stock_reservado
          }))
        })))
      );
  }

  createProductCategory(category: Partial<Category>): Observable<Category> {
    const dto = {
      nombre: category.name,
      descripcion: category.description
    }

    return this.apiClient.post<CategoryDTO>('/categorias', dto, this.serviceType).pipe(
      map(response => ({
        id: response.id,
        name: response.nombre,
        description: response.descripcion
      }))
    );
  }
}
