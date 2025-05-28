import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-create-board-dialog",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './create-board-dialog.component.html',
  styleUrl: './create-board-dialog.component.scss',  
})
export class CreateBoardDialogComponent {
  private fb = inject(FormBuilder)
  private dialogRef = inject(MatDialogRef<CreateBoardDialogComponent>)

  boardForm: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ["", [Validators.maxLength(200)]],
  })

  onSubmit() {
    if (this.boardForm.valid) {
      this.dialogRef.close(this.boardForm.value)
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}