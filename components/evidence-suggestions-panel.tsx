import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

export function EvidenceSuggestionsPanel({ suggestions }: { suggestions: string[] }) {
  return (
    <Card className="border-border bg-surface-raised">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Camera className="h-4 w-4 text-saffron" />
          Evidence suggestions
        </CardTitle>
      </CardHeader>
      <ul className="space-y-2 text-sm text-text-secondary">
        {suggestions.map((s) => (
          <li key={s} className="flex gap-2">
            <span className="text-saffron">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
