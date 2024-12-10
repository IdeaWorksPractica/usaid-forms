import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import imageCompression from "browser-image-compression";

/**
 * Convierte imágenes a formato WebP y las sube al almacenamiento de Firebase.
 *
 * @param {File[]} files - Un arreglo con 6 archivos de imagen.
 * @param {string} basePath - La carpeta base en el storage (opcional, por ejemplo "images/").
 * @returns {Promise<string[]>} - Una promesa que resuelve con un arreglo de URLs.
 */
export async function uploadImages(files: File[], basePath = "images/") {
  // Aseguramos que se trate de 6 archivos
  if (files.length !== 6) {
    throw new Error("Debes proporcionar exactamente 6 imágenes.");
  }

  // Configuración para la compresión (WebP)
  const compressionOptions = {
    maxSizeMB: 1, // Tamaño máximo en MB para cada imagen
    maxWidthOrHeight: 1920, // Redimensiona si las imágenes son demasiado grandes
    useWebWorker: true, // Mejora el rendimiento con workers
    fileType: "image/webp", // Convierte las imágenes a formato WebP
  };

  // Creamos un array de promesas, una por cada archivo
  const uploadPromises = files.map(async (file) => {
    try {
      console.log(`Procesando archivo: ${file.name}`);
      // Comprimir y convertir a WebP
      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Archivo comprimido: ${compressedFile.name}, tamaño: ${compressedFile.size / 1024} KB`);

      // Subir al storage de Firebase
      const fileRef = ref(storage, `${basePath}${compressedFile.name}`);
      await uploadBytes(fileRef, compressedFile);
      const downloadURL = await getDownloadURL(fileRef);
      console.log(`URL de descarga: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error("Error al procesar o subir la imagen:", error);
      throw error;
    }
  });

  // Esperamos a que todas las promesas se resuelvan
  const urls = await Promise.all(uploadPromises);
  return urls;
}
