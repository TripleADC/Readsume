import { Component, inject, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PDFDocumentProxy, PdfViewerModule } from 'ng2-pdf-viewer';
import { PDFDocument, rgb } from 'pdf-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProfileService } from '../service/profile-service';

import { BoundingBoxModel } from '../model/bounding-box.model';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile 
{
  pdfForm = new FormGroup({
    resumePdf: new FormControl<File | null>(null, { validators: [Validators.required]})
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

  constructor(private router : Router){};

  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
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

  onPdfLoaded(pdf: PDFDocumentProxy) {
    this.pdfDoc = pdf;
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

  onPageRendered() {
    const viewerCanvas = document.querySelector('pdf-viewer canvas') as HTMLCanvasElement;
    if (!viewerCanvas) return;

    // sync drawing canvas display size to viewer display size
    const canvas = this.canvasRef.nativeElement;
    canvas.style.width = viewerCanvas.offsetWidth + 'px';   // 684px
    canvas.style.height = viewerCanvas.offsetHeight + 'px'; // 886px
    canvas.width = viewerCanvas.offsetWidth;
    canvas.height = viewerCanvas.offsetHeight;

    this.canvasWidth = viewerCanvas.offsetWidth;
    this.canvasHeight = viewerCanvas.offsetHeight;
  }

  async downloadRedacted() {
    if (!this.pdfBytes || !this.pdfDoc) return;

    const viewerCanvas = document.querySelector('pdf-viewer canvas') as HTMLCanvasElement;
    if (!viewerCanvas) return;

    // internal resolution — use this for quality
    const internalW = viewerCanvas.width;   // 1026
    const internalH = viewerCanvas.height;  // 1329

    // scale from your drawing canvas → internal resolution
    const scaleX = internalW / this.canvasWidth;   // 1026 / 700
    const scaleY = internalH / this.canvasHeight;  // 1329 / 800

    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = internalW;
    flatCanvas.height = internalH;
    const flatCtx = flatCanvas.getContext('2d')!;

    // copy the already-rendered high-res canvas directly
    flatCtx.drawImage(viewerCanvas, 0, 0);

    // scale box coords up to match internal resolution
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
    const newPage = newDoc.addPage([internalW, internalH]);
    newPage.drawImage(pngImage, { x: 0, y: 0, width: internalW, height: internalH });

    const redactedBytes = await newDoc.save();
    const blob = new Blob([redactedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'redacted.pdf';
    a.click();
  }

  submitResume()
  {
    if (this.pdfForm.get("resumePdf")!.value == null)
    {
      // TENTATIVE -- add a toast component later in shared
      return;
    }

    const newResume = {
      resumePdf: this.pdfForm.get("resumePdf")!.value!
    }

    this.profileService.postResume(newResume)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log("pdf uploaded!");
        },
        error: () =>
        {
          console.log("pdf unsuccessful");
        }
      })
  }
}
