import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PromocionService } from 'src/app/services/promocion.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { SwalService } from 'src/app/services/swal.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-formulario-promocion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formulario-promocion.component.html',
  styleUrls: ['./formulario-promocion.component.scss']
})
export class FormularioPromocionComponent implements OnInit {
  promocionForm: FormGroup;
  editando = false;
  promocionId: string | null = null;
  categorias: any[] = [];
  servicios: any[] = [];
  sucursales: any[] = [];
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  subiendoImagen: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private promocionService: PromocionService,
    private categoriasService: CategoriasService,
    private serviciosService: ServiciosService,
    private sucursalesService: SucursalesService,
    private swal: SwalService
  ) {
    this.promocionForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipoAnclaje: ['global', Validators.required],
      servicio: [''],
      categoria: [''],
      sucursales: [[]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      imagenUrl: [''],
      tipoDescuento: ['porcentaje', Validators.required],
      valorDescuento: [0, [Validators.required, Validators.min(0)]],
      codigoPromocional: [''],
      usoMaximo: [null],
      montoMinimoCompra: [null],
      palabrasClaveInput: [''],
      activa: [true]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.promocionId = this.route.snapshot.paramMap.get('id');
    if (this.promocionId) {
      this.editando = true;
      this.cargarPromocion(this.promocionId);
    }
  }

  cargarCatalogos(): void {
    this.categoriasService.obtenerCategorias().subscribe(res => {
      this.categorias = res.data || res;
    });
    this.serviciosService.obtenerServicios().subscribe(res => {
      this.servicios = res.data || res;
    });
    this.sucursalesService.obtenerSucursales().subscribe(res => {
      this.sucursales = res.data || res;
    });
  }

  cargarPromocion(id: string): void {
    this.promocionService.obtenerPromocionPorId(id).subscribe({
      next: (res) => {
        const p = res.data; // p is now of type Promocion with backend fields
        // Convertir fechas a formato YYYY-MM-DD
        const fechaInicio = new Date(p.fechaInicio).toISOString().split('T')[0];
        const fechaFin = new Date(p.fechaFin).toISOString().split('T')[0];
        // Convertir array de palabras clave a string separado por comas
        const palabrasClaveString = p.palabrasClave ? p.palabrasClave.join(', ') : '';

        // Mapear campos del backend al formulario
        this.promocionForm.patchValue({
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipoAnclaje: p.tipoAnclaje,
          servicio: p.servicios && p.servicios.length > 0
            ? (p.servicios[0]._id || p.servicios[0])
            : '',
          categoria: p.categoria?._id || p.categoria,
          sucursales: p.sucursales?.map((s: any) => s._id || s) || [],
          fechaInicio,
          fechaFin,
          imagenUrl: p.imagenUrl,
          tipoDescuento: p.tipoDescuento === 'monto_fijo' ? 'fijo' : p.tipoDescuento, // map backend to form
          valorDescuento: p.valorDescuento,
          codigoPromocional: p.codigo,
          usoMaximo: p.usosMaximos,
          montoMinimoCompra: p.montoMinimo,
          activa: p.activo,
          palabrasClaveInput: palabrasClaveString,
        });
      },
      error: () => this.swal.error('Error al cargar la promoción')
    });
  }

  onTipoAnclajeChange(): void {
    const tipo = this.promocionForm.get('tipoAnclaje')?.value;
    if (tipo !== 'categoria') {
      this.promocionForm.get('categoria')?.setValue('');
    }
    if (tipo !== 'servicio') {
      this.promocionForm.get('servicio')?.setValue('');
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.promocionForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  eliminarImagen(): void {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
    this.promocionForm.patchValue({ imagenUrl: '' });
    this.fileInput.nativeElement.value = '';
  }

  async guardar(): Promise<void> {
    if (this.promocionForm.invalid) {
      this.promocionForm.markAllAsTouched();
      this.swal.warning('Complete los campos obligatorios');
      return;
    }

    this.subiendoImagen = true;

    try {
      const formValue = this.promocionForm.value;

      let palabrasClave: string[] | undefined;
      if (formValue.palabrasClaveInput && formValue.palabrasClaveInput.trim() !== '') {
        palabrasClave = formValue.palabrasClaveInput
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item !== '');
      }

      // Construir objeto para enviar al backend usando los nombres de campo del backend
      const promocion: any = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        tipoAnclaje: formValue.tipoAnclaje,
        servicios: formValue.servicio ? [formValue.servicio] : undefined,
        categoria: formValue.categoria || undefined,
        sucursales: formValue.sucursales?.length ? formValue.sucursales : undefined,
        fechaInicio: new Date(formValue.fechaInicio),
        fechaFin: new Date(formValue.fechaFin),
        tipoDescuento: formValue.tipoDescuento === 'fijo' ? 'monto_fijo' : formValue.tipoDescuento,
        valorDescuento: formValue.valorDescuento,
        codigo: formValue.codigoPromocional || undefined,
        usosMaximos: formValue.usoMaximo || undefined,
        montoMinimo: formValue.montoMinimoCompra || undefined,
        activo: formValue.activa,
        palabrasClave: palabrasClave,
      };

      // Si se ha seleccionado una imagen nueva, no enviar imagenUrl (se subirá después)
      if (this.imagenSeleccionada) {
        delete promocion.imagenUrl;
      } else {
        promocion.imagenUrl = formValue.imagenUrl || undefined;
      }

      // Eliminar campos según tipo de anclaje
      if (promocion.tipoAnclaje !== 'categoria') delete promocion.categoria;
      if (promocion.tipoAnclaje !== 'servicio') delete promocion.servicio;

      // Eliminar propiedades undefined
      Object.keys(promocion).forEach(key => promocion[key] === undefined && delete promocion[key]);

      let promocionId: string;

      if (this.editando) {
        // Actualizar promoción existente
        await lastValueFrom(this.promocionService.actualizarPromocion(this.promocionId!, promocion));
        promocionId = this.promocionId!;
        this.swal.success('Promoción actualizada');
      } else {
        // Crear nueva promoción
        const createRes = await lastValueFrom(this.promocionService.crearPromocion(promocion));
        if (!createRes?.data?._id) {
          throw new Error('No se pudo obtener el ID de la promoción');
        }
        promocionId = createRes.data._id;
        this.swal.success('Promoción creada');
      }

      // Si hay imagen seleccionada, subirla
      if (this.imagenSeleccionada) {
        await this.subirImagen(promocionId);
        this.swal.success('Imagen subida correctamente');
      }

      this.router.navigate(['/promociones']);
    } catch (error) {
      console.error(error);
      this.swal.error('Error al guardar la promoción');
    } finally {
      this.subiendoImagen = false;
    }
  }

  subirImagen(promocionId: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', this.imagenSeleccionada!);
    return lastValueFrom(this.promocionService.subirImagen(promocionId, formData));
  }

  cancelar(): void {
    this.router.navigate(['/promociones']);
  }
}