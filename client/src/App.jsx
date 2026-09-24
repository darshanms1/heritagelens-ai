import React from 'react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { PlanJourneyPage } from './pages/PlanJourneyPage';
import { PassportPage } from './pages/PassportPage';
import { ExplorePage } from './pages/ExplorePage';
import { useHeritage } from './hooks/useHeritage';

function App() {
  const {
    view,
    result,
    currentImage,
    loading,
    error,
    language,
    level,
    followUpHistory,
    handleImageUpload,
    handleDemoSelect,
    handleManualSelect,
    handleFollowUp,
    changeLanguage,
    changeLevel,
    reset,
    setView
  } = useHeritage();

  const [previousView, setPreviousView] = React.useState('discover');
  const [siteFilter, setSiteFilter] = React.useState('all');

  const handleNavigate = (targetView, filter = 'all') => {
    if (filter) setSiteFilter(filter);
    if (targetView === 'home') {
      reset();
    } else {
      setView(targetView);
    }
  };

  const handleSelectMonumentWithHistory = (siteId, monumentId) => {
    setPreviousView(view === 'explore' ? 'discover' : view);
    handleManualSelect(siteId, monumentId);
  };

  return (
    <Layout 
      view={view} 
      onNavigate={handleNavigate}
      language={language}
      onLanguageChange={changeLanguage}
    >
      {view === 'home' || view === 'vision' ? (
        <HomePage 
          onImageUpload={handleImageUpload}
          onManualSelect={handleSelectMonumentWithHistory}
          onDemoSelect={handleDemoSelect}
          onNavigate={handleNavigate}
          language={language}
          onLanguageChange={changeLanguage}
        />
      ) : view === 'discover' ? (
        <DiscoverPage 
          onExploreMonument={handleSelectMonumentWithHistory}
          initialSiteId={siteFilter}
          language={language}
          onLanguageChange={changeLanguage}
        />
      ) : view === 'plan' ? (
        <PlanJourneyPage 
          onSelectMonument={handleSelectMonumentWithHistory}
          language={language}
          onLanguageChange={changeLanguage}
        />
      ) : view === 'passport' ? (
        <PassportPage 
          onSelectMonument={handleSelectMonumentWithHistory}
          language={language}
          onLanguageChange={changeLanguage}
        />
      ) : (
        <ExplorePage 
          result={result}
          currentImage={currentImage}
          loading={loading}
          error={error}
          language={language}
          level={level}
          followUpHistory={followUpHistory}
          onLanguageChange={changeLanguage}
          onLevelChange={changeLevel}
          onFollowUpAsk={handleFollowUp}
          onManualSelect={handleSelectMonumentWithHistory}
          onBack={() => handleNavigate(previousView || 'discover')}
        />
      )}
    </Layout>
  );
}

export default App;
