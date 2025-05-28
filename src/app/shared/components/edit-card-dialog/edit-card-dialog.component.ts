import { Component, inject, Inject, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatIconModule } from "@angular/material/icon"
import { MatDividerModule } from "@angular/material/divider"
import type { TrelloCard } from "../../../core/services/trello.service"

@Component({
  selector: "app-edit-card-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-card-dialog.component.html',
  styleUrls: ['./edit-card-dialog.component.scss'],
})
export class EditCardDialogComponent implements OnInit {
  private fb = inject(FormBuilder)
  private dialogRef = inject(MatDialogRef<EditCardDialogComponent>)

  cardForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(1)]],
    desc: [""],
    due: [null],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { card: TrelloCard }) { }

  ngOnInit() {
    // Populate form with existing card data
    this.cardForm.patchValue({
      name: this.data.card.name,
      desc: this.data.card.desc,
      due: this.data.card.due ? new Date(this.data.card.due) : null,
    })
  }

  onSubmit() {
    if (this.cardForm.valid) {
      const formValue = this.cardForm.value
      const updates = {
        name: formValue.name,
        desc: formValue.desc,
        due: formValue.due ? formValue.due.toISOString() : null,
      }
      this.dialogRef.close(updates)
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
