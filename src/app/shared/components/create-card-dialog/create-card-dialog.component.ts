import { Component, inject, Inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatRippleModule } from "@angular/material/core"

@Component({
  selector: "app-create-card-dialog",
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatRippleModule
  ],
  templateUrl: './create-card-dialog.component.html',
  styleUrl: './create-card-dialog.component.scss', 
})
export class CreateCardDialogComponent {
  private fb = inject(FormBuilder)
  private dialogRef = inject(MatDialogRef<CreateCardDialogComponent>)

  cardForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(1)]],
    description: [""],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { listId: string }) { }

  onSubmit() {
    if (this.cardForm.valid) {
      this.dialogRef.close(this.cardForm.value)
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
