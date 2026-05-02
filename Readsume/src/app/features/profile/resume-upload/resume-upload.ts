import { Component, inject, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PDFDocumentProxy, PdfViewerModule } from 'ng2-pdf-viewer';
import { PDFDocument, rgb } from 'pdf-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgSelectComponent } from '@ng-select/ng-select';

import { ProfileService } from '../service/profile-service';
import { FieldService } from '../../../shared/service/field-service';

import { BoundingBoxModel } from '../model/bounding-box.model';
import { FieldGetModel } from '../../../shared/model/field/field.get-model';

@Component({
  selector: 'app-resume-upload',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    NgSelectComponent
  ],
  templateUrl: './resume-upload.html',
  styleUrl: './resume-upload.css',
})
export class ResumeUpload
{
  pdfForm = new FormGroup({
    resumePdf: new FormControl<File | null>(null, { validators: [Validators.required]}),
    resumeFields: new FormControl<number[]>([], {validators: [Validators.required]})
  });
  
  pdfSrc: string | undefined = undefined;

  @ViewChild('drawCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  pdfBytes: Uint8Array | null = null;
  pdfDoc: PDFDocumentProxy | null = null;

  canvasWidth = 700;
  canvasHeight = 800;

  boxes: BoundingBoxModel[] = [];
  drawing = false;
  startX = 0; 
  startY = 0;
  activeBox: BoundingBoxModel | null = null;
  fieldOptions: FieldGetModel[] = [];

  constructor(private router : Router){};

  private profileService = inject(ProfileService);
  private fieldService = inject(FieldService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));

    this.getFields();
    this.getUserFields();
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  getFields() 
  {
    this.fieldService.getFields()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.fieldOptions = data;
        },
        error: (err) =>
        {
          console.log(err);
        }
      });
  }

  getUserFields()
  {
    this.fieldService.getUserFields()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.pdfForm.patchValue({ resumeFields: data.map(x => x.field) });
        },
        error: (err) =>
        {
          console.log(err);
        }
      });
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();

      if (this.drawing)
      {
        this.drawing = false;
        return;
      }

      this.boxes.pop();
      this.redrawCanvas();
    }
  }

  async onFileSelected(event: Event)
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0)
    {
      const file = input.files[0];
      this.pdfForm.patchValue({ resumePdf: file });
      this.pdfSrc = URL.createObjectURL(file);

      const buffer = await file.arrayBuffer();
      this.pdfBytes = new Uint8Array(buffer);
    }
  }

  async onPdfLoaded(pdf: PDFDocumentProxy) {
    this.pdfDoc = pdf;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });

    const wrapper = document.querySelector('.pdf-wrapper') as HTMLElement;
    const availableWidth = wrapper ? wrapper.clientWidth : 700;

    const scale = availableWidth / viewport.width;
    const scaledHeight = Math.ceil(viewport.height * scale);

    const viewer = document.querySelector('pdf-viewer') as HTMLElement;
    if (viewer) {
      viewer.style.width = availableWidth + 'px';
      viewer.style.height = scaledHeight + 'px';
    }
  }

  startDraw(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const insideExisting = this.boxes.some(box =>
      x >= box.x && x <= box.x + box.width &&
      y >= box.y && y <= box.y + box.height
    );
    this.canvasRef.nativeElement.style.cursor = insideExisting ? 'pointer' : 'crosshair';

    if (insideExisting) 
    {
      return;
    }

    this.drawing = true;
    this.startX = x;
    this.startY = y;
  }

  onMouseMove(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const inside = this.boxes.some(box =>
      x >= box.x && x <= box.x + box.width &&
      y >= box.y && y <= box.y + box.height
    );
    this.canvasRef.nativeElement.style.cursor = inside ? 'pointer' : 'crosshair';
  }

  onDraw(e: MouseEvent) {
    if (!this.drawing) 
    {
      return;
    }

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.activeBox = {
      x: Math.min(this.startX, x),
      y: Math.min(this.startY, y),
      width: Math.abs(x - this.startX),
      height: Math.abs(y - this.startY),
    };

    this.redrawCanvas();
  }

  startDrawTouch(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const insideExisting = this.boxes.some(box =>
      x >= box.x && x <= box.x + box.width &&
      y >= box.y && y <= box.y + box.height
    );

    if (insideExisting)
    {
      return;
    }

    this.drawing = true;
    this.startX = x;
    this.startY = y;
  }

  onDrawTouch(e: TouchEvent) {
    e.preventDefault();
    if (!this.drawing) 
    {
      return;
    }

    const touch = e.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.activeBox = {
      x: Math.min(this.startX, x),
      y: Math.min(this.startY, y),
      width: Math.abs(x - this.startX),
      height: Math.abs(y - this.startY),
    };

    this.redrawCanvas();
  }

  endDraw() {
    if (!this.drawing || !this.activeBox) 
    {
      return;
    }

    this.drawing = false;

    if (this.activeBox.width >= 5 && this.activeBox.height >= 5) 
    {
      this.boxes.push(this.activeBox);
    }

    this.activeBox = null;
    this.redrawCanvas();
  }

  redrawCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const canvasBoxes = canvas.getContext('2d')!;
    canvasBoxes.clearRect(0, 0, canvas.width, canvas.height);

    for (const box of [...this.boxes, ...(this.activeBox ? [this.activeBox] : [])]) 
    {
      canvasBoxes.fillStyle = '#0f0f15';
      canvasBoxes.fillRect(box.x, box.y, box.width, box.height);
    }
  }

  clearCanvas() 
  {
    this.boxes = [];
    this.activeBox = null;
    this.redrawCanvas();
  }

  onPageRendered() 
  {
    const viewerCanvas = document.querySelector('pdf-viewer canvas') as HTMLCanvasElement;
    if (!viewerCanvas) 
    {
      return;
    }

    const viewerRect = viewerCanvas.getBoundingClientRect();
    const wrapperRect = (document.querySelector('pdf-viewer') as HTMLElement).getBoundingClientRect();

    const offsetLeft = viewerRect.left - wrapperRect.left;
    const offsetTop = viewerRect.top - wrapperRect.top;

    // sync drawing canvas display size to viewer display size
    const canvas = this.canvasRef.nativeElement;
    canvas.style.width = viewerCanvas.offsetWidth + 'px';
    canvas.style.height = viewerCanvas.offsetHeight + 'px';
    canvas.style.left = offsetLeft + 'px';
    canvas.style.top = offsetTop + 'px';
    canvas.width = viewerCanvas.offsetWidth;
    canvas.height = viewerCanvas.offsetHeight;

    this.canvasWidth = viewerCanvas.offsetWidth;
    this.canvasHeight = viewerCanvas.offsetHeight;
  }

  async burnRedacted() 
  {
    if (!this.pdfBytes || !this.pdfDoc) return;

    const pdfPage = await this.pdfDoc.getPage(1);
    const exportScale = 3;
    const exportViewport = pdfPage.getViewport({ scale: exportScale });

    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = exportViewport.width;
    flatCanvas.height = exportViewport.height;
    const flatCtx = flatCanvas.getContext('2d')!;

    await pdfPage.render({
      canvasContext: flatCtx,
      viewport: exportViewport
    }).promise;

    const scaleX = exportViewport.width / this.canvasWidth;
    const scaleY = exportViewport.height / this.canvasHeight;

    flatCtx.fillStyle = '#000000';
    for (const box of this.boxes) {
      flatCtx.fillRect(
        box.x * scaleX,
        box.y * scaleY,
        box.width * scaleX,
        box.height * scaleY
      );
    }

    const imgData = flatCanvas.toDataURL('image/png');
    const newDoc = await PDFDocument.create();
    const pngImage = await newDoc.embedPng(imgData);
    const newPage = newDoc.addPage([exportViewport.width, exportViewport.height]);
    newPage.drawImage(pngImage, { x: 0, y: 0, width: exportViewport.width, height: exportViewport.height });

    const redactedBytes = await newDoc.save();
    const blob = new Blob([redactedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const redactedFile = new File([blob], 'redacted.pdf', { type: 'application/pdf' });

    this.pdfForm.patchValue({ resumePdf: redactedFile });
    this.submitResume();
  }

  submitResume()
  {
    if (this.pdfForm.get("resumePdf")!.value == null)
    {
      return;
    }

    const newResume = {
      resumePdf: this.pdfForm.get("resumePdf")!.value!,
      resumeFields: this.pdfForm.get("resumeFields")!.value!
    }

    this.profileService.postResume(newResume)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log("pdf uploaded!");
          this.router.navigate(['/home']);
        },
        error: () =>
        {
          console.log("pdf unsuccessful");
        }
      })
  }
}
