import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";// Asegúrate de importar correctamente tu instancia de Firestore
import { IPresupuestos } from "../models/models"; // Ajusta la ruta según la ubicación de tus interfaces

const PRESUPUESTOS_COLLECTION = "presupuestos";

/**
 * Agrega un nuevo presupuesto a la colección.
 * @param presupuesto - Objeto con la estructura de IPresupuestos.
 * @returns - ID del presupuesto creado.
 */
export const addPresupuesto = async (presupuesto: IPresupuestos): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PRESUPUESTOS_COLLECTION), presupuesto);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar el presupuesto:", error);
    throw error;
  }
};

/**
 * Obtiene todos los presupuestos de la colección.
 * @returns - Array de presupuestos.
 */
export const getPresupuestos = async (): Promise<IPresupuestos[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRESUPUESTOS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as unknown as IPresupuestos[];
  } catch (error) {
    console.error("Error al obtener los presupuestos:", error);
    throw error;
  }
};

/**
 * Obtiene un presupuesto por su ID.
 * @param id - ID del presupuesto.
 * @returns - Presupuesto con el ID especificado.
 */
export const getPresupuestoById = async (id: string): Promise<IPresupuestos | null> => {
  try {
    const docRef = doc(db, PRESUPUESTOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as IPresupuestos;
    } else {
      console.error("No se encontró el presupuesto con el ID especificado.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el presupuesto por ID:", error);
    throw error;
  }
};

/**
 * Actualiza un presupuesto existente en la colección.
 * @param id - ID del presupuesto a actualizar.
 * @param data - Datos del presupuesto a actualizar.
 * @returns - void.
 */
export const updatePresupuesto = async (id: string, data: Partial<IPresupuestos>): Promise<void> => {
  try {
    const docRef = doc(db, PRESUPUESTOS_COLLECTION, id);
    await updateDoc(docRef, data);
    console.log("Presupuesto actualizado exitosamente.");
  } catch (error) {
    console.error("Error al actualizar el presupuesto:", error);
    throw error;
  }
};

/**
 * Elimina un presupuesto por su ID.
 * @param id - ID del presupuesto a eliminar.
 * @returns - void.
 */
export const deletePresupuesto = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PRESUPUESTOS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar el presupuesto:", error);
    throw error;
  }
};
