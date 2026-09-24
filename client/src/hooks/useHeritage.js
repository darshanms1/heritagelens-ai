import { useState, useCallback } from 'react';
import { analyzeImage, getExplanation, askFollowUp, getDemoResult } from '../services/api';

export const useHeritage = () => {
  const [view, setView] = useState('home'); // 'home' | 'explore'
  const [result, setResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('heritagelens_language') || 'en';
    } catch {
      return 'en';
    }
  });
  const [level, setLevel] = useState('tourist');
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const reset = useCallback(() => {
    setView('home');
    setResult(null);
    setCurrentImage(null);
    setError(null);
    setFollowUpHistory([]);
    setSelectedDemo(null);
  }, []);

  const fetchExplanation = async (monumentId, siteId, lang, lvl) => {
    setLoading(true);
    const res = await getExplanation(siteId, monumentId, lang, lvl);
    if (res.error) {
      setError(res.message);
    } else {
      setResult(prev => ({ ...prev, explanation: res.explanation, evidence_sources: res.evidence_sources, language: lang, level: lvl }));
      setError(null);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file) => {
    console.log('[HeritageLens] UPLOAD START', { filename: file?.name, size: file?.size });
    setLoading(true);
    setError(null);
    setView('explore');
    try {
      const objectUrl = URL.createObjectURL(file);
      setCurrentImage(objectUrl);
      const res = await analyzeImage(file, language, level);
      console.log('[HeritageLens] API RESPONSE:', res);
      console.log('[HeritageLens] identified:', res?.identified);
      console.log('[HeritageLens] monumentId:', res?.monumentId || res?.monument_id);
      console.log('[HeritageLens] monumentName:', res?.monumentName || res?.monument_name);
      console.log('[HeritageLens] matchMethod:', res?.matchMethod);
      console.log('[HeritageLens] confidence:', res?.confidence);
      console.log('[HeritageLens] error:', res?.error);
      
      if (res && res.error) {
        const fallbackState = {
          identification: {
            site: "Bagalkot Heritage Region",
            site_id: null,
            monument: "Unrecognized Monument",
            monument_id: null,
            confidence_label: "low",
            visual_clues: []
          },
          candidates: [
            { monument_id: 'virupaksha_temple_pattadakal', monument_name: 'Virupaksha Temple', site_name: 'Pattadakal', site_id: 'pattadakal' },
            { monument_id: 'mallikarjuna_temple_pattadakal', monument_name: 'Mallikarjuna Temple', site_name: 'Pattadakal', site_id: 'pattadakal' },
            { monument_id: 'durga_temple_aihole', monument_name: 'Durga Temple', site_name: 'Aihole', site_id: 'aihole' }
          ],
          explanation: null,
          low_confidence: true,
          message: res.message || "Could not automatically identify this monument. Please select from suggested candidates or choose manually below.",
          is_cached: false
        };
        console.log('[HeritageLens] frontend state after response:', fallbackState);
        setResult(fallbackState);
      } else if (res) {
        console.log('[HeritageLens] frontend state after response:', res);
        setResult(res);
      }
    } catch (err) {
      console.error("Image upload processing error:", err);
      setResult({
        identification: {
          site: "Bagalkot Heritage Region",
          site_id: null,
          monument: "Unrecognized Monument",
          monument_id: null,
          confidence_label: "low",
          visual_clues: []
        },
        candidates: [
          { monument_id: 'virupaksha_temple_pattadakal', monument_name: 'Virupaksha Temple', site_name: 'Pattadakal', site_id: 'pattadakal' },
          { monument_id: 'mallikarjuna_temple_pattadakal', monument_name: 'Mallikarjuna Temple', site_name: 'Pattadakal', site_id: 'pattadakal' },
          { monument_id: 'durga_temple_aihole', monument_name: 'Durga Temple', site_name: 'Aihole', site_id: 'aihole' }
        ],
        explanation: null,
        low_confidence: true,
        message: "Visual analysis encountered a network timeout. Please select from suggested candidates or choose manually below.",
        is_cached: false
      });
    } finally {
      // GUARANTEED: Never stays permanently stuck on loading spinner
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoId) => {
    setLoading(true);
    setError(null);
    setView('explore');
    setSelectedDemo(demoId);
    const res = await getDemoResult(demoId, language, level);
    if (res.error) {
      setError(res.message);
    } else {
      setResult(res);
      if (res.image_url) {
        setCurrentImage(res.image_url);
      } else {
        const baseName = demoId.replace('_demo', '');
        setCurrentImage(`/demo-images/${baseName}_demo.svg`);
      }
    }
    setLoading(false);
  };

  const handleManualSelect = async (siteId, monumentId) => {
    setView('explore');
    setLoading(true);
    setError(null);
    setCurrentImage(`/monument-images/${monumentId}.jpg`);
    const res = await getExplanation(siteId, monumentId, language, level);
    if (res.error) {
      setError(res.message);
    } else {
      setResult(res);
      if (res.image_url) {
        setCurrentImage(res.image_url);
      }
    }
    setLoading(false);
  };

  const handleFollowUp = async (question) => {
    if (!result || !result.monument_id) return;
    const context = followUpHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n');
    const res = await askFollowUp(question, result.monument_id, context, language);
    if (!res.error) {
      setFollowUpHistory(prev => [...prev, { question, answer: res.answer }]);
    }
    return res;
  };

  const changeLanguage = async (newLang) => {
    if (newLang === language) return;
    try {
      localStorage.setItem('heritagelens_language', newLang);
    } catch {}
    setLanguage(newLang);
    if (result && result.monument_id) {
      if (selectedDemo) {
        handleDemoSelect(selectedDemo); // Re-fetch demo
      } else {
        // Derive siteId from the monument_id (e.g., "virupaksha_temple_pattadakal" -> look up via knowledgeService on backend)
        fetchExplanation(result.monument_id, result.identification?.site_id || '', newLang, level);
      }
    }
  };

  const changeLevel = async (newLevel) => {
    if (newLevel === level) return;
    setLevel(newLevel);
    if (result && result.monument_id) {
       if (selectedDemo) {
        handleDemoSelect(selectedDemo);
      } else {
        fetchExplanation(result.monument_id, result.identification?.site_id || '', language, newLevel);
      }
    }
  };

  return {
    view,
    result,
    currentImage,
    loading,
    error,
    language,
    level,
    followUpHistory,
    selectedDemo,
    handleImageUpload,
    handleDemoSelect,
    handleManualSelect,
    handleFollowUp,
    changeLanguage,
    changeLevel,
    reset,
    setView
  };
};
