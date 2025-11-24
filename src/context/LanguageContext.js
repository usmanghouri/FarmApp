import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // "en" for English, "ur" for Urdu

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("farmconnect-language");
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        // Ignore errors, use default language
      }
    };
    loadLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "ur" : "en";
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem("farmconnect-language", newLanguage);
    } catch (error) {
      // Ignore persistence errors
    }
  };

  const value = {
    language,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

