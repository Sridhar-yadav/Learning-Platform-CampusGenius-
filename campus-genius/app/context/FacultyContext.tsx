"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FacultyProfile {
  name: string;
  department: string;
  yearsOfExperience: string;
}

interface FacultyContextType {
  profile: FacultyProfile;
  updateProfile: (newProfile: FacultyProfile) => void;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export function FacultyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FacultyProfile>({
    name: "",
    department: "",
    yearsOfExperience: "",
  });

  const updateProfile = (newProfile: FacultyProfile) => {
    setProfile(newProfile);
  };

  return (
    <FacultyContext.Provider value={{ profile, updateProfile }}>
      {children}
    </FacultyContext.Provider>
  );
}

export function useFaculty() {
  const context = useContext(FacultyContext);
  if (context === undefined) {
    throw new Error("useFaculty must be used within a FacultyProvider");
  }
  return context;
} 