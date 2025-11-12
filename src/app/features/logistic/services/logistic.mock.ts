import { DeliveryDTO } from '../../../shared/DTOs/deliveryDTO.model';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';

export const MOCK_LOGISTIC_DELIVERIES_RESPONSE: PaginatedResponseDTO<DeliveryDTO> = {
  items: [
    {
      id: 'DEL-1001',
      direccion: 'Calle 45 #12-34, Bogotá',
      fecha_entrega: '2025-11-15T09:00:00Z',
      pedido: {
        id: 'PED-9001',
        total: 320000,
        estado: 'EN_RUTA',
        fecha_confirmacion: '2025-11-10T18:30:00Z',
        vendedor_id: 'VEN-501',
        cliente: {
          nombre: 'Clínica Santa María',
          telefono: '+57 1 4567890',
          direccion: 'Av. Caracas 78-25, Bogotá',
          avatar: 'https://ui-avatars.com/api/?name=Clinica+Santa+Maria'
        },
        productos: [
          {
            producto_id: 'PROD-301',
            nombre: 'Guantes de nitrilo talla M',
            cantidad: 200,
            precio_unitario: 1200,
            subtotal: 240000,
            avatar: 'https://cdn.example.com/products/gloves.png'
          },
          {
            producto_id: 'PROD-112',
            nombre: 'Mascarillas quirúrgicas',
            cantidad: 400,
            precio_unitario: 200,
            subtotal: 80000,
            avatar: 'https://cdn.example.com/products/masks.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1002',
      direccion: 'Carrera 7 #156-30, Bogotá',
      fecha_entrega: '2025-11-15T13:30:00Z',
      pedido: {
        id: 'PED-9002',
        total: 175000,
        estado: 'PENDIENTE',
        fecha_confirmacion: '2025-11-11T11:45:00Z',
        vendedor_id: 'VEN-502',
        cliente: {
          nombre: 'Hospital San José',
          telefono: '+57 1 9876543',
          direccion: 'Calle 10 # 19-25, Bogotá',
          avatar: 'https://ui-avatars.com/api/?name=Hospital+San+Jose'
        },
        productos: [
          {
            producto_id: 'PROD-215',
            nombre: 'Batas desechables',
            cantidad: 150,
            precio_unitario: 500,
            subtotal: 75000,
            avatar: 'https://cdn.example.com/products/gowns.png'
          },
          {
            producto_id: 'PROD-340',
            nombre: 'Solución salina 0.9%',
            cantidad: 50,
            precio_unitario: 2000,
            subtotal: 100000,
            avatar: 'https://cdn.example.com/products/saline.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1003',
      direccion: 'Diagonal 73 # 21-19, Bogotá',
      fecha_entrega: '2025-11-15T18:15:00Z',
      pedido: {
        id: 'PED-9003',
        total: 86000,
        estado: 'ENTREGADO',
        fecha_confirmacion: '2025-11-09T07:20:00Z',
        vendedor_id: 'VEN-503',
        cliente: {
          nombre: 'Centro Odontológico Smile',
          telefono: '+57 1 2233445',
          direccion: 'Calle 123 # 45-67, Bogotá',
          avatar: 'https://ui-avatars.com/api/?name=Centro+Odontologico+Smile'
        },
        productos: [
          {
            producto_id: 'PROD-118',
            nombre: 'Kits de profilaxis dental',
            cantidad: 80,
            precio_unitario: 400,
            subtotal: 32000,
            avatar: 'https://cdn.example.com/products/prophylaxis.png'
          },
          {
            producto_id: 'PROD-512',
            nombre: 'Anestésico dental 40ml',
            cantidad: 60,
            precio_unitario: 900,
            subtotal: 54000,
            avatar: 'https://cdn.example.com/products/anesthetic.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1004',
      direccion: 'Transversal 60 #22-15, Medellín',
      fecha_entrega: '2025-11-16T10:45:00Z',
      pedido: {
        id: 'PED-9004',
        total: 452000,
        estado: 'PREPARANDO',
        fecha_confirmacion: '2025-11-12T16:00:00Z',
        vendedor_id: 'VEN-504',
        cliente: {
          nombre: 'Clínica Las Américas',
          telefono: '+57 4 4488000',
          direccion: 'Carrera 70 # 1-135, Medellín',
          avatar: 'https://ui-avatars.com/api/?name=Clinica+Las+Americas'
        },
        productos: [
          {
            producto_id: 'PROD-420',
            nombre: 'Bombas de infusión',
            cantidad: 20,
            precio_unitario: 15000,
            subtotal: 300000,
            avatar: 'https://cdn.example.com/products/infusion-pump.png'
          },
          {
            producto_id: 'PROD-305',
            nombre: 'Catéteres centrales',
            cantidad: 60,
            precio_unitario: 1200,
            subtotal: 72000,
            avatar: 'https://cdn.example.com/products/catheter.png'
          },
          {
            producto_id: 'PROD-198',
            nombre: 'Gasas estériles',
            cantidad: 500,
            precio_unitario: 160,
            subtotal: 80000,
            avatar: 'https://cdn.example.com/products/gauze.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1005',
      direccion: 'Calle 5 #45-67, Cali',
      fecha_entrega: '2025-11-16T07:00:00Z',
      pedido: {
        id: 'PED-9005',
        total: 268500,
        estado: 'EN_RUTA',
        fecha_confirmacion: '2025-11-13T09:25:00Z',
        vendedor_id: 'VEN-505',
        cliente: {
          nombre: 'Hospital Universitario del Valle',
          telefono: '+57 2 5570000',
          direccion: 'Calle 5 # 36-08, Cali',
          avatar: 'https://ui-avatars.com/api/?name=HUV'
        },
        productos: [
          {
            producto_id: 'PROD-510',
            nombre: 'Monitores de signos vitales',
            cantidad: 12,
            precio_unitario: 8500,
            subtotal: 102000,
            avatar: 'https://cdn.example.com/products/vitals-monitor.png'
          },
          {
            producto_id: 'PROD-225',
            nombre: 'Jeringas de 5ml',
            cantidad: 800,
            precio_unitario: 110,
            subtotal: 88000,
            avatar: 'https://cdn.example.com/products/syringes.png'
          },
          {
            producto_id: 'PROD-560',
            nombre: 'Termómetros digitales',
            cantidad: 150,
            precio_unitario: 520,
            subtotal: 78000,
            avatar: 'https://cdn.example.com/products/thermometer.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1006',
      direccion: 'Av. Las Palmas # 20-50, Medellín',
      fecha_entrega: '2025-11-16T15:20:00Z',
      pedido: {
        id: 'PED-9006',
        total: 198000,
        estado: 'PENDIENTE',
        fecha_confirmacion: '2025-11-12T20:15:00Z',
        vendedor_id: 'VEN-506',
        cliente: {
          nombre: 'Centro Médico El Rosario',
          telefono: '+57 4 2309900',
          direccion: 'Carrera 63C # 78-55, Medellín',
          avatar: 'https://ui-avatars.com/api/?name=Centro+Medico+El+Rosario'
        },
        productos: [
          {
            producto_id: 'PROD-610',
            nombre: 'Respiradores portátiles',
            cantidad: 10,
            precio_unitario: 9500,
            subtotal: 95000,
            avatar: 'https://cdn.example.com/products/portable-respirator.png'
          },
          {
            producto_id: 'PROD-472',
            nombre: 'Tensiómetros digitales',
            cantidad: 50,
            precio_unitario: 850,
            subtotal: 42500,
            avatar: 'https://cdn.example.com/products/blood-pressure.png'
          },
          {
            producto_id: 'PROD-555',
            nombre: 'Oxímetros de pulso',
            cantidad: 70,
            precio_unitario: 875,
            subtotal: 61000,
            avatar: 'https://cdn.example.com/products/pulse-oximeter.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1007',
      direccion: 'Calle 11 # 8-15, Bucaramanga',
      fecha_entrega: '2025-11-17T11:10:00Z',
      pedido: {
        id: 'PED-9007',
        total: 152500,
        estado: 'ENTREGADO',
        fecha_confirmacion: '2025-11-08T14:35:00Z',
        vendedor_id: 'VEN-507',
        cliente: {
          nombre: 'Fundación Cardiovascular',
          telefono: '+57 7 6393939',
          direccion: 'Calle 155A # 23-58, Floridablanca',
          avatar: 'https://ui-avatars.com/api/?name=Fundacion+Cardiovascular'
        },
        productos: [
          {
            producto_id: 'PROD-122',
            nombre: 'Electrodos desechables',
            cantidad: 600,
            precio_unitario: 150,
            subtotal: 90000,
            avatar: 'https://cdn.example.com/products/electrodes.png'
          },
          {
            producto_id: 'PROD-333',
            nombre: 'Gel conductor',
            cantidad: 200,
            precio_unitario: 125,
            subtotal: 25000,
            avatar: 'https://cdn.example.com/products/conductive-gel.png'
          },
          {
            producto_id: 'PROD-275',
            nombre: 'Bolsas de suero lactato',
            cantidad: 75,
            precio_unitario: 500,
            subtotal: 37500,
            avatar: 'https://cdn.example.com/products/lactated-ringers.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1008',
      direccion: 'Carrera 30 # 45-92, Barranquilla',
      fecha_entrega: '2025-11-17T09:45:00Z',
      pedido: {
        id: 'PED-9008',
        total: 214750,
        estado: 'EN_RUTA',
        fecha_confirmacion: '2025-11-15T12:10:00Z',
        vendedor_id: 'VEN-508',
        cliente: {
          nombre: 'Hospital Metropolitano',
          telefono: '+57 5 3854000',
          direccion: 'Carrera 38 # 76-136, Barranquilla',
          avatar: 'https://ui-avatars.com/api/?name=Hospital+Metropolitano'
        },
        productos: [
          {
            producto_id: 'PROD-402',
            nombre: 'Bombas de succión portátiles',
            cantidad: 18,
            precio_unitario: 6200,
            subtotal: 111600,
            avatar: 'https://cdn.example.com/products/suction-pump.png'
          },
          {
            producto_id: 'PROD-287',
            nombre: 'Kits de venoclisis',
            cantidad: 250,
            precio_unitario: 220,
            subtotal: 55000,
            avatar: 'https://cdn.example.com/products/iv-kit.png'
          },
          {
            producto_id: 'PROD-698',
            nombre: 'Bolsas de plasma 500ml',
            cantidad: 120,
            precio_unitario: 400,
            subtotal: 48000,
            avatar: 'https://cdn.example.com/products/plasma-bag.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1009',
      direccion: 'Avenida 80 # 30-25, Medellín',
      fecha_entrega: '2025-11-17T14:05:00Z',
      pedido: {
        id: 'PED-9009',
        total: 189900,
        estado: 'PENDIENTE',
        fecha_confirmacion: '2025-11-16T09:40:00Z',
        vendedor_id: 'VEN-509',
        cliente: {
          nombre: 'Clínica León XIII',
          telefono: '+57 4 4441234',
          direccion: 'Calle 64C # 51D-154, Medellín',
          avatar: 'https://ui-avatars.com/api/?name=Clinica+Leon+XIII'
        },
        productos: [
          {
            producto_id: 'PROD-360',
            nombre: 'Ampolletas de vitamina K',
            cantidad: 90,
            precio_unitario: 780,
            subtotal: 70200,
            avatar: 'https://cdn.example.com/products/vitamin-k.png'
          },
          {
            producto_id: 'PROD-502',
            nombre: 'Sets de intubación',
            cantidad: 45,
            precio_unitario: 1650,
            subtotal: 74250,
            avatar: 'https://cdn.example.com/products/intubation-set.png'
          },
          {
            producto_id: 'PROD-589',
            nombre: 'Guantes estériles talla S',
            cantidad: 300,
            precio_unitario: 155,
            subtotal: 46500,
            avatar: 'https://cdn.example.com/products/sterile-gloves.png'
          }
        ]
      }
    },
    {
      id: 'DEL-1010',
      direccion: 'Calle 39 # 17-75, Bogotá',
      fecha_entrega: '2025-11-15T07:30:00Z',
      pedido: {
        id: 'PED-9010',
        total: 305600,
        estado: 'PREPARANDO',
        fecha_confirmacion: '2025-11-17T17:55:00Z',
        vendedor_id: 'VEN-510',
        cliente: {
          nombre: 'Hospital Militar Central',
          telefono: '+57 1 3488000',
          direccion: 'Transversal 3 # 49-00, Bogotá',
          avatar: 'https://ui-avatars.com/api/?name=Hospital+Militar+Central'
        },
        productos: [
          {
            producto_id: 'PROD-415',
            nombre: 'Equipo de cirugía menor',
            cantidad: 25,
            precio_unitario: 4800,
            subtotal: 120000,
            avatar: 'https://cdn.example.com/products/minor-surgery.png'
          },
          {
            producto_id: 'PROD-742',
            nombre: 'Bolsas de transfusión 350ml',
            cantidad: 150,
            precio_unitario: 420,
            subtotal: 63000,
            avatar: 'https://cdn.example.com/products/transfusion-bag.png'
          },
          {
            producto_id: 'PROD-655',
            nombre: 'Laringoscopios LED',
            cantidad: 18,
            precio_unitario: 6800,
            subtotal: 122400,
            avatar: 'https://cdn.example.com/products/led-laryngoscope.png'
          }
        ]
      }
    }
  ],
  pagination: {
    has_next: false,
    has_prev: false,
    page: 1,
    page_size: 10,
    total_items: 10,
    total_pages: 1
  }
};

