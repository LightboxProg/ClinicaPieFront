import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
      // Array de servicios (solo se usa cuando tipoAnclaje = 'servicio')
      servicios: this.fb.array([]),
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

  // Getter para acceder al FormArray de servicios
  get serviciosFormArray(): FormArray {
    return this.promocionForm.get('servicios') as FormArray;
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
        const p = res.data;
        // Convertir fechas a formato YYYY-MM-DD
        const fechaInicio = new Date(p.fechaInicio).toISOString().split('T')[0];
        const fechaFin = new Date(p.fechaFin).toISOString().split('T')[0];
        const palabrasClaveString = p.palabrasClave ? p.palabrasClave.join(', ') : '';

        // Limpiar el FormArray de servicios antes de cargar
        this.serviciosFormArray.clear();

        // Si hay servicios, agregar cada uno al FormArray
        if (p.servicios && Array.isArray(p.servicios)) {
          p.servicios.forEach((item: any) => {
            const servicioId = item.servicio?._id || item.servicio;
            this.agregarServicio(servicioId, item.sesionesIncluidas);
          });
        }

        this.promocionForm.patchValue({
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipoAnclaje: p.tipoAnclaje,
          categoria: p.categoria?._id || p.categoria,
          sucursales: p.sucursales?.map((s: any) => s._id || s) || [],
          fechaInicio,
          fechaFin,
          imagenUrl: p.imagenUrl,
          tipoDescuento: p.tipoDescuento === 'monto_fijo' ? 'fijo' : p.tipoDescuento,
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

  // Crear un nuevo FormGroup para un servicio
  private crearServicioGroup(servicioId: string = '', sesiones: number = 1): FormGroup {
    return this.fb.group({
      servicio: [servicioId, Validators.required],
      sesionesIncluidas: [sesiones, [Validators.required, Validators.min(1)]]
    });
  }

  // Agregar una fila de servicio al FormArray
  agregarServicio(servicioId: string = '', sesiones: number = 1): void {
    this.serviciosFormArray.push(this.crearServicioGroup(servicioId, sesiones));
  }

  // Eliminar una fila de servicio
  eliminarServicio(index: number): void {
    this.serviciosFormArray.removeAt(index);
  }

  onTipoAnclajeChange(): void {
    const tipo = this.promocionForm.get('tipoAnclaje')?.value;
    // Limpiar campos que no correspondan
    if (tipo !== 'categoria') {
      this.promocionForm.get('categoria')?.setValue('');
    }
    if (tipo !== 'servicio') {
      // Si se cambia a otro tipo, limpiar el array de servicios
      this.serviciosFormArray.clear();
    } else {
      // Si se cambia a servicio y no hay ningún servicio agregado, agregar uno por defecto
      if (this.serviciosFormArray.length === 0) {
        this.agregarServicio();
      }
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

      // Procesar palabras clave
      let palabrasClave: string[] | undefined;
      if (formValue.palabrasClaveInput && formValue.palabrasClaveInput.trim() !== '') {
        palabrasClave = formValue.palabrasClaveInput
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item !== '');
      }

      // Construir el objeto para el backend
      const promocion: any = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        tipoAnclaje: formValue.tipoAnclaje,
        // Si es servicio, tomar el array de servicios tal cual (ya es array de objetos)
        servicios: formValue.tipoAnclaje === 'servicio' ? formValue.servicios : undefined,
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

      // Si hay imagen seleccionada, no enviar imagenUrl (se subirá después)
      if (this.imagenSeleccionada) {
        delete promocion.imagenUrl;
      } else {
        promocion.imagenUrl = formValue.imagenUrl || undefined;
      }

      // Limpiar propiedades undefined
      Object.keys(promocion).forEach(key => promocion[key] === undefined && delete promocion[key]);

      let promocionId: string;

      if (this.editando) {
        await lastValueFrom(this.promocionService.actualizarPromocion(this.promocionId!, promocion));
        promocionId = this.promocionId!;
        this.swal.success('Promoción actualizada');
      } else {
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