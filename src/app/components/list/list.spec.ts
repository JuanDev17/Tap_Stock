import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';
import { vi } from 'vitest';
import { GroceryItem } from '../../api/types/grocery.type';
import { GroceryService } from '../../api/supabase/grocery.service';
import { List } from './list';

describe('List', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  const eggs: GroceryItem = {
    id: '1',
    title: 'Eggs',
    quantity: 2,
    unit: 'dozen',
    addedBy: 'Juan',
    isCompleted: false,
    createdAt: new Date().toISOString()
  };
  let groceryService: {
    getGroceryItems: ReturnType<typeof vi.fn>;
    watchGroceryItemChanges: ReturnType<typeof vi.fn>;
    editGroceryItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    groceryService = {
      getGroceryItems: vi.fn(() => of([eggs])),
      watchGroceryItemChanges: vi.fn(() => NEVER),
      editGroceryItem: vi.fn((_id: string, changes: Partial<GroceryItem>) =>
        of({ ...eggs, ...changes })
      )
    };

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [{ provide: GroceryService, useValue: groceryService }]
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates an active item quantity when its quantity button is clicked', () => {
    fixture.detectChanges();

    const increaseButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.quantity-button:last-child');
    increaseButton.click();

    expect(component.groceryItems()[0].quantity).toBe(3);
  });

  it('shows completed items in the picked-up section instead of active items', () => {
    const milk: GroceryItem = {
      id: '2',
      title: 'Milk',
      quantity: 1,
      unit: 'bottle',
      addedBy: 'Juan',
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    component.groceryItems.set([...component.groceryItems(), milk]);

    component.onCompletedChange('1', true);
    fixture.detectChanges();

    const activeTitles = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLHeadingElement>('.main-container > .cards-container .item-content h3'),
      (heading: HTMLHeadingElement) => heading.textContent?.trim()
    );
    const pickedUpTitles = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLHeadingElement>('.picked-up-section .item-content h3'),
      (heading: HTMLHeadingElement) => heading.textContent?.trim()
    );

    expect(activeTitles).toEqual(['Milk']);
    expect(pickedUpTitles).toEqual(['Eggs']);
  });
});
