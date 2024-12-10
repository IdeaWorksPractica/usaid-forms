import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';

/**
 * Sube múltiples imágenes y devuelve un arreglo con sus URLs.
 * 
 * @param {File[]} files - Un arreglo con 6 archivos de imagen.
 * @param {string} basePath - La carpeta base en el storage (opcional, por ejemplo "images/").
 * @returns {Promise<string[]>} - Una promesa que resuelve con un arreglo de URLs.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadImages(files: any[], basePath = 'images/') {
  // Aseguramos que se trate de 6 archivos
  if (files.length !== 6) {
    throw new Error('Debes proporcionar exactamente 6 imágenes.');
  }

  // Creamos un array de promesas, una por cada archivo.
  const uploadPromises = files.map(async (file) => {
    const fileRef = ref(storage, `${basePath}${file.name}`);
    
    // Subir cada archivo y luego obtener su URL
    await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
  });

  // Esperamos a que todas las subidas terminen
  const urls = await Promise.all(uploadPromises);
  return urls;
}
