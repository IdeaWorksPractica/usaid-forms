import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase";
import imageCompression from "browser-image-compression";

/**
 * Sube imágenes específicas por categoría al almacenamiento de Firebase.
 *
 * @param filesByCategory - Archivos de imágenes agrupados por categoría.
 * @param basePath - Ruta base en el almacenamiento de Firebase (opcional).
 * @returns Promise<Partial<{ antes: string[]; durante: string[]; despues: string[] }>> - URLs organizadas por categoría.
 */
export async function uploadImagesByCategory(
  filesByCategory: {
    antes?: File[];
    durante?: File[];
    despues?: File[];
  },
  basePath = "informes/"
): Promise<Partial<{ antes: string[]; durante: string[]; despues: string[] }>> {
  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  };

  const uploadCategory = async (files: File[], category: string): Promise<string[]> => {
    if (files.length > 2) {
      throw new Error(`Solo se permiten hasta 2 imágenes para la categoría "${category}".`);
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        const fileRef = ref(storage, `${basePath}${category}/${compressedFile.name}`);
        await uploadBytes(fileRef, compressedFile);
        return await getDownloadURL(fileRef);
      } catch (error) {
        console.error(`Error subiendo imagen para la categoría "${category}":`, error);
        throw error;
      }
    });

    return await Promise.all(uploadPromises);
  };

  const result: Partial<{ antes: string[]; durante: string[]; despues: string[] }> = {};

  if (filesByCategory.antes) {
    result.antes = await uploadCategory(filesByCategory.antes, "antes");
  }

  if (filesByCategory.durante) {
    result.durante = await uploadCategory(filesByCategory.durante, "durante");
  }

  if (filesByCategory.despues) {
    result.despues = await uploadCategory(filesByCategory.despues, "despues");
  }

  return result;
}
