import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IPerfil } from "../../shared/models/models";

export const generatePdfPerfil = async (data: IPerfil) => {
    if (!data) {
        throw new Error("Los datos del perfil no son válidos");
    }

    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(16);
    doc.text("Perfil Proyecto Social Comunitario", 105, y, { align: "center" });

    doc.setFontSize(12);
    y += 10;
    doc.text("Nombre de Proyecto: " + (data.nombre_proyecto || "No especificado"), 10, y);
    y += 10;
    doc.text("Tipo de Proyecto: " + (Array.isArray(data.tipo_proyecto) ? data.tipo_proyecto.join(", ") : "No especificado"), 10, y);
    y += 10;
    doc.text("Lugar de Implementación: " + (data.lugar_implementacion || "No especificado"), 10, y);
    y += 10;
    doc.text("Cantidad de Beneficiarios: " + (data.cant_beneficiarios || "No especificado"), 10, y);
    y += 10;
    doc.text("Fechas de Implementación: " + (Array.isArray(data.fechas_implementacion) ? data.fechas_implementacion.join(", ") : "No especificado"), 10, y);
    y += 10;
    doc.text("Costo Total PSC: " + (data.costo_total_psc?.costo_total || "No especificado"), 10, y);

    y += 10;
    const descripcionProblema = doc.splitTextToSize(data.descripcion_problema || "No especificado", 180);
    doc.text("Descripción del Problema:", 10, y);
    y += 5;
    doc.text(descripcionProblema, 10, y);

    y += descripcionProblema.length * 5 + 10;
    const descripcionAcciones = doc.splitTextToSize(data.descripcion_acciones || "No especificado", 180);
    doc.text("Descripción de Acciones:", 10, y);
    y += 5;
    doc.text(descripcionAcciones, 10, y);

    y += descripcionAcciones.length * 5;
    
    doc.text("Participantes:", 10, y+5);
    const participantes = Array.isArray(data.participantes)
        ? data.participantes.map((p) => [ p.nombre_completo, p.no_dni, p.no_telefono])
        : [];
    autoTable(doc, {
        head: [[ "Nombre Completo", "DNI", "Teléfono"]],
        body: participantes,
        startY: y+10,
    });

    doc.save(`${data.nombre_proyecto || "perfil"}.pdf`);
};
