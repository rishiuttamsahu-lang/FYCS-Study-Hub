import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db, auth, googleProvider } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, getDoc, Timestamp, setDoc, query, orderBy, where } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';

// Create Context
const AppContext = createContext();

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider Component
export const AppProvider = ({ children }) => {
  // State for materials and subjects from Firestore
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters] = useState([
    { id: "1", name: "Semester 1", active: true },
    { id: "2", name: "Semester 2", active: true },
    { id: "3", name: "Semester 3", active: true },
    { id: "4", name: "Semester 4", active: true }
  ]);
  
  // Authentication state
  const [user, setUser] = useState(null);
  
  // Users state from Firestore
  const [users, setUsers] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // User role state (separate from users array for real-time updates)
  const [userRole, setUserRole] = useState(null);
  
  // Real-time listeners for materials and subjects
  useEffect(() => {
    let materialsLoaded = false;
    let subjectsLoaded = false;
    
    const unsubscribeMaterials = onSnapshot(
      query(collection(db, "materials"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const materialsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(materialsList);
        materialsLoaded = true;
        // Set loading to false after both data loads complete
        if (materialsLoaded && subjectsLoaded && loading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to materials: ", error);
        materialsLoaded = true;
        // Still set loading to false even if there's an error
        if (materialsLoaded && subjectsLoaded && loading) {
          setLoading(false);
        }
      }
    );
    
    const unsubscribeSubjects = onSnapshot(
      collection(db, "subjects"),
      (snapshot) => {
        const subjectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(subjectsList);
        subjectsLoaded = true;
        // Set loading to false after both data loads complete
        if (materialsLoaded && subjectsLoaded && loading) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to subjects: ", error);
        subjectsLoaded = true;
        // Still set loading to false even if there's an error
        if (materialsLoaded && subjectsLoaded && loading) {
          setLoading(false);
        }
      }
    );
    
    return () => {
      unsubscribeMaterials();
      unsubscribeSubjects();
    };
  }, [loading]);
  
  // Real-time listener for users
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort: Newest timestamp (b) - Oldest timestamp (a)
        const sortedUsers = usersList.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setUsers(sortedUsers);
      },
      (error) => {
        console.error("Error listening to users: ", error);
      }
    );
    
    return () => unsubscribeUsers();
  }, []);
  
  // Authentication listener with user sync and ban flag
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync user with Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            role: "student", // Default role
            isBanned: false, // Default to not banned
            createdAt: new Date()
          });
          setUserRole("student");
          setUser(currentUser);
        } else {
          // Set role from existing document
          const userData = userDocSnap.data();
          setUserRole(userData.role || "student");
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      // Set loading to false after auth state is determined
      if (loading) {
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, [loading]);
  
  // Real-time role listener for current user
  useEffect(() => {
    if (!user?.uid) return;
    
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeRole = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole(userData.role || "student");
        // Also update the users array for consistency
        setUsers(prevUsers => 
          prevUsers.map(u => u.uid === user.uid ? {...u, role: userData.role} : u)
        );
      }
    }, (error) => {
      console.error("Error listening to user role: ", error);
    });
    
    return () => unsubscribeRole();
  }, [user?.uid]);
  
  // RBAC - Role-Based Access Control
  const CREATOR_EMAILS = ["rishiuttamsahu@gmail.com", "piyushgupta122006@gmail.com"];
  const isAdmin = CREATOR_EMAILS.includes(user?.email) || userRole === "admin";
  
  // Derived state - Calculate statistics dynamically
  const stats = useMemo(() => {
    const approvedMaterials = materials.filter(m => m.status === 'Approved');
    const pendingMaterials = materials.filter(m => m.status === 'Pending');
    
    return {
      totalViews: approvedMaterials.reduce((sum, material) => sum + (material.views || 0), 0),
      totalDownloads: approvedMaterials.reduce((sum, material) => sum + (material.downloads || 0), 0),
      pendingRequests: pendingMaterials.length,
      totalMaterials: materials.length,
      approvedMaterials: approvedMaterials.length,
      totalSubjects: subjects.length,
      totalSemesters: semesters.length
    };
  }, [materials, subjects, semesters]);

  // Authentication functions
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Action Functions for Firestore
  
  // 1. Add new material
  const addMaterial = async (formData) => {
    try {
      const title = formData.title.trim();
      const subjectId = formData.subjectId;
      
      // Pre-upload check: Query for existing material with same title and subject
      const duplicateQuery = query(
        collection(db, "materials"),
        where("subjectId", "==", subjectId),
        where("title", "==", title)
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      // Block duplicates
      if (!duplicateSnapshot.empty) {
        return { 
          success: false, 
          error: "⚠️ Duplicate Found: A file with this Name and Subject already exists!" 
        };
      }
      
      // Allow unique: Proceed with upload
      const newMaterial = {
        title: title,
        subjectId: subjectId,
        semId: formData.semId,
        type: formData.type,
        link: formData.link.trim(),
        status: "Pending",
        views: 0,
        downloads: 0,
        uploadedBy: formData.uploadedBy || "Student",
        date: serverTimestamp(), // Use Firestore timestamp
        createdAt: serverTimestamp() // Add creation timestamp for sorting
      };
      
      const docRef = await addDoc(collection(db, "materials"), newMaterial);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding material:', error);
      // Return a safe error message
      const errorMessage = error?.message || error?.toString() || "Failed to add material";
      return { success: false, error: errorMessage };
    }
  };

  // 2. Approve material (Pending → Approved)
  const approveMaterial = async (id) => {
    try {
      await updateDoc(doc(db, "materials", id), { 
        status: "Approved",
        approvedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error approving material:', error);
      const errorMessage = error?.message || error?.toString() || "Failed to approve material";
      return { success: false, error: errorMessage };
    }
  };

  // 3. Reject material (Remove entirely)
  const rejectMaterial = async (id) => {
    try {
      await deleteDoc(doc(db, "materials", id));
      return { success: true };
    } catch (error) {
      console.error('Error rejecting material:', error);
      const errorMessage = error?.message || error?.toString() || "Failed to reject material";
      return { success: false, error: errorMessage };
    }
  };

  // 4. Delete approved material
  const deleteMaterial = async (id) => {
    try {
      await deleteDoc(doc(db, "materials", id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting material:', error);
      const errorMessage = error?.message || error?.toString() || "Failed to delete material";
      return { success: false, error: errorMessage };
    }
  };

  // 5. Add new subject
  const addSubject = async (name, semId) => {
    try {
      const newSubject = {
        name: name.trim(),
        semId: Number(semId), // Force Number type for consistency
        icon: "Book", // Default icon
        createdAt: new Date() // Useful for sorting
      };
      
      const docRef = await addDoc(collection(db, "subjects"), newSubject);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding subject:', error);
      const errorMessage = error?.message || error?.toString() || "Failed to add subject";
      return { success: false, error: errorMessage };
    }
  };

  // 6. Increment view count
  const incrementView = async (id) => {
    try {
      const materialRef = doc(db, "materials", id);
      const materialSnap = await getDoc(materialRef);
      
      if (materialSnap.exists()) {
        const currentViews = materialSnap.data().views || 0;
        await updateDoc(materialRef, { views: currentViews + 1 });
        return { success: true };
      } else {
        return { success: false, error: "Material not found" };
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
      const errorMessage = error?.message || error?.toString() || "Failed to increment view count";
      return { success: false, error: errorMessage };
    }
  };

  // Utility Functions
  const getSubjectById = (id) => {
    return subjects.find(subject => subject.id === id);
  };

  const getSemesterById = (id) => {
    return semesters.find(semester => semester.id === id);
  };

  const getMaterialsBySubject = (subjectId) => {
    return materials.filter(material => 
      material.subjectId === subjectId && material.status === "Approved"
    );
  };

  const getMaterialsBySemester = (semId) => {
    return materials.filter(material => 
      material.semId === semId && material.status === "Approved"
    );
  };

  const getPendingMaterials = () => {
    return materials.filter(material => material.status === "Pending");
  };

  const getApprovedMaterials = () => {
    return materials.filter(material => material.status === "Approved");
  };

  const getRecentMaterials = (limit = 10) => {
    return materials
      .filter(material => material.status === "Approved")
      .sort((a, b) => {
        // Handle both Timestamp objects and regular dates
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.date || Date.now());
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.date || Date.now());
        return dateB - dateA; // Sort by date descending
      })
      .slice(0, limit);
  };

  // Get subjects by semester ID
  const getSubjectsBySemester = (semId) => {
    return subjects.filter(subject => Number(subject.semId) === Number(semId));
  };

  // Context value
  const contextValue = {
    // State
    materials,
    subjects,
    semesters,
    users,
    user, // Add user to context
    userRole,
    stats,
    loading,
    
    // RBAC
    isAdmin,
    
    // Authentication functions
    login,
    logout,
    
    // Action Functions
    addMaterial,
    approveMaterial,
    rejectMaterial,
    deleteMaterial,
    addSubject,
    incrementView,
    
    // Utility Functions
    getSubjectById,
    getSemesterById,
    getMaterialsBySubject,
    getMaterialsBySemester,
    getPendingMaterials,
    getApprovedMaterials,
    getRecentMaterials,
    getSubjectsBySemester
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;