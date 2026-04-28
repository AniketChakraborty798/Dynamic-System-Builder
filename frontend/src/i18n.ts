import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Welcome": "Welcome",
      "Login": "Login",
      "Logout": "Logout",
      "Import CSV": "Import CSV",
      "Language": "Language"
    }
  },
  fr: {
    translation: {
      "Dashboard": "Tableau de bord",
      "Welcome": "Bienvenue",
      "Login": "Connexion",
      "Logout": "Déconnexion",
      "Import CSV": "Importer CSV",
      "Language": "Langue"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
