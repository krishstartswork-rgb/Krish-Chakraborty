import { useEffect, useState } from 'react';
import { CaseStudyPage } from './components/CaseStudyPage';
import { FooterSection } from './components/FooterSection';
import { HeroSection } from './components/HeroSection';
import { HomeSections } from './components/HomeSections';
import { KineticCursor } from './components/KineticCursor';
import { Navbar } from './components/Navbar';
import { RecoverAssetsBanner } from './components/RecoverAssetsBanner';
import { RecoverAssetsPage } from './components/RecoverAssetsPage';
import {
  AboutPage,
  ContactPage,
  ExperimentsPage,
  ResumePage,
  WorkArchivePage,
} from './components/SubPages';
import { RoutePath } from './types/portfolio';

function parseHashRoute(): RoutePath {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === '/') return '/';
  if (raw === '/work') return '/work';
  if (raw.startsWith('/work/')) return raw as RoutePath;
  if (raw === '/about') return '/about';
  if (raw === '/experiments') return '/experiments';
  if (raw === '/contact') return '/contact';
  if (raw === '/resume') return '/resume';
  if (raw === '/recover-assets') return '/recover-assets';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<RoutePath>(() => parseHashRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (nextRoute: RoutePath) => {
    if (nextRoute === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = nextRoute === '/' ? '' : nextRoute;
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const scrollToSelectedWork = () => {
    const el = document.getElementById('selected-work');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderPage = () => {
    if (route === '/') {
      return (
        <>
          <HeroSection
            onExploreWork={() => navigate('/work')}
            onScrollToWork={scrollToSelectedWork}
          />
          <HomeSections onNavigate={navigate} />
        </>
      );
    }
    if (route === '/work') {
      return <WorkArchivePage onNavigate={navigate} />;
    }
    if (route.startsWith('/work/')) {
      const slug = route.replace('/work/', '');
      return <CaseStudyPage slug={slug} onNavigate={navigate} />;
    }
    if (route === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (route === '/experiments') {
      return <ExperimentsPage onNavigate={navigate} />;
    }
    if (route === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }
    if (route === '/resume') {
      return <ResumePage onNavigate={navigate} />;
    }
    if (route === '/recover-assets') {
      return <RecoverAssetsPage onNavigate={navigate} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#111113]">
      <KineticCursor />
      {route !== '/resume' && route !== '/recover-assets' && (
        <RecoverAssetsBanner onNavigate={navigate} />
      )}
      {route !== '/resume' && <Navbar currentRoute={route} onNavigate={navigate} />}
      <main>{renderPage()}</main>
      {route !== '/resume' && <FooterSection onNavigate={navigate} />}
    </div>
  );
}
