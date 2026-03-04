export interface usuario{
 usuario: string;
 password: string;
 tipoUsuario: string;
 telefono: number;
}


export interface Cita {
  _id: string;
    tratamiento: string; // Campo requerido
    fecha: Date; // Campo requerido
    observaciones: string; // Campo opcional
    pago: number; // Campo opcional
    realizo: string; // Campo opcional
   id: string;
    horaFin: string;
    horaInicio: string;
    fechaCita:Date;
    descripcion?: string;
  }

export interface ListaNegra{

}
