import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButton {
  icon: any;
  command: string;
  title: string;
  value?: string;
  onClick?: () => void;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const toolbarButtons: { group: string; buttons: ToolbarButton[] }[] = [
    {
      group: 'text-format',
      buttons: [
        { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
        { icon: Strikethrough, command: 'strikethrough', title: 'Strikethrough' },
      ]
    },
    {
      group: 'headings',
      buttons: [
        { icon: Heading1, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
        { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
        { icon: Heading3, command: 'formatBlock', value: 'h3', title: 'Heading 3' },
        { icon: Type, command: 'formatBlock', value: 'p', title: 'Normal Text' },
      ]
    },
    {
      group: 'lists',
      buttons: [
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
      ]
    },
    {
      group: 'align',
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
        { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
      ]
    },
    {
      group: 'insert',
      buttons: [
        { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
        { icon: Link, command: 'custom', onClick: insertLink, title: 'Insert Link' },
        { icon: Image, command: 'custom', onClick: insertImage, title: 'Insert Image' },
      ]
    },
    {
      group: 'history',
      buttons: [
        { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
        { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' },
      ]
    }
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((group, groupIndex) => (
          <div key={groupIndex} className="flex gap-1">
            {group.buttons.map((btn, btnIndex) => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btnIndex}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={btn.title}
                  onClick={() => {
                    if (btn.onClick) {
                      btn.onClick();
                    } else {
                      execCommand(btn.command, btn.value);
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
            {groupIndex < toolbarButtons.length - 1 && (
              <div className="w-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-p:my-2",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md",
          "prose-img:rounded-md prose-img:max-w-full",
          "prose-a:text-primary prose-a:underline",
          !value && !isFocused && "before:content-[attr(data-placeholder)] before:text-muted-foreground before:opacity-50"
        )}
        data-placeholder={placeholder || "Start writing..."}
        suppressContentEditableWarning
      />
    </div>
  );
}
