import { useState, useEffect } from 'react';
import { Client, OS, Part, Supplier, Employee, InventoryOrder } from '../types';

const STORAGE_KEY = 'sgo_mecanica_db';

interface DB {
  clients: Client[];
  orders: OS[];
  parts: Part[];
  suppliers: Supplier[];
  employees: Employee[];
  inventoryOrders: InventoryOrder[];
}

const INITIAL_DATA: DB = {
  clients: [
    {
      id: '1',
      name: 'João Silva',
      type: 'PF',
      document: '123.456.789-00',
      phone: '(11) 98888-7777',
      email: 'joao@email.com',
      createdAt: new Date().toISOString(),
      vehicles: [
        { id: 'v1', plate: 'ABC-1234', model: 'Civic', brand: 'Honda', year: '2020', currentKm: 45000 }
      ]
    }
  ],
  orders: [],
  parts: [
    { id: 'p1', name: 'Pastilha de Freio', sku: 'PF-001', costPrice: 80, salePrice: 150, stock: 10, minStock: 5, supplierId: 's1' }
  ],
  suppliers: [
    { id: 's1', name: 'Auto Peças Central', contact: 'Ricardo', phone: '(11) 3333-4444', email: 'vendas@central.com' }
  ],
  employees: [
    { id: 'e1', name: 'Carlos Mestre', specialty: 'Motor', active: true },
    { id: 'e2', name: 'André Faísca', specialty: 'Elétrica', active: true }
  ],
  inventoryOrders: []
};

export function useDatabase() {
  const [db, setDb] = useState<DB>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const updateDb = (updater: (prev: DB) => DB) => {
    setDb(prev => updater(prev));
  };

  const exportBackup = () => {
    const dataStr = JSON.stringify(db, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `sgo_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        setDb(content);
      } catch (err) {
        alert('Erro ao importar backup. Formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return { db, updateDb, exportBackup, importBackup };
}
