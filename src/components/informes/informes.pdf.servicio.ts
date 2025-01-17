import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IInforme } from "../../shared/models/models";

// Función para convertir imágenes .webp a JPEG
const convertWebpToJpeg = async (webpUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "*"; // Permite cargar imágenes desde otros dominios
    img.src = webpUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg")); // Devuelve imagen en formato JPEG
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
};

// Función para generar el PDF
export const generatePdfInforme = async (data: IInforme) => {
  if (!data) {
    throw new Error("Los datos del perfil no son válidos");
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height; // Altura de la página
  let y = 20;

  // Helper para manejar saltos de página
  const checkPageHeight = (currentY: number, increment: number) => {
    if (currentY + increment > pageHeight) {
      doc.addPage();
      return 20; // Reinicia la posición y en la nueva página
    }
    return currentY;
  };

  // Helper para agregar texto con ajuste automático
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      doc.text(line, x, y);
      y += lineHeight;
    });
    return y;
  };

  // Título
  doc.setFontSize(16);
  doc.text("Perfil Proyecto Social Comunitario", 105, y, { align: "center" });

  // Detalles
  doc.setFontSize(12);
  y += 10;
  y = addWrappedText("Nombre de Proyecto: " + (data.nombre_proyecto || "No especificado"), 10, y, 180, 7);
  y = addWrappedText("Tipo de Proyecto: " + (Array.isArray(data.tipo_proyecto) ? data.tipo_proyecto.join(", ") : "No especificado"), 10, y, 180, 7);
  y = addWrappedText("Líder/Coordinador: " + data.lider_coordinador, 10, y, 180, 7);
  y = addWrappedText("Cantidad de beneficiarios: " + data.descripcion_beneficiarios.cant_beneficiarios, 10, y, 180, 7);
  y = addWrappedText("Descripcion de beneficiarios: " + data.descripcion_beneficiarios.descripcion_beneficiarios, 10, y, 180, 7);
  y = addWrappedText("Descripción de mejora: " + data.descripcion_mejora, 10, y, 180, 7);
  y = addWrappedText("Riesgos Medioambientales: " + data.riesgo_medioambiental.join(", "), 10, y, 180, 7);
  y = addWrappedText("Medidas de Reducción Medioambientales: " + data.medidas_reduccion_medioambiental.join(", "), 10, y, 180, 7);

  // Tabla de participantes
  const participantes = Array.isArray(data.participantes)
    ? data.participantes.map((p) => [p.nombre_completo, p.no_dni, p.no_telefono])
    : [];
  autoTable(doc, {
    head: [["Nombre Completo", "DNI", "Teléfono"]],
    body: participantes,
    startY: y + 10,
  });

  // Actualizar posición después de la tabla
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).autoTable.previous.finalY + 10;

  // Imágenes
  const categorias = [
    { key: "antes", title: "Fotos Antes:" },
    { key: "durantes", title: "Fotos Durante:" },
    { key: "despues", title: "Fotos Después:" },
  ];

  for (const categoria of categorias) {
    y = checkPageHeight(y, 20); // Verificar espacio en la página
    doc.text(categoria.title, 10, y);
    y += 10;
    let x = 10;

    for (const [index, url] of data.fotografias[categoria.key as keyof IInforme["fotografias"]].entries()) {
      const jpegBase64 = await convertWebpToJpeg(url);
      if (jpegBase64) {
        y = checkPageHeight(y, 55); // Verificar espacio antes de agregar imagen
        doc.addImage(jpegBase64, "JPEG", x, y, 70, 50); // Añadir imagen
        x += 80; // Espaciado horizontal entre imágenes
        if ((index + 1) % 2 === 0) {
          x = 10; // Reiniciar x para la siguiente fila
          y += 35; // Espaciado vertical
        }
      } else {
        console.error(`No se pudo convertir la imagen: ${url}`);
      }
    }
    y += 35; // Espaciado después de cada categoría
  }

  doc.save(`Informe - ${data.nombre_proyecto || "perfil"}.pdf`);
};
