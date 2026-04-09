import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SpecPage } from './pages/SpecPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RankingsPage } from './pages/RankingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AskAiPage } from './pages/AskAiPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const isDark = useThemeStore((s) => s.isDark);

  // Sync class on initial mount (the inline script handles the very first paint)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/guide/:specName" element={<SpecPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/ask-ai" element={<AskAiPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
