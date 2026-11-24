
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { ListCard } from '../list-card/list-card';
import { Tags } from '../tags/tags';
import {
  GroceryItem,
  UsualItem
} from '../../api/types/grocery.type';
import { AddNew } from '../add-new/add-new';
import { GroceryService } from '../../api/supabase/grocery.service';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    MatIconModule,
    ListCard,
    MatAnchor,
    MatButtonModule,
    Tags,
    AddNew
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class List implements OnInit {

  readonly groceryService = inject(GroceryService);
  private readonly destroyRef = inject(DestroyRef);

  groceryItems = signal<GroceryItem[]>([]);
  selectedItem = signal<GroceryItem | null>(null);
  loadError = signal('');

  readonly itemCount = computed(() =>
    this.groceryItems().filter(item => !item.isCompleted).length
  );
  readonly completedItems = computed(() =>
    this.groceryItems().filter(item => item.isCompleted)
  );
  readonly activeItems = computed(() =>
    this.groceryItems().filter(item => !item.isCompleted)
  );
  readonly pickedUpMessage = computed(() => {
    const completed = this.completedItems();
    return completed.length === 1
      ? `${completed[0].title} picked up!`
      : `${completed.length} items picked up!`;
  });

  ngOnInit(): void {
    this.loadGroceryItems();

    // Reload the household list whenever Supabase broadcasts a table change.
    this.groceryService.watchGroceryItemChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadGroceryItems(),
        error: error => {
          console.error('Grocery realtime updates failed:', error);
          this.loadError.set('Live grocery updates are unavailable.');
        }
      });
  }

  usualItems: UsualItem[] = [
    {
      id: 'apples',
      title: 'Apples',
      emoji: '🍎',
      quantity: 1,
      unit: 'bag'
    },
    {
      id: 'bananas',
      title: 'Bananas',
      emoji: '🍌',
      quantity: 1,
      unit: 'bunch'
    }
  ];

addUsualItem(item: UsualItem): void {
  // The database has no usual_item_id column, so avoid duplicates by name.
  const alreadyAdded = this.groceryItems().some(
    grocery => grocery.title.trim().toLowerCase() === item.title.toLowerCase()
  );

  if (alreadyAdded) return;

  this.groceryService.addGroceryItem({
    title: item.title,
    quantity: item.quantity,
    unit: item.unit,
    addedBy: '',
    isCompleted: false,
    createdAt: new Date().toISOString()
  }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: savedItem => this.groceryItems.update(items => [...items, savedItem]),
    error: error => console.error('Could not add grocery item:', error)
  });
}

onCompletedChange(id: string, completed: boolean): void {
  this.updateItem(id, { isCompleted: completed });
}

onQuantityChange(id: string, quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return;
  }

  this.updateItem(id, { quantity });
}

saveItem(item: GroceryItem): void {
  if (this.selectedItem()) {
    const { id, ...changes } = item;

    this.groceryService.editGroceryItem(id, changes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: savedItem => {
        this.replaceItem(savedItem);
        this.selectedItem.set(null);
      },
      error: error => console.error('Could not edit grocery item:', error)
    });
    return;
  }

  const { id, ...newItem } = item;

  this.groceryService.addGroceryItem(newItem)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
    next: savedItem => {
      this.groceryItems.update(items => [...items, savedItem]);
      this.selectedItem.set(null);
    },
    error: error => console.error('Could not add grocery item:', error)
  });
}

startEditing(item: GroceryItem): void {
  this.selectedItem.set(item);
}

deleteItem(id: string): void {
  this.groceryService.deleteGroceryItem(id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
    next: () => {
      this.groceryItems.update(items => items.filter(item => item.id !== id));
    },
    error: error => console.error('Could not delete grocery item:', error)
  });
}

private updateItem(
  id: string,
  changes: Partial<Omit<GroceryItem, 'id'>>
): void {
  this.groceryService.editGroceryItem(id, changes)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
    next: savedItem => this.replaceItem(savedItem),
    error: error => console.error('Could not update grocery item:', error)
  });
}

private replaceItem(savedItem: GroceryItem): void {
  this.groceryItems.update(items =>
    items.map(item => item.id === savedItem.id ? savedItem : item)
  );
}

private loadGroceryItems(): void {
  this.groceryService.getGroceryItems()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: items => {
        this.groceryItems.set(items);
        this.loadError.set('');
      },
      error: error => {
        console.error('Could not load grocery items:', error);
        this.loadError.set('Could not load grocery items. Please try again.');
      }
    });
}
}
