import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DynamicTable from './components/DynamicTable';
import DynamicForm from './components/DynamicForm';
import Auth from './components/Auth';
import AuthContext from './context/AuthContext';

const DynamicPage = ({ page, config }: { page: any, config: any }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  // If Auth is enabled and page needs auth (for simplicity, all non-dashboard pages need auth here if auth is on)
  if (config.features?.auth && !user && page.path !== '/') {
    return <Auth />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {page.components.map((comp: any, idx: number) => {
        if (comp.type === 'hero') {
          return (
            <div key={idx} className="bg-gradient-to-r from-primary to-blue-400 text-white rounded-xl p-10 text-center shadow-lg transition-transform hover:scale-[1.01]">
              <h2 className="text-4xl font-extrabold mb-4 drop-shadow-md">{t(comp.title)}</h2>
              <p className="text-xl opacity-90">{t(comp.subtitle)}</p>
            </div>
          );
        }
        
        if (comp.type === 'table') {
          const modelDef = config.models.find((m: any) => m.name === page.model);
          return <DynamicTable key={idx} model={modelDef} allowCsvImport={comp.allowCsvImport} config={config} />;
        }

        if (comp.type === 'form') {
          const modelDef = config.models.find((m: any) => m.name === page.model);
          return <DynamicForm key={idx} model={modelDef} />;
        }

        return <div key={idx} className="p-4 bg-red-100 text-red-700 rounded-md">Unknown Component: {comp.type}</div>;
      })}
    </div>
  );
};

export default DynamicPage;
