export interface IActividad {
  descripcion: string;
  horas_dedicadas: number;
  fecha_desarrollar: string;
  recursos_necesarios: string[];
  responsables_actividad: string[];
}
export interface IPlanActividades {
  nombre_proyecto: string;
  objetivo_proyecto: string;
  actividades: IActividad[];
  total_horas: number;
}

export interface IParticipante {
  nombre_completo: string;
  no_dni: string;
  no_telefono: string;
}

export interface IPerfil {
  id:string
  nombre_proyecto: string;
  tipo_proyecto: string[];
  lugar_implementacion: string;
  cant_beneficiarios: number;
  fechas_implementacion: string[];
  costo_total_psc: ICostoPSC;
  descripcion_problema: string;
  descripcion_acciones: string;
  participantes: IParticipante[];
  lider_coordinador: string;
}

export interface ICostoPSC {
  valor_financiado: number;
  otros_aportes: number;
  costo_total: number;
}

export interface IInforme {
  id:string
  participantes: IParticipante[];
  lider_coordinador: string;
  tipo_proyecto: string[];
  descripcion_beneficiarios: {
    cant_beneficiarios: number;
    descripcion_beneficiarios: string;
  };
  descripcion_mejora: string;
  fotografias : IFotografias
  riesgo_medioambiental : string[]
  medidas_reduccion_medioambiental : string[]
}

export interface IFotografias {
    antes : string[];
    durantes : string[];
    despues : string[];
}