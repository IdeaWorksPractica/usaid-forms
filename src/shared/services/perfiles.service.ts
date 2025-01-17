import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { IPerfil } from "../models/models";

const collectionName = "perfiles"; // Nombre de la colección en Firestore

/**
 * Crea un nuevo documento en la colección "perfiles".
 * @param perfil - Objeto que cumple con la interfaz IPerfil (sin el ID, ya que Firebase lo genera automáticamente).
 * @returns Promise<string> - El ID del documento creado.
 */
export async function createPerfil(
  perfil: Omit<IPerfil, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), perfil);
    return docRef.id;
  } catch (error) {
    console.error("Error creando el perfil:", error);
    throw error;
  }
}

/**
 * Obtiene todos los documentos de la colección "perfiles".
 * @returns Promise<IPerfil[]> - Una lista de perfiles.
 */
export async function getAllPerfiles(): Promise<IPerfil[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const perfiles: IPerfil[] = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Asigna el ID generado por Firestore
      ...(doc.data() as Omit<IPerfil, "id">), // Asegúrate de no duplicar el campo id
    }));
    return perfiles;
  } catch (error) {
    console.error("Error obteniendo los perfiles:", error);
    throw error;
  }
}

/**
 * Obtiene un documento de la colección "perfiles" por su ID.
 * @param id - ID del documento a buscar.
 * @returns Promise<IPerfil | null> - El perfil encontrado o `null` si no existe.
 */
export async function getPerfilById(id: string): Promise<IPerfil | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id, // Asigna el ID generado por Firestore
        ...(docSnap.data() as Omit<IPerfil, "id">), // Evita duplicar el campo id
      };
    } else {
      console.warn("No se encontró el perfil con ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo el perfil por ID:", error);
    throw error;
  }
}

/**
 * Actualiza un documento en la colección "perfiles".
 * @param id - ID del documento a actualizar.
 * @param updatedData - Datos a actualizar (parciales).
 * @returns Promise<void>
 */
export async function updatePerfil(updatedData: Partial<IPerfil> & { id: string }): Promise<void> {
  try {
    const { id, ...fieldsToUpdate } = updatedData; // Extrae el ID y los campos a actualizar
    const docRef = doc(db, collectionName, id); // Obtiene la referencia al documento
    await updateDoc(docRef, fieldsToUpdate); // Actualiza los campos
    console.log("Perfil actualizado con éxito");
  } catch (error) {
    console.error("Error actualizando el perfil:", error);
    throw error;
  }
}

/**
 * Elimina un documento de la colección "perfiles".
 * @param id - ID del documento a eliminar.
 * @returns Promise<void>
 */
export async function deletePerfil(id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log("Perfil eliminado con éxito");
  } catch (error) {
    console.error("Error eliminando el perfil:", error);
    throw error;
  }
}
