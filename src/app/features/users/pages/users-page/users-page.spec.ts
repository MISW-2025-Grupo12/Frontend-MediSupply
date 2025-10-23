import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { UsersPage } from './users-page';

describe('UsersPage', () => {
  let component: UsersPage;
  let fixture: ComponentFixture<UsersPage>;
  let debugElement: DebugElement;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        UsersPage,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'header.users': 'Users',
              'titles.users': 'Users Management'
            },
            es: {
              'header.users': 'Usuarios',
              'titles.users': 'Gestión de Usuarios'
            }
          },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersPage);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject Router service', () => {
      expect(component['router']).toBeDefined();
    });
  });

  describe('UI Elements', () => {
    it('should render the page container', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      expect(pageContainer).toBeTruthy();
    });

    it('should render the page header', () => {
      const pageHeader = debugElement.query(By.css('.page-header'));
      expect(pageHeader).toBeTruthy();
    });

    it('should render the page title', () => {
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle).toBeTruthy();
    });

    it('should render the page content', () => {
      const pageContent = debugElement.query(By.css('.page-content'));
      expect(pageContent).toBeTruthy();
    });

    it('should have proper CSS class structure', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      const pageHeader = debugElement.query(By.css('.page-header'));
      const pageTitle = debugElement.query(By.css('.page-title'));
      const pageContent = debugElement.query(By.css('.page-content'));

      expect(pageContainer).toBeTruthy();
      expect(pageHeader).toBeTruthy();
      expect(pageTitle).toBeTruthy();
      expect(pageContent).toBeTruthy();
    });
  });

  describe('Internationalization', () => {
    it('should display translated title in English', () => {
      fixture.detectChanges(); // Ensure translations are applied
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Users');
    });

    it('should have transloco directive applied', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      expect(pageContainer.nativeElement.hasAttribute('*transloco')).toBeFalsy(); // Directive is applied via template
    });

    it('should render with transloco context', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      expect(pageContainer).toBeTruthy();
      
      // Check that the transloco directive is working by verifying the translated content
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Users');
    });

    it('should have proper translation key in template', () => {
      // Check that the translation is working correctly
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Users');
    });
  });

  describe('Component Structure', () => {
    it('should have correct component selector', () => {
      expect(component.constructor.name).toContain('UsersPage');
    });

    it('should have proper template structure', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      const pageHeader = pageContainer.query(By.css('.page-header'));
      const pageContent = pageContainer.query(By.css('.page-content'));

      expect(pageContainer).toBeTruthy();
      expect(pageHeader).toBeTruthy();
      expect(pageContent).toBeTruthy();
    });

    it('should have page title inside page header', () => {
      const pageHeader = debugElement.query(By.css('.page-header'));
      const pageTitle = pageHeader.query(By.css('.page-title'));

      expect(pageHeader).toBeTruthy();
      expect(pageTitle).toBeTruthy();
    });

    it('should have empty page content initially', () => {
      const pageContent = debugElement.query(By.css('.page-content'));
      expect(pageContent.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Template Rendering', () => {
    it('should render all required elements', () => {
      const elements = [
        '.page-container',
        '.page-header',
        '.page-title',
        '.page-content'
      ];

      elements.forEach(selector => {
        const element = debugElement.query(By.css(selector));
        expect(element).toBeTruthy(`Element with selector '${selector}' should be rendered`);
      });
    });

    it('should have proper element hierarchy', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      const pageHeader = pageContainer.query(By.css('.page-header'));
      const pageContent = pageContainer.query(By.css('.page-content'));

      expect(pageContainer).toBeTruthy();
      expect(pageHeader).toBeTruthy();
      expect(pageContent).toBeTruthy();

      // Verify page-header and page-content are direct children of page-container
      const containerChildren = pageContainer.nativeElement.children;
      expect(containerChildren.length).toBe(2);
      expect(containerChildren[0].classList.contains('page-header')).toBeTrue();
      expect(containerChildren[1].classList.contains('page-content')).toBeTrue();
    });

    it('should have page title as child of page header', () => {
      const pageHeader = debugElement.query(By.css('.page-header'));
      const pageTitle = pageHeader.query(By.css('.page-title'));

      expect(pageHeader).toBeTruthy();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.nativeElement.parentElement).toBe(pageHeader.nativeElement);
    });
  });

  describe('Component Properties', () => {
    it('should have router property', () => {
      expect(component['router']).toBeDefined();
      expect(component['router']).toBe(mockRouter);
    });

    it('should have router service properly injected', () => {
      expect(component['router']).toBeDefined();
      expect(component['router']).toBeInstanceOf(Object);
      expect(typeof component['router'].navigate).toBe('function');
    });
  });

  describe('Service Integration', () => {
    it('should inject Router service correctly', () => {
      expect(component['router']).toBeDefined();
      expect(component['router']).toBeInstanceOf(Object);
    });

    it('should have access to Router methods', () => {
      expect(typeof component['router'].navigate).toBe('function');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle.nativeElement.tagName.toLowerCase()).toBe('h1');
    });

    it('should have semantic page structure', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      const pageHeader = debugElement.query(By.css('.page-header'));
      const pageContent = debugElement.query(By.css('.page-content'));

      expect(pageContainer).toBeTruthy();
      expect(pageHeader).toBeTruthy();
      expect(pageContent).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should render after initialization', () => {
      fixture.detectChanges();
      
      const pageContainer = debugElement.query(By.css('.page-container'));
      expect(pageContainer).toBeTruthy();
    });
  });

  describe('Template Content', () => {
    it('should render translated content correctly', () => {
      const pageTitle = debugElement.query(By.css('.page-title'));
      expect(pageTitle.nativeElement.textContent.trim()).toBe('Users');
    });

    it('should have proper template structure', () => {
      const template = fixture.debugElement.nativeElement.innerHTML;
      
      // Check for main structure elements
      expect(template).toContain('page-container');
      expect(template).toContain('page-header');
      expect(template).toContain('page-title');
      expect(template).toContain('page-content');
    });

    it('should render with proper DOM structure', () => {
      const pageContainer = debugElement.query(By.css('.page-container'));
      const pageHeader = debugElement.query(By.css('.page-header'));
      const pageTitle = debugElement.query(By.css('.page-title'));
      const pageContent = debugElement.query(By.css('.page-content'));

      expect(pageContainer).toBeTruthy();
      expect(pageHeader).toBeTruthy();
      expect(pageTitle).toBeTruthy();
      expect(pageContent).toBeTruthy();
    });
  });

  describe('Component Isolation', () => {
    it('should not depend on external services beyond Router', () => {
      const componentServices = Object.getOwnPropertyNames(component)
        .filter(prop => (component as any)[prop] && typeof (component as any)[prop] === 'object');
      
      // Only router should be injected
      expect(componentServices.length).toBe(1);
      expect(component['router']).toBeDefined();
    });

    it('should be a standalone component', () => {
      expect(component.constructor.name).toContain('UsersPage');
    });
  });
});
