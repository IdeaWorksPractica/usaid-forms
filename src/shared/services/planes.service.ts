import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { IPlanActividades } from '../models/models';

const collectionName = 'planes'; // Nombre de la colección en Firestore

/**
 * Crea un nuevo documento en la colección "planes".
 * @param plan - Objeto que cumple con la interfaz IPlanActividades.
 * @returns Promise<string> - El ID del documento creado.
 */
export async function createPlanActividad(plan: IPlanActividades): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), plan);
    return docRef.id;
  } catch (error) {
    console.error('Error creando el plan de actividades:', error);
    throw error;
  }
}

export async function getAllPlanActividades(): Promise<IPlanActividades[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as IPlanActividades[];
  } catch (error) {
    console.error('Error obteniendo los planes de actividades:', error);
    throw error;
  }
}
 

export async function getPlanActividadById(id: string): Promise<IPlanActividades | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as IPlanActividades;
    } else {
      console.warn('No se encontró el plan de actividades con ID:', id);
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo el plan de actividades por ID:', error);
    throw error;
  }
}


export async function updatePlanActividad(id: string, updatedData: Partial<IPlanActividades>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
    console.log('Plan de actividades actualizado con éxito');
  } catch (error) {
    console.error('Error actualizando el plan de actividades:', error);
    throw error;
  }
}


export async function deletePlanActividad(id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log('Plan de actividades eliminado con éxito');
  } catch (error) {
    console.error('Error eliminando el plan de actividades:', error);
    throw error;
  }
}
