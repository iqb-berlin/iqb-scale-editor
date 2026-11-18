import { Injectable } from '@angular/core';

/** Yes/no confirmation; wrapped so it can be replaced in tests or by a Material dialog later (DEC-007). */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  confirm(message: string): boolean {
    return window.confirm(message);
  }
}
