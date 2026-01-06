import { db, doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from '../firebase';
import { Client, ContactRecord, VisitRecord } from '../types';

export class FirebaseService {
  // Salvar cliente no Firestore
  static async saveClient(userId: string, client: Client): Promise<void> {
    try {
      await setDoc(doc(db, `users/${userId}/clients`, client.id), client);
      console.log('Cliente salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  }

  // Obter cliente do Firestore
  static async getClient(userId: string, clientId: string): Promise<Client | null> {
    try {
      const docRef = doc(db, `users/${userId}/clients`, clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Client;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter cliente:', error);
      throw error;
    }
  }

  // Atualizar cliente no Firestore
  static async updateClient(userId: string, client: Client): Promise<void> {
    try {
      await updateDoc(doc(db, `users/${userId}/clients`, client.id), client as Partial<Client>);
      console.log('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  // Salvar registro de contato
  static async saveContactRecord(userId: string, record: ContactRecord): Promise<void> {
    try {
      await setDoc(doc(db, `users/${userId}/contactRecords`, record.id), record);
      console.log('Registro de contato salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro de contato:', error);
      throw error;
    }
  }

  // Salvar registro de visita
  static async saveVisitRecord(userId: string, record: VisitRecord): Promise<void> {
    try {
      await setDoc(doc(db, `users/${userId}/visitRecords`, record.id), record);
      console.log('Registro de visita salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro de visita:', error);
      throw error;
    }
  }

  // Obter todos os clientes do usuário
  static async getAllClients(userId: string): Promise<Client[]> {
    try {
      const clientsRef = collection(db, `users/${userId}/clients`);
      const querySnapshot = await getDocs(clientsRef);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        clients.push(doc.data() as Client);
      });
      
      console.log('Clientes obtidos com sucesso:', clients.length);
      return clients;
    } catch (error) {
      console.error('Erro ao obter clientes:', error);
      return [];
    }
  }
}
