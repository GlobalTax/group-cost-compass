import { X } from 'lucide-react';
import { Badge } from './badge';
import { Input } from './input';
import { useState, KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[40px]">
      {value.map((tag, idx) => (
        <Badge key={idx} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 hover:bg-muted rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[120px] p-0 h-6"
      />
    </div>
  );
}
