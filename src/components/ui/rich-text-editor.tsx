'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Superscript as SuperscriptIcon,
  Type,
  Underline as UnderlineIcon,
  Undo,
  Unlink,
} from 'lucide-react';
import { useEffect } from 'react';

// Shared configuration for both editor and viewer
const getEditorExtensions = (isViewer = false) => [
  StarterKit.configure({
    // Configure extensions with Tailwind classes
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc pl-6 space-y-1',
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal pl-6 space-y-1',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'leading-relaxed',
      },
    },
    blockquote: {
      HTMLAttributes: {
        class:
          'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground my-4',
      },
    },
    heading: {
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: 'font-bold leading-tight',
      },
    },
    paragraph: {
      HTMLAttributes: {
        class: 'leading-relaxed',
      },
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'bg-yellow-200 dark:bg-yellow-900/50 rounded px-1',
    },
  }),
  Underline.configure({
    HTMLAttributes: {
      class: 'underline decoration-2',
    },
  }),
  Superscript.configure({
    HTMLAttributes: {
      class: 'text-xs align-super',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Link.configure({
    openOnClick: isViewer, // Enable link clicking in viewer mode
    HTMLAttributes: {
      class: `text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 ${
        isViewer ? 'cursor-pointer' : ''
      }`,
    },
  }),
];

const getEditorProps = (isViewer = false) => ({
  attributes: {
    class: `prose prose-sm max-w-none ${
      isViewer ? '' : 'min-h-[150px]'
    } prose-headings:font-bold prose-headings:leading-tight prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 focus:outline-none`,
  },
});

// Rich Text Editor Component
interface RichTextEditorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder = 'Commencez à écrire...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(false),
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Only call onChange if content actually changed
      if (html !== value) {
        onChange(html === '<p></p>' ? null : html);
      }
    },
    editorProps: getEditorProps(false),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          'border rounded-lg min-h-[200px] animate-pulse',
          className
        )}
      >
        <div className="border-b p-3">
          <div className="h-8 bg-muted rounded w-full"></div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b p-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo/Redo */}
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0"
              title="Annuler"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0"
              title="Rétablir"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Heading Selection */}
          <ToggleGroup
            type="single"
            value={
              editor.isActive('heading', { level: 1 })
                ? 'h1'
                : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                ? 'h3'
                : editor.isActive('paragraph')
                ? 'p'
                : 'p'
            }
            onValueChange={(value) => {
              if (value === 'h1') {
                editor.chain().focus().setHeading({ level: 1 }).run();
              } else if (value === 'h2') {
                editor.chain().focus().setHeading({ level: 2 }).run();
              } else if (value === 'h3') {
                editor.chain().focus().setHeading({ level: 3 }).run();
              } else if (value === 'p') {
                editor.chain().focus().setParagraph().run();
              }
            }}
            size="sm"
            className="border rounded-md"
          >
            <ToggleGroupItem value="p" className="h-8 px-3" title="Paragraphe">
              <Type className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="h1"
              className="h-8 px-3 font-bold text-base"
              title="Titre 1"
            >
              <Heading1 className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="h2"
              className="h-8 px-3 font-bold"
              title="Titre 2"
            >
              <Heading2 className="h-[18px] w-[18px]" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="h3"
              className="h-8 px-3 font-semibold"
              title="Titre 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Formatting */}
          <ToggleGroup
            type="multiple"
            value={[
              ...(editor.isActive('bold') ? ['bold'] : []),
              ...(editor.isActive('italic') ? ['italic'] : []),
              ...(editor.isActive('underline') ? ['underline'] : []),
              ...(editor.isActive('strike') ? ['strike'] : []),
              ...(editor.isActive('superscript') ? ['superscript'] : []),
            ]}
            onValueChange={(values) => {
              // Handle bold
              const shouldBeBold = values.includes('bold');
              const isBold = editor.isActive('bold');
              if (shouldBeBold !== isBold) {
                editor.chain().focus().toggleBold().run();
              }

              // Handle italic
              const shouldBeItalic = values.includes('italic');
              const isItalic = editor.isActive('italic');
              if (shouldBeItalic !== isItalic) {
                editor.chain().focus().toggleItalic().run();
              }

              // Handle underline
              const shouldBeUnderline = values.includes('underline');
              const isUnderline = editor.isActive('underline');
              if (shouldBeUnderline !== isUnderline) {
                editor.chain().focus().toggleUnderline().run();
              }

              // Handle strike
              const shouldBeStrike = values.includes('strike');
              const isStrike = editor.isActive('strike');
              if (shouldBeStrike !== isStrike) {
                editor.chain().focus().toggleStrike().run();
              }

              // Handle superscript
              const shouldBeSuperscript = values.includes('superscript');
              const isSuperscript = editor.isActive('superscript');
              if (shouldBeSuperscript !== isSuperscript) {
                editor.chain().focus().toggleSuperscript().run();
              }
            }}
            size="sm"
            className="border rounded-md"
          >
            <ToggleGroupItem value="bold" className="h-8 px-3" title="Gras">
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              className="h-8 px-3"
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              className="h-8 px-3"
              title="Souligné"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="strike" className="h-8 px-3" title="Barré">
              <Strikethrough className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="superscript"
              className="h-8 px-3"
              title="Exposant"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6" />

          {/* Highlight */}
          <Button
            type="button"
            variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()
            }
            className="h-8 px-3"
            title="Surligner"
          >
            <Highlighter className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Alignment */}
          <ToggleGroup
            type="single"
            value={
              editor.isActive({ textAlign: 'left' })
                ? 'left'
                : editor.isActive({ textAlign: 'center' })
                ? 'center'
                : editor.isActive({ textAlign: 'right' })
                ? 'right'
                : editor.isActive({ textAlign: 'justify' })
                ? 'justify'
                : 'left'
            }
            onValueChange={(value) => {
              if (value) {
                editor.chain().focus().setTextAlign(value).run();
              }
            }}
            size="sm"
            className="border rounded-md"
          >
            <ToggleGroupItem
              value="left"
              className="h-8 px-3"
              title="Aligner à gauche"
            >
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="center"
              className="h-8 px-3"
              title="Centrer"
            >
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="right"
              className="h-8 px-3"
              title="Aligner à droite"
            >
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="justify"
              className="h-8 px-3"
              title="Justifier"
            >
              <AlignJustify className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists and Quote */}
          <ToggleGroup
            type="multiple"
            value={[
              ...(editor.isActive('bulletList') ? ['bulletList'] : []),
              ...(editor.isActive('orderedList') ? ['orderedList'] : []),
              ...(editor.isActive('blockquote') ? ['blockquote'] : []),
            ]}
            onValueChange={(values) => {
              // Handle bullet list
              const shouldBeBulletList = values.includes('bulletList');
              const isBulletList = editor.isActive('bulletList');
              if (shouldBeBulletList !== isBulletList) {
                editor.chain().focus().toggleBulletList().run();
              }

              // Handle ordered list
              const shouldBeOrderedList = values.includes('orderedList');
              const isOrderedList = editor.isActive('orderedList');
              if (shouldBeOrderedList !== isOrderedList) {
                editor.chain().focus().toggleOrderedList().run();
              }

              // Handle blockquote
              const shouldBeBlockquote = values.includes('blockquote');
              const isBlockquote = editor.isActive('blockquote');
              if (shouldBeBlockquote !== isBlockquote) {
                editor.chain().focus().toggleBlockquote().run();
              }
            }}
            size="sm"
            className="border rounded-md"
          >
            <ToggleGroupItem
              value="bulletList"
              className="h-8 px-3"
              title="Liste à puces"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="orderedList"
              className="h-8 px-3"
              title="Liste numérotée"
            >
              <ListOrdered className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="blockquote"
              className="h-8 px-3"
              title="Citation"
            >
              <Quote className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6" />

          {/* Link */}
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={cn(
                'h-8 px-3 rounded-r-none border-r',
                editor.isActive('link') && 'bg-accent text-accent-foreground'
              )}
              title="Ajouter/Modifier un lien"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeLink}
              disabled={!editor.isActive('link')}
              className="h-8 px-3 rounded-l-none"
              title="Supprimer le lien"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:p-4 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2"
        />

        {/* Placeholder */}
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

// Rich Text Viewer Component
interface RichTextViewerProps {
  content: string | null;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: getEditorExtensions(true),
    content: content || '',
    editable: false, // Make it read-only
    editorProps: getEditorProps(true),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if there's no content
  if (!content || content.trim() === '' || content === '<p></p>') {
    return null;
  }

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2"
      />
    </div>
  );
}
