import { Card } from '../ui/Card';

export const ExplanationPanel = ({ explanation, evidenceSources = [] }) => {
  if (!explanation) return null;

  const sections = [
    { key: 'what_am_i_looking_at', icon: '🔍', title: 'What am I looking at?' },
    { key: 'why_is_it_important', icon: '⭐', title: 'Why is it important?' },
    { key: 'historical_context', icon: '📜', title: 'Historical Context' },
    { key: 'architectural_features', icon: '🏛️', title: 'Architectural Features' },
    { key: 'what_to_observe', icon: '👁️', title: 'What to Observe' },
    { key: 'interesting_fact', icon: '💡', title: 'Interesting Fact' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ key, icon, title }) => {
          if (!explanation[key]) return null;
          // Make the first two sections span full width
          const isFullWidth = key === 'what_am_i_looking_at' || key === 'why_is_it_important';
          
          return (
            <Card key={key} className={`p-5 ${isFullWidth ? 'col-span-full' : ''}`}>
              <h3 className="flex items-center space-x-2 text-lg font-serif text-heritage-primary mb-3 pb-2 border-b border-heritage-border/50">
                <span>{icon}</span>
                <span>{title}</span>
              </h3>
              <p className="text-heritage-textSecondary leading-relaxed whitespace-pre-wrap">
                {explanation[key]}
              </p>
            </Card>
          );
        })}
      </div>

      {evidenceSources.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-center p-4 bg-heritage-surface rounded-xl border border-heritage-border text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-heritage-success/10 text-heritage-success mb-2">
            ✓ Evidence-grounded explanation
          </span>
          <p className="text-xs text-heritage-textMuted">
            Sources: {evidenceSources.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};
