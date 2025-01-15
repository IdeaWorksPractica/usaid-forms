import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IPlanActividades } from "../../shared/models/models";

export const generatePdfPlan = async (data: IPlanActividades) => {
    if (!data) {
        throw new Error("Los datos del perfil no son válidos");
    }

    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(16);
    doc.text("Plan Proyecto Social Comunitario", 105, y, { align: "center" });

    doc.setFontSize(12);
    y += 10;
    doc.text("Nombre de Proyecto: " + (data.nombre_proyecto || "No especificado"), 10, y);
    y += 10;
    doc.text("Objetivo del proyecto: " + (data.objetivo_proyecto || "No especificado"), 10, y);
    y += 10;
    doc.text("Total de horas: " + (data.total_horas || "No especificado"), 10, y);
    y += 10;
    
    doc.text("Actividades:", 10, y+5);
    const actividades = Array.isArray(data.actividades)
        ? data.actividades.map((p) => [ p.descripcion, p.horas_dedicadas, new Date(p.fecha_desarrollar).toLocaleDateString()])
        : [];
    autoTable(doc, {
        head: [[ "Descripcion", "Horas dedicadas", "Fecha"]],
        body: actividades,
        startY: y+10,
    });

    doc.save(`${data.nombre_proyecto || "plan"}.pdf`);
};
