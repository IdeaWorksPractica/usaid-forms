import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IPresupuestos } from "../../shared/models/models";

export const generatePdfPrespuesto = async (data: IPresupuestos) => {
    if (!data) {
        throw new Error("Los datos del perfil no son válidos");
    }

    const doc = new jsPDF();

    let y = 20;
    doc.setFontSize(16);
    doc.text("Presupuesto Proyecto Social Comunitario", 105, y, { align: "center" });

    doc.setFontSize(12);
    y += 10;
    doc.text("Nombre de Proyecto: " + (data.nombre_proyecto ), 10, y);
    y += 10;
    doc.text("Subtotal Creando Mi Futuro: " + (data.sub_total_creando_mi_futuro), 10, y);
    y += 10;
    doc.text("Subtotal Contribuciones: " + (data.sub_total_contribuciones), 10, y);
    y += 10;
    doc.text("Total: " + (data.total ), 10, y);
    y += 10;
    
    doc.text("Recursos:", 10, y+5);
    const recursos = Array.isArray(data.recursos)
        ? data.recursos.map((p) => [ p.descripcion_recurso, p.cantidad, p.cubierto_creando_mi_futuo, p.constribucion_otros])
        : [];
    autoTable(doc, {
        head: [[ "Descripcion", "Cantidad", "Cubierto Creando Mi Futuro", "Contribución Otros"]],
        body: recursos,
        startY: y+10,
    });

    doc.save(`Presupuesto - ${data.nombre_proyecto || "presupuesto"}.pdf`);
};
