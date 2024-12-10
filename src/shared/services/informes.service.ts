import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { IInforme } from "../models/models";
import { uploadImages } from "./fotografias.service"; // Asume que este servicio ya incluye la lógica de compresión
import { db } from "../../../firebase";

const collectionName = "informes"; // Nombre de la colección en Firestore

/**
 * Crea un nuevo informe en Firestore y sube imágenes relacionadas.
 *
 * @param informe - Datos básicos del informe (sin fotografías).
 * @param files - Archivos de imágenes (6 imágenes).
 * @returns Promise<string> - El ID del documento creado.
 */
export async function createInforme(
  informe: Omit<IInforme, "id" | "fotografias">,
  files: File[]
): Promise<string> {
  try {
    if (files.length !== 6) {
      throw new Error("Debes proporcionar exactamente 6 imágenes.");
    }

    // Subir imágenes y obtener sus URLs
    const imageUrls = await uploadImages(files, "informes/");

    if (imageUrls.length !== 6) {
      throw new Error("La subida de imágenes falló. No se obtuvieron 6 URLs.");
    }

    // Organizar las URLs en el formato requerido
    const fotografias = {
      antes: [imageUrls[0], imageUrls[1]],
      durantes: [imageUrls[2], imageUrls[3]],
      despues: [imageUrls[4], imageUrls[5]],
    };

    // Crear el informe con las fotografías
    const informeCompleto: Omit<IInforme, "id"> = {
      ...informe,
      fotografias,
    };

    // Guardar el informe en Firestore
    const docRef = await addDoc(
      collection(db, collectionName),
      informeCompleto
    );
    console.log("Informe creado con éxito:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("Error creando el informe:", error);
    throw error;
  }
}

/**
 * Obtiene todos los documentos de la colección "informes".
 * @returns Promise<IInforme[]> - Una lista de informes.
 */
export async function getAllInformes(): Promise<IInforme[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const informes: IInforme[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<IInforme, "id">;
        informes.push({ id: doc.id, ...data }); 
      });
      return informes;
    } catch (error) {
      console.error("Error obteniendo los informes:", error);
      throw error;
    }
  }
  

/**
 * Obtiene un documento de la colección "informes" por su ID.
 * @param id - ID del documento a buscar.
 * @returns Promise<IInforme | null> - El informe encontrado o `null` si no existe.
 */
export async function getInformeById(id: string): Promise<IInforme | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IInforme;
    } else {
      console.warn("No se encontró el informe con ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo el informe por ID:", error);
    throw error;
  }
}

/**
 * Actualiza un documento en la colección "informes".
 * @param id - ID del documento a actualizar.
 * @param updatedData - Datos a actualizar (parciales).
 * @returns Promise<void>
 */
export async function updateInforme(
  id: string,
  updatedData: Partial<Omit<IInforme, "id">>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
    console.log("Informe actualizado con éxito");
  } catch (error) {
    console.error("Error actualizando el informe:", error);
    throw error;
  }
}

/**
 * Elimina un documento de la colección "informes".
 * @param id - ID del documento a eliminar.
 * @returns Promise<void>
 */
export async function deleteInforme(id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log("Informe eliminado con éxito");
  } catch (error) {
    console.error("Error eliminando el informe:", error);
    throw error;
  }
}
