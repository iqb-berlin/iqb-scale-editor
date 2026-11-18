import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SCALE_TYPE_LABELS, ScaleType } from '../../shared/model/scale-type';
import { ConfirmService } from '../../shared/services/confirm.service';
import { IndexScaleEntry, IndexWorkspaceService, ScaleRef } from '../services/index-workspace.service';

/** Data attached to a drop list: target part and scale type. */
export interface DropTarget {
  part: number;
  type: ScaleType;
}

/** Sidebar of an opened acp index: assessment parts with their base and derived scales (DEC-026). */
@Component({
  selector: 'app-index-sidebar',
  imports: [CdkDrag, CdkDropList, CdkDropListGroup, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './index-sidebar.html',
  styleUrl: './index-sidebar.scss',
})
export class IndexSidebar {
  protected readonly ws = inject(IndexWorkspaceService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly types: ScaleType[] = ['base', 'derived'];
  protected readonly typeLabels: Record<ScaleType, string> = {
    base: 'Basis-Skalen',
    derived: 'Abgeleitete Skalen',
  };

  isSelected(e: ScaleRef): boolean {
    const s = this.ws.selected();
    return !!s && s.part === e.part && s.type === e.type && s.index === e.index;
  }

  remove(e: IndexScaleEntry): void {
    const name = e.id || '(ohne ID)';
    if (this.confirmService.confirm(`${SCALE_TYPE_LABELS[e.type]} "${name}" aus dem Index entfernen?`)) {
      this.ws.removeScale(e);
    }
  }

  /** Moves a scale by drag & drop; only within lists of the same type (DEC-029). */
  drop(event: CdkDragDrop<DropTarget, DropTarget, IndexScaleEntry>): void {
    const from = event.item.data;
    const to = event.container.data;
    if (from.type !== to.type) return;
    this.ws.moveScale(from, to.part, event.currentIndex);
  }

  /** Only accept drags of the same scale type. */
  readonly sameType = (drag: CdkDrag<IndexScaleEntry>, drop: CdkDropList<DropTarget>): boolean =>
    drag.data.type === drop.data.type;

  /** Other assessment parts as move targets for the menu. */
  otherParts(e: IndexScaleEntry) {
    return this.ws.parts().filter((p) => p.index !== e.part);
  }

  moveToPart(e: IndexScaleEntry, part: number): void {
    const target = this.ws.parts()[part]?.scales[e.type].length ?? 0;
    this.ws.moveScale(e, part, target);
  }

  statusIcon(e: IndexScaleEntry): string {
    return e.issueCount ? 'error' : e.warningCount ? 'warning' : 'check_circle';
  }

  statusText(e: IndexScaleEntry): string {
    if (e.issueCount) return `${e.issueCount} Fehler`;
    if (e.warningCount) return `${e.warningCount} Warnung(en)`;
    return 'gültig';
  }
}
