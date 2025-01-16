import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IInforme } from "../../shared/models/models";

const convertWebpToJpeg = async (webpUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Permite cargar imágenes desde otros dominios
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

export const generatePdfInforme = async (data: IInforme) => {
  if (!data) {
    throw new Error("Los datos del perfil no son válidos");
  }

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.text("Perfil Proyecto Social Comunitario", 105, y, { align: "center" });

  // Details
  doc.setFontSize(12);
  y += 10;
  doc.text("Nombre de Proyecto: " + (data.nombre_proyecto || "No especificado"), 10, y);
  y += 10;
  doc.text("Tipo de Proyecto: " + (Array.isArray(data.tipo_proyecto) ? data.tipo_proyecto.join(", ") : "No especificado"), 10, y);
  y += 10;
  doc.text("Líder/Coordinador: " + data.lider_coordinador, 10, y);
  y += 10;
  doc.text("Cantidad de beneficiarios: " + data.descripcion_beneficiarios.cant_beneficiarios, 10, y);
  y += 10;
  doc.text("Descripcion de beneficiarios: " + data.descripcion_beneficiarios.descripcion_beneficiarios, 10, y);
  y += 10;
  doc.text("Descripción de mejora: " + data.descripcion_mejora, 10, y);
  y += 10;
  doc.text("Riesgos Medioambientales: " + data.riesgo_medioambiental.join(", "), 10, y);
  y += 10;
  doc.text("Medidas de Reducción Medioambientales: " + data.medidas_reduccion_medioambiental.join(", "), 10, y);
  y += 10;
  doc.text("Fotografías", 10, y);

  // Participants Table
  const participantes = Array.isArray(data.participantes)
    ? data.participantes.map((p) => [p.nombre_completo, p.no_dni, p.no_telefono])
    : [];
  autoTable(doc, {
    head: [["Nombre Completo", "DNI", "Teléfono"]],
    body: participantes,
    startY: y + 10,
  });

  // Update y position after table
  y += 10 + participantes.length * 10;

  // Images
  doc.setFontSize(12);
  const categorias = [
    { key: "antes", title: "Fotos Antes:" },
    { key: "durantes", title: "Fotos Durante:" },
    { key: "despues", title: "Fotos Después:" },
  ];

  for (const categoria of categorias) {
    doc.text(categoria.title, 10, y);
    y += 10;
    let x = 10;

    for (const [index, url] of data.fotografias[categoria.key as keyof IInforme["fotografias"]].entries()) {
      const jpegBase64 = await convertWebpToJpeg(url);
      if (jpegBase64) {
        doc.addImage(jpegBase64, "JPEG", x, y, 70, 50); // Añadir imagen convertida al PDF
        x += 80; // Espaciado entre imágenes
        if ((index + 1) % 2 === 0) {
          x = 10; // Reiniciar x para la siguiente fila
          y += 55; // Moverse a la siguiente fila
        }
      } else {
        console.error(`No se pudo convertir la imagen: ${url}`);
      }
    }
    y += 60; // Espaciado después de cada categoría
  }

  doc.save(`Informe - ${data.nombre_proyecto || "perfil"}.pdf`);
};
