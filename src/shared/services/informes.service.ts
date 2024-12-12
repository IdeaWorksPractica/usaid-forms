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
import { uploadImagesByCategory } from "./fotografias.service";
import { db } from "../../../firebase";

const collectionName = "informes"; // Nombre de la colección en Firestore

/**
 * Crea un informe con manejo opcional de imágenes.
 *
 * @param informe - Datos básicos del informe.
 * @param filesByCategory - Map de archivos por categoría (opcional).
 * @returns Promise<string> - ID del informe creado.
 */
export async function createInforme(
  informe: Omit<IInforme, "id" | "fotografias">,
  filesByCategory?: { antes?: File[]; durante?: File[]; despues?: File[] }
): Promise<string> {
  try {
    const fotografias = await uploadImagesByCategory(filesByCategory || {});

    const informeCompleto: Omit<IInforme, "id"> = {
      ...informe,
      fotografias: {
        antes: fotografias.antes || [],
        durantes: fotografias.durante || [],
        despues: fotografias.despues || [],
      },
    };

    const docRef = await addDoc(collection(db, collectionName), informeCompleto);
    console.log("Informe creado con éxito:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creando el informe:", error);
    throw error;
  }
}

/**
 * Actualiza un informe con manejo opcional de imágenes.
 *
 * @param id - ID del informe.
 * @param updatedData - Datos actualizados.
 * @param filesByCategory - Map de archivos por categoría (opcional).
 * @returns Promise<void>
 */
export async function updateInforme(
  id: string,
  updatedData: Partial<Omit<IInforme, "id">>,
  filesByCategory?: { antes?: File[]; durante?: File[]; despues?: File[] }
): Promise<void> {
  try {
    const fotografias = filesByCategory
      ? await uploadImagesByCategory(filesByCategory)
      : {};

    const existingData = await getInformeById(id);

    if (!existingData) {
      throw new Error("No se encontró el informe para actualizar.");
    }

    const updatedFotografias = {
      antes: fotografias.antes || existingData.fotografias.antes,
      durantes: fotografias.durante || existingData.fotografias.durantes,
      despues: fotografias.despues || existingData.fotografias.despues,
    };

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { ...updatedData, fotografias: updatedFotografias });
    console.log("Informe actualizado con éxito");
  } catch (error) {
    console.error("Error actualizando el informe:", error);
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
