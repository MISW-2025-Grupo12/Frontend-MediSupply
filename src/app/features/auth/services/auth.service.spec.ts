import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppUser } from '../../../shared/models/user.model';
import { AppUserDTO } from '../../../shared/DTOs/addAppUserDTO.model';
import { LoginResponseDTO } from '../../../shared/DTOs/loginResponseDTO.model';
import { RegisterCustomerResponseDTO, RegisterSellerResponseDTO, RegisterAdminResponseDTO, RegisterProviderResponseDTO, RegisterDeliveryResponseDTO } from '../../../shared/DTOs/registerUserReponseDTO.model';
import { UserType } from '../../../shared/enums/user-type';

describe('AuthService', () => {
  let service: AuthService;
  let mockApiClientService: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    const apiClientServiceSpy = jasmine.createSpyObj('ApiClientService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ApiClientService, useValue: apiClientServiceSpy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    mockApiClientService = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject ApiClientService', () => {
      expect(service['apiClient']).toBeDefined();
    });

    it('should initialize with no current user', () => {
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.userRole()).toBeNull();
    });

    it('should initialize with no access token', () => {
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('createUser Method', () => {
    const mockAppUser: AppUser = {
      id: '',
      name: 'John Doe',
      email: 'john@example.com',
      legalId: '12345678',
      phone: '+1234567890',
      address: '123 Main Street',
      password: 'password123',
      role: UserType.CUSTOMER
    };

    const mockAppUserDTO: AppUserDTO = {
      id: '123',
      nombre: 'John Doe',
      email: 'john@example.com',
      identificacion: '12345678',
      telefono: '+1234567890',
      direccion: '123 Main Street',
      password: 'password123'
    };

    it('should create user successfully', () => {
      const mockResponse: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: mockAppUserDTO
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(mockAppUser).subscribe(result => {
        expect(result).toEqual({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          legalId: '12345678',
          phone: '+1234567890',
          address: '123 Main Street',
          role: UserType.CUSTOMER
        });
      });

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-cliente',
        {
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '123 Main Street',
          password: 'password123',
          tipo_usuario: 'cliente'
        },
        'users'
      );
    });

    it('should throw error when password is missing', () => {
      const userWithoutPassword: AppUser = {
        ...mockAppUser,
        password: undefined as any
      };

      expect(() => service.createUser(userWithoutPassword)).toThrowError('Password is required');
    });

    it('should throw error when password is empty', () => {
      const userWithEmptyPassword: AppUser = {
        ...mockAppUser,
        password: ''
      };

      expect(() => service.createUser(userWithEmptyPassword)).toThrowError('Password is required');
    });

    it('should handle API errors', () => {
      const error = new Error('API Error');
      mockApiClientService.post.and.returnValue(throwError(() => error));

      service.createUser(mockAppUser).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (err) => {
          expect(err).toBe(error);
        }
      });
    });

    it('should handle missing address in response', () => {
      const mockResponseWithoutAddress: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '123',
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          password: 'password123'
          // direccion is missing
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithoutAddress));

      service.createUser(mockAppUser).subscribe(result => {
        expect(result.address).toBe('');
      });
    });

    it('should handle numeric ID in response', () => {
      const mockResponseWithNumericId: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: 123,
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '123 Main Street',
          password: 'password123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithNumericId));

      service.createUser(mockAppUser).subscribe(result => {
        expect(result.id).toBe('123');
      });
    });

    it('should handle string ID in response', () => {
      const mockResponseWithStringId: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: 'abc123',
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '123 Main Street',
          password: 'password123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithStringId));

      service.createUser(mockAppUser).subscribe(result => {
        expect(result.id).toBe('abc123');
      });
    });

    it('should handle undefined ID in response', () => {
      const mockResponseWithUndefinedId: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '123 Main Street',
          password: 'password123'
          // id is undefined
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithUndefinedId));

      service.createUser(mockAppUser).subscribe(result => {
        expect(result.id).toBe('');
      });
    });
  });

  describe('getUserPathByUserType Method', () => {
    it('should return correct path for ADMIN', () => {
      expect(service.getUserPathByUserType(UserType.ADMIN)).toBe('administrador');
    });

    it('should return correct path for SELLER', () => {
      expect(service.getUserPathByUserType(UserType.SELLER)).toBe('vendedor');
    });

    it('should return correct path for CUSTOMER', () => {
      expect(service.getUserPathByUserType(UserType.CUSTOMER)).toBe('cliente');
    });

    it('should return correct path for DELIVERY', () => {
      expect(service.getUserPathByUserType(UserType.DELIVERY)).toBe('repartidor');
    });

    it('should return correct path for PROVIDER', () => {
      expect(service.getUserPathByUserType(UserType.PROVIDER)).toBe('proveedor');
    });
  });

  describe('Data Transformation', () => {
    it('should transform AppUser to AppUserDTO correctly', () => {
      const appUser: AppUser = {
        id: '',
        name: 'Jane Smith',
        email: 'jane@example.com',
        legalId: '87654321',
        phone: '+9876543210',
        address: '456 Business Ave',
        password: 'jane123',
        role: UserType.SELLER
      };

      const mockResponse: RegisterSellerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        vendedor: {
          id: '456',
          nombre: 'Jane Smith',
          email: 'jane@example.com',
          identificacion: '87654321',
          telefono: '+9876543210',
          direccion: '456 Business Ave',
          password: 'jane123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(appUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-vendedor',
        {
          nombre: 'Jane Smith',
          email: 'jane@example.com',
          identificacion: '87654321',
          telefono: '+9876543210',
          direccion: '456 Business Ave',
          password: 'jane123',
          tipo_usuario: 'vendedor'
        },
        'users'
      );
    });

    it('should handle numeric legalId and phone', () => {
      const appUser: AppUser = {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        legalId: 12345678,
        phone: 1234567890,
        address: 'Test Address',
        password: 'test123',
        role: UserType.CUSTOMER
      };

      const mockResponse: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '789',
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: 12345678,
          telefono: 1234567890,
          direccion: 'Test Address',
          password: 'test123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(appUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-cliente',
        {
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: 12345678,
          telefono: 1234567890,
          direccion: 'Test Address',
          password: 'test123',
          tipo_usuario: 'cliente'
        },
        'users'
      );
    });
  });

  describe('API Integration', () => {
    it('should call API client with correct endpoint for ADMIN', () => {
      const adminUser: AppUser = {
        id: '',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '11223344',
        phone: '+1111111111',
        address: '',
        password: 'admin123',
        role: UserType.ADMIN
      };

      const mockResponse: RegisterAdminResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        administrador: {
          id: '1',
          nombre: 'Admin User',
          email: 'admin@example.com',
          identificacion: '11223344',
          telefono: '+1111111111',
          direccion: '',
          password: 'admin123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(adminUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-administrador',
        jasmine.any(Object),
        'users'
      );
    });

    it('should call API client with correct endpoint for PROVIDER', () => {
      const providerUser: AppUser = {
        id: '',
        name: 'Provider User',
        email: 'provider@example.com',
        legalId: '55667788',
        phone: '+2222222222',
        address: 'Provider Address',
        password: 'provider123',
        role: UserType.PROVIDER
      };

      const mockResponse: RegisterProviderResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        proveedor: {
          id: '2',
          nombre: 'Provider User',
          email: 'provider@example.com',
          identificacion: '55667788',
          telefono: '+2222222222',
          direccion: 'Provider Address',
          password: 'provider123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(providerUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-proveedor',
        jasmine.any(Object),
        'users'
      );
    });

    it('should call API client with correct endpoint for DELIVERY', () => {
      const deliveryUser: AppUser = {
        id: '',
        name: 'Delivery User',
        email: 'delivery@example.com',
        legalId: '99887766',
        phone: '+3333333333',
        address: '',
        password: 'delivery123',
        role: UserType.DELIVERY
      };

      const mockResponse: RegisterDeliveryResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        repartidor: {
          id: '3',
          nombre: 'Delivery User',
          email: 'delivery@example.com',
          identificacion: '99887766',
          telefono: '+3333333333',
          direccion: '',
          password: 'delivery123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(deliveryUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/registro-repartidor',
        jasmine.any(Object),
        'users'
      );
    });

    it('should use correct service type for API call', () => {
      const testUser: AppUser = {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        password: 'test123',
        role: UserType.CUSTOMER
      };

      mockApiClientService.post.and.returnValue(of({
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '4',
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: 'Test Address',
          password: 'test123'
        }
      }));

      service.createUser(testUser).subscribe();

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(Object),
        'users'
      );
    });
  });

  describe('All User Types Integration', () => {
    const userTypes = [
      { type: UserType.ADMIN, expectedPath: 'administrador' },
      { type: UserType.SELLER, expectedPath: 'vendedor' },
      { type: UserType.CUSTOMER, expectedPath: 'cliente' },
      { type: UserType.DELIVERY, expectedPath: 'repartidor' },
      { type: UserType.PROVIDER, expectedPath: 'proveedor' }
    ];

    userTypes.forEach(({ type, expectedPath }) => {
      it(`should handle ${type} user type correctly`, () => {
        const user: AppUser = {
          id: '',
          name: `${type} User`,
          email: `${type.toLowerCase()}@example.com`,
          legalId: '12345678',
          phone: '+1234567890',
          address: type === UserType.ADMIN || type === UserType.DELIVERY ? '' : 'Test Address',
          password: 'password123',
          role: type
        };

        // Create appropriate mock response based on user type
        let mockResponse: any;
        switch (type) {
          case UserType.ADMIN:
            mockResponse = {
              mensaje: 'Usuario creado exitosamente',
              administrador: {
                id: '123',
                nombre: `${type} User`,
                email: `${type.toLowerCase()}@example.com`,
                identificacion: '12345678',
                telefono: '+1234567890',
                direccion: '',
                password: 'password123'
              }
            };
            break;
          case UserType.SELLER:
            mockResponse = {
              mensaje: 'Usuario creado exitosamente',
              vendedor: {
                id: '123',
                nombre: `${type} User`,
                email: `${type.toLowerCase()}@example.com`,
                identificacion: '12345678',
                telefono: '+1234567890',
                direccion: 'Test Address',
                password: 'password123'
              }
            };
            break;
          case UserType.CUSTOMER:
            mockResponse = {
              mensaje: 'Usuario creado exitosamente',
              cliente: {
                id: '123',
                nombre: `${type} User`,
                email: `${type.toLowerCase()}@example.com`,
                identificacion: '12345678',
                telefono: '+1234567890',
                direccion: 'Test Address',
                password: 'password123'
              }
            };
            break;
          case UserType.DELIVERY:
            mockResponse = {
              mensaje: 'Usuario creado exitosamente',
              repartidor: {
                id: '123',
                nombre: `${type} User`,
                email: `${type.toLowerCase()}@example.com`,
                identificacion: '12345678',
                telefono: '+1234567890',
                direccion: '',
                password: 'password123'
              }
            };
            break;
          case UserType.PROVIDER:
            mockResponse = {
              mensaje: 'Usuario creado exitosamente',
              proveedor: {
                id: '123',
                nombre: `${type} User`,
                email: `${type.toLowerCase()}@example.com`,
                identificacion: '12345678',
                telefono: '+1234567890',
                direccion: 'Test Address',
                password: 'password123'
              }
            };
            break;
        }

        mockApiClientService.post.and.returnValue(of(mockResponse));

        service.createUser(user).subscribe(result => {
          expect(result.role).toBe(type);
          expect(result.name).toBe(`${type} User`);
        });

        expect(mockApiClientService.post).toHaveBeenCalledWith(
          `/auth/registro-${expectedPath}`,
          jasmine.objectContaining({
            nombre: `${type} User`,
            email: `${type.toLowerCase()}@example.com`,
            identificacion: '12345678',
            telefono: '+1234567890',
            password: 'password123',
            tipo_usuario: expectedPath
          }),
          'users'
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string address', () => {
      const userWithEmptyAddress: AppUser = {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '',
        password: 'test123',
        role: UserType.CUSTOMER
      };

      const mockResponse: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '123',
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '',
          password: 'test123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(userWithEmptyAddress).subscribe(result => {
        expect(result.address).toBe('');
      });
    });

    it('should handle null address in response', () => {
      const user: AppUser = {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        password: 'test123',
        role: UserType.CUSTOMER
      };

      const mockResponseWithNullAddress: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '123',
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: null as any,
          password: 'test123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithNullAddress));

      service.createUser(user).subscribe(result => {
        expect(result.address).toBe('');
      });
    });

    it('should handle undefined address in response', () => {
      const user: AppUser = {
        id: '',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        password: 'test123',
        role: UserType.CUSTOMER
      };

      const mockResponseWithUndefinedAddress: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '123',
          nombre: 'Test User',
          email: 'test@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          password: 'test123'
          // direccion is undefined
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponseWithUndefinedAddress));

      service.createUser(user).subscribe(result => {
        expect(result.address).toBe('');
      });
    });

    it('should set current user after successful creation', () => {
      const mockUser: AppUser = {
        id: '',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        password: 'password123',
        role: UserType.CUSTOMER
      };

      const mockResponse: RegisterCustomerResponseDTO = {
        mensaje: 'Usuario creado exitosamente',
        cliente: {
          id: '123',
          nombre: 'John Doe',
          email: 'john@example.com',
          identificacion: '12345678',
          telefono: '+1234567890',
          direccion: '123 Main Street',
          password: 'password123'
        }
      };

      mockApiClientService.post.and.returnValue(of(mockResponse));

      service.createUser(mockUser).subscribe();

      expect(service.getCurrentUser()).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        role: UserType.CUSTOMER
      });
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe(UserType.CUSTOMER);
    });
  });

  describe('User Management Methods', () => {
    const testUser: AppUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      legalId: '12345678',
      phone: '+1234567890',
      address: 'Test Address',
      role: UserType.CUSTOMER
    };

    it('should set current user', () => {
      service.setCurrentUser(testUser);
      
      expect(service.getCurrentUser()).toEqual(testUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.userRole()).toBe(UserType.CUSTOMER);
    });

    it('should get current user', () => {
      service.setCurrentUser(testUser);
      
      expect(service.getCurrentUser()).toEqual(testUser);
    });

    it('should logout user', () => {
      service.setCurrentUser(testUser);
      expect(service.isAuthenticated()).toBeTrue();
      
      service.logout();
      
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.userRole()).toBeNull();
      expect(service.getAccessToken()).toBeNull();
    });

    it('should check if user has specific role', () => {
      service.setCurrentUser(testUser);
      
      expect(service.hasRole(UserType.CUSTOMER)).toBeTrue();
      expect(service.hasRole(UserType.ADMIN)).toBeFalse();
    });

    it('should check if user has any of specified roles', () => {
      service.setCurrentUser(testUser);
      
      expect(service.hasAnyRole([UserType.CUSTOMER, UserType.SELLER])).toBeTrue();
      expect(service.hasAnyRole([UserType.ADMIN, UserType.PROVIDER])).toBeFalse();
    });

    it('should return false for hasRole when no user is set', () => {
      expect(service.hasRole(UserType.CUSTOMER)).toBeFalse();
    });

    it('should return false for hasAnyRole when no user is set', () => {
      expect(service.hasAnyRole([UserType.CUSTOMER])).toBeFalse();
    });
  });

  describe('Login Method', () => {
    const mockLoginResponse: LoginResponseDTO = {
      access_token: 'mock-token-123',
      token_type: 'Bearer',
      expires_in: 3600,
      user_info: {
        id: '123',
        nombre: 'John Doe',
        email: 'john@example.com',
        identificacion: '12345678',
        telefono: '+1234567890',
        direccion: '123 Main Street',
        tipo_usuario: 'cliente'
      }
    };

    it('should login user and store token and user info', () => {
      mockApiClientService.post.and.returnValue(of(mockLoginResponse));

      service.login('john@example.com', 'password123').subscribe(result => {
        expect(result).toEqual({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          legalId: '12345678',
          phone: '+1234567890',
          address: '123 Main Street',
          role: UserType.CUSTOMER
        });
      });

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        '/auth/login',
        { email: 'john@example.com', password: 'password123' },
        'users'
      );

      // Check that user and token are stored
      expect(service.getCurrentUser()).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '123 Main Street',
        role: UserType.CUSTOMER
      });
      expect(service.getAccessToken()).toBe('mock-token-123');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should handle login with different user types', () => {
      const adminLoginResponse: LoginResponseDTO = {
        access_token: 'admin-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user_info: {
          id: '456',
          nombre: 'Admin User',
          email: 'admin@example.com',
          identificacion: '87654321',
          telefono: '+9876543210',
          direccion: '',
          tipo_usuario: 'administrador'
        }
      };

      mockApiClientService.post.and.returnValue(of(adminLoginResponse));

      service.login('admin@example.com', 'admin123').subscribe();

      expect(service.userRole()).toBe(UserType.ADMIN);
      expect(service.getAccessToken()).toBe('admin-token');
    });

    it('should handle login error', () => {
      const error = new Error('Login failed');
      mockApiClientService.post.and.returnValue(throwError(() => error));

      service.login('invalid@example.com', 'wrongpassword').subscribe({
        next: () => fail('Should have thrown an error'),
        error: (err) => {
          expect(err).toBe(error);
        }
      });

      // User should not be set on login error
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('Role Mapping', () => {
    it('should map administrador to ADMIN', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'administrador' });
      expect(result).toBe(UserType.ADMIN);
    });

    it('should map vendedor to SELLER', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'vendedor' });
      expect(result).toBe(UserType.SELLER);
    });

    it('should map cliente to CUSTOMER', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'cliente' });
      expect(result).toBe(UserType.CUSTOMER);
    });

    it('should map repartidor to DELIVERY', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'repartidor' });
      expect(result).toBe(UserType.DELIVERY);
    });

    it('should map proveedor to PROVIDER', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'proveedor' });
      expect(result).toBe(UserType.PROVIDER);
    });

    it('should default to CUSTOMER for unknown tipo_usuario', () => {
      const result = service['mapUserRoleFromDTO']({ tipo_usuario: 'unknown' });
      expect(result).toBe(UserType.CUSTOMER);
    });

    it('should default to CUSTOMER for undefined tipo_usuario', () => {
      const result = service['mapUserRoleFromDTO']({});
      expect(result).toBe(UserType.CUSTOMER);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update isAuthenticated signal when user changes', () => {
      expect(service.isAuthenticated()).toBeFalse();
      
      const testUser: AppUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: 'Test Address',
        role: UserType.CUSTOMER
      };
      
      service.setCurrentUser(testUser);
      expect(service.isAuthenticated()).toBeTrue();
      
      service.logout();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should update userRole signal when user changes', () => {
      expect(service.userRole()).toBeNull();
      
      const adminUser: AppUser = {
        id: '123',
        name: 'Admin User',
        email: 'admin@example.com',
        legalId: '12345678',
        phone: '+1234567890',
        address: '',
        role: UserType.ADMIN
      };
      
      service.setCurrentUser(adminUser);
      expect(service.userRole()).toBe(UserType.ADMIN);
      
      service.logout();
      expect(service.userRole()).toBeNull();
    });
  });
});
