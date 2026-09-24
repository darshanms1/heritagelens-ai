import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ 
  children, 
  view, 
  onNavigate, 
  language, 
  onLanguageChange 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-heritage-background">
      <Header 
        view={view} 
        onNavigate={onNavigate} 
        language={language} 
        onLanguageChange={onLanguageChange} 
      />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {children}
      </main>
      <Footer language={language} />
    </div>
  );
};
