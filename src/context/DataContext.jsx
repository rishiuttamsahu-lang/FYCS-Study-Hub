import { createContext, useContext, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [homeData, setHomeData] = useState({ subjects: [], recents: [] });
  const [isHomeLoaded, setIsHomeLoaded] = useState(false);
  const [libraryMaterials, setLibraryMaterials] = useState([]);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  const fetchAllData = async () => {
    if (isLibraryLoaded) return;
    
    try {
      console.log("🕵️‍♂️ DETECTIVE MODE: Looking for data...");

      // 1. Try fetching from 'materials' (lowercase)
      const snap1 = await getDocs(collection(db, "materials"));
      console.log(`📂 Collection 'materials': Found ${snap1.size} items`);

      // 2. Try fetching from 'Materials' (Capitalized) - Common mistake
      const snap2 = await getDocs(collection(db, "Materials"));
      console.log(`📂 Collection 'Materials': Found ${snap2.size} items`);

      // 3. Try fetching from 'notes'
      const snap3 = await getDocs(collection(db, "notes"));
      console.log(`📂 Collection 'notes': Found ${snap3.size} items`);

      // MERGE ALL FOUND DATA
      let allDocs = [
        ...snap1.docs.map(d => ({ id: d.id, ...d.data() })),
        ...snap2.docs.map(d => ({ id: d.id, ...d.data() })),
        ...snap3.docs.map(d => ({ id: d.id, ...d.data() }))
      ];

      console.log(`🎉 TOTAL RAW ITEMS FOUND: ${allDocs.length}`);

      if (allDocs.length === 0) {
        alert("⚠️ Database Connected but NO Data Found! Check Collection Name in Firebase Console.");
      }

      // 4. Set Library Data (No Filter, Just Show It)
      setLibraryMaterials(allDocs);
      setIsLibraryLoaded(true);

      // 5. Set Home Data
      setHomeData({ 
        subjects: [], // Fetching subjects below
        recents: allDocs.slice(0, 5) 
      });

      // 6. Fetch Subjects (Since we know this works)
      const subSnap = await getDocs(collection(db, "subjects"));
      const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHomeData(prev => ({ ...prev, subjects: subs }));
      setIsHomeLoaded(true);

    } catch (error) {
      console.error("🔥 CRITICAL ERROR:", error);
      alert("Error: " + error.message);
      setIsHomeLoaded(true);
      setIsLibraryLoaded(true);
    }
  };

  return (
    <DataContext.Provider value={{ 
      homeData, 
      libraryMaterials, 
      fetchLibraryData: fetchAllData, 
      fetchHomeData: fetchAllData,
      isLibraryLoaded,
      isHomeLoaded
    }}>
      {children}
    </DataContext.Provider>
  );
};