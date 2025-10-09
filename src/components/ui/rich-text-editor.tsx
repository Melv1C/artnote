'use client';

import './rich-text-editor.css';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { EditorView } from '@tiptap/pm/view';
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
import { Footnote, FootnoteReference, Footnotes } from 'tiptap-footnotes';

const headingsClass =
  '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2';

// Configuration interfaces
export interface RichTextEditorToolbarConfig {
  // History controls
  history?: {
    undo?: boolean;
    redo?: boolean;
  };
  // Headings and text types
  headings?: {
    h1?: boolean;
    h2?: boolean;
    h3?: boolean;
    paragraph?: boolean;
  };
  // Text formatting
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    superscript?: boolean;
    highlight?: boolean;
  };
  // Text alignment
  alignment?: {
    left?: boolean;
    center?: boolean;
    right?: boolean;
    justify?: boolean;
  };
  // Lists and blocks
  blocks?: {
    bulletList?: boolean;
    orderedList?: boolean;
    blockquote?: boolean;
  };
  // Links
  links?: {
    enabled?: boolean;
  };
  // Footnotes
  footnotes?: {
    enabled?: boolean;
  };
}

export interface RichTextEditorConfig {
  toolbar?: RichTextEditorToolbarConfig;
  // Editor behavior
  singleLine?: boolean;
  minHeight?: string;
  maxHeight?: string;
  // Extensions to disable
  disableExtensions?: string[];
}

// Default configuration
const defaultConfig: RichTextEditorConfig = {
  toolbar: {
    history: { undo: true, redo: true },
    headings: { h1: true, h2: true, h3: true, paragraph: true },
    formatting: {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      superscript: true,
      highlight: true,
    },
    alignment: { left: true, center: true, right: true, justify: true },
    blocks: { bulletList: true, orderedList: true, blockquote: true },
    links: { enabled: true },
    footnotes: { enabled: true },
  },
  singleLine: false,
  minHeight: '150px',
};

// Common presets
export const editorPresets = {
  // Basic formatting only (bold, italic)
  basic: {
    toolbar: {
      formatting: { bold: true, italic: true },
    },
  } as RichTextEditorConfig,

  // Single line editor (no headings, lists, etc.)
  singleLine: {
    toolbar: {
      formatting: { bold: true, italic: true, underline: true },
      links: { enabled: true },
    },
    singleLine: true,
  } as RichTextEditorConfig,

  // Full featured editor
  full: defaultConfig,

  // Minimal editor for comments
  minimal: {
    toolbar: {
      formatting: { bold: true, italic: true, strikethrough: true },
      blocks: { bulletList: true, orderedList: true },
      links: { enabled: true },
    },
  } as RichTextEditorConfig,
};

// Shared configuration for both editor and viewer
const getEditorExtensions = (isViewer = false, config: RichTextEditorConfig = defaultConfig) => {
  const extensions = [];

  // StarterKit - always needed but configure based on config
  const starterKitConfig: Record<
    string,
    false | { HTMLAttributes?: { class?: string }; levels?: number[] } | boolean
  > = {
    // Configure extensions with Tailwind classes
    bulletList:
      config.toolbar?.blocks?.bulletList !== false
        ? {
            HTMLAttributes: {
              class: 'list-disc pl-6 space-y-1',
            },
          }
        : false,
    orderedList:
      config.toolbar?.blocks?.orderedList !== false
        ? {
            HTMLAttributes: {
              class: 'list-decimal pl-6 space-y-1',
            },
          }
        : false,
    listItem: {
      HTMLAttributes: {
        class: 'leading-relaxed',
      },
    },
    blockquote:
      config.toolbar?.blocks?.blockquote !== false
        ? {
            HTMLAttributes: {
              class: 'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground my-4',
            },
          }
        : false,
    heading:
      config.toolbar?.headings?.h1 !== false ||
      config.toolbar?.headings?.h2 !== false ||
      config.toolbar?.headings?.h3 !== false
        ? {
            levels: [
              ...(config.toolbar?.headings?.h1 !== false ? [1] : []),
              ...(config.toolbar?.headings?.h2 !== false ? [2] : []),
              ...(config.toolbar?.headings?.h3 !== false ? [3] : []),
            ],
            HTMLAttributes: {
              class: 'font-bold leading-tight',
            },
          }
        : false,
    paragraph: {
      HTMLAttributes: {
        class: 'leading-relaxed',
      },
    },
    bold: config.toolbar?.formatting?.bold !== false,
    italic: config.toolbar?.formatting?.italic !== false,
    strike: config.toolbar?.formatting?.strikethrough !== false,
    // Disable hard breaks in single line mode
    hardBreak: !config.singleLine,
    // Disable enter key in single line mode
    ...(config.singleLine
      ? {
          heading: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
        }
      : {}),
  };

  extensions.push(StarterKit.configure(starterKitConfig));

  // Conditional extensions based on configuration
  if (
    config.toolbar?.formatting?.underline !== false ||
    config.toolbar?.formatting?.highlight !== false
  ) {
    extensions.push(TextStyle, Color);
  }

  if (config.toolbar?.formatting?.underline !== false) {
    extensions.push(
      Underline.configure({
        HTMLAttributes: {
          class: 'underline decoration-2',
        },
      }),
    );
  }

  if (config.toolbar?.formatting?.highlight !== false) {
    extensions.push(
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-900/50 rounded px-1',
        },
      }),
    );
  }

  if (config.toolbar?.formatting?.superscript !== false) {
    extensions.push(
      Superscript.configure({
        HTMLAttributes: {
          class: 'text-xs align-super',
        },
      }),
    );
  }

  if (config.toolbar?.alignment && !config.singleLine) {
    extensions.push(
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    );
  }

  if (config.toolbar?.links?.enabled !== false) {
    extensions.push(
      Link.configure({
        openOnClick: isViewer,
        HTMLAttributes: {
          class: `text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 ${
            isViewer ? 'cursor-pointer' : ''
          }`,
        },
      }),
    );
  }

  if (config.toolbar?.footnotes?.enabled !== false && !config.singleLine) {
    extensions.push(
      Document.extend({
        content: 'block+ footnotes?',
      }),
      Footnotes,
      Footnote,
      FootnoteReference,
    );
  }

  return extensions;
};

const getEditorProps = (isViewer = false, config: RichTextEditorConfig = defaultConfig) => {
  const minHeight = config.minHeight || '150px';
  const maxHeight = config.maxHeight;

  return {
    attributes: {
      class: `prose prose-sm max-w-none ${
        isViewer ? '' : `min-h-[${minHeight}]`
      } ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto` : ''} ${
        config.singleLine ? 'prose-p:my-0 prose-p:leading-normal' : ''
      } prose-headings:font-bold prose-headings:leading-tight prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 focus:outline-none`,
    },
    ...(config.singleLine
      ? {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            // Prevent Enter key in single line mode
            if (event.key === 'Enter') {
              event.preventDefault();
              return true;
            }
            return false;
          },
        }
      : {}),
  };
};

// Rich Text Editor Component
interface RichTextEditorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  config?: Partial<RichTextEditorConfig>;
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder = 'Commencez à écrire...',
  config,
}: RichTextEditorProps) {
  const finalConfig = config || defaultConfig;

  const editor = useEditor({
    extensions: getEditorExtensions(false, finalConfig),
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Only call onChange if content actually changed
      if (html !== value) {
        onChange(html === '<p></p>' ? null : html);
      }
    },
    editorProps: getEditorProps(false, finalConfig),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    const minHeight = finalConfig.singleLine ? '80px' : '200px';
    return (
      <div className={cn('border rounded-lg animate-pulse', className)} style={{ minHeight }}>
        {!finalConfig.singleLine && (
          <div className="border-b p-3">
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        )}
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Helper functions to check if toolbar sections should be shown
  const showHistory = finalConfig.toolbar?.history?.undo || finalConfig.toolbar?.history?.redo;
  const showHeadings =
    !finalConfig.singleLine &&
    (finalConfig.toolbar?.headings?.h1 ||
      finalConfig.toolbar?.headings?.h2 ||
      finalConfig.toolbar?.headings?.h3 ||
      finalConfig.toolbar?.headings?.paragraph);
  const showFormatting =
    finalConfig.toolbar?.formatting?.bold ||
    finalConfig.toolbar?.formatting?.italic ||
    finalConfig.toolbar?.formatting?.underline ||
    finalConfig.toolbar?.formatting?.strikethrough ||
    finalConfig.toolbar?.formatting?.superscript;
  const showHighlight = finalConfig.toolbar?.formatting?.highlight;
  const showAlignment =
    !finalConfig.singleLine &&
    (finalConfig.toolbar?.alignment?.left ||
      finalConfig.toolbar?.alignment?.center ||
      finalConfig.toolbar?.alignment?.right ||
      finalConfig.toolbar?.alignment?.justify);
  const showBlocks =
    !finalConfig.singleLine &&
    (finalConfig.toolbar?.blocks?.bulletList ||
      finalConfig.toolbar?.blocks?.orderedList ||
      finalConfig.toolbar?.blocks?.blockquote);
  const showLinks = finalConfig.toolbar?.links?.enabled;
  const showFootnotes = !finalConfig.singleLine && finalConfig.toolbar?.footnotes?.enabled;

  // Count visible sections for conditional separators
  const visibleSections = [
    showHistory,
    showHeadings,
    showFormatting,
    showHighlight,
    showAlignment,
    showBlocks,
    showLinks,
    showFootnotes,
  ].filter(Boolean).length;

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar - only show if not single line and has visible sections */}
      {visibleSections > 0 && (
        <div className="border-b p-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo/Redo */}
            {showHistory && (
              <>
                <div className="flex items-center">
                  {finalConfig.toolbar?.history?.undo && (
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
                  )}
                  {finalConfig.toolbar?.history?.redo && (
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
                  )}
                </div>
                {showHeadings && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Heading Selection */}
            {showHeadings && (
              <>
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
                  onValueChange={value => {
                    if (value === 'h1' && finalConfig.toolbar?.headings?.h1) {
                      editor.chain().focus().setHeading({ level: 1 }).run();
                    } else if (value === 'h2' && finalConfig.toolbar?.headings?.h2) {
                      editor.chain().focus().setHeading({ level: 2 }).run();
                    } else if (value === 'h3' && finalConfig.toolbar?.headings?.h3) {
                      editor.chain().focus().setHeading({ level: 3 }).run();
                    } else if (value === 'p' && finalConfig.toolbar?.headings?.paragraph) {
                      editor.chain().focus().setParagraph().run();
                    }
                  }}
                  size="sm"
                  className="border rounded-md"
                >
                  {finalConfig.toolbar?.headings?.paragraph && (
                    <ToggleGroupItem value="p" className="h-8 px-3" title="Paragraphe">
                      <Type className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.headings?.h1 && (
                    <ToggleGroupItem
                      value="h1"
                      className="h-8 px-3 font-bold text-base"
                      title="Titre 1"
                    >
                      <Heading1 className="h-5 w-5" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.headings?.h2 && (
                    <ToggleGroupItem value="h2" className="h-8 px-3 font-bold" title="Titre 2">
                      <Heading2 className="h-[18px] w-[18px]" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.headings?.h3 && (
                    <ToggleGroupItem value="h3" className="h-8 px-3 font-semibold" title="Titre 3">
                      <Heading3 className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>
                {showFormatting && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Text Formatting */}
            {showFormatting && (
              <>
                <ToggleGroup
                  type="multiple"
                  value={[
                    ...(editor.isActive('bold') ? ['bold'] : []),
                    ...(editor.isActive('italic') ? ['italic'] : []),
                    ...(editor.isActive('underline') ? ['underline'] : []),
                    ...(editor.isActive('strike') ? ['strike'] : []),
                    ...(editor.isActive('superscript') ? ['superscript'] : []),
                  ]}
                  onValueChange={values => {
                    // Handle bold
                    if (finalConfig.toolbar?.formatting?.bold) {
                      const shouldBeBold = values.includes('bold');
                      const isBold = editor.isActive('bold');
                      if (shouldBeBold !== isBold) {
                        editor.chain().focus().toggleBold().run();
                      }
                    }

                    // Handle italic
                    if (finalConfig.toolbar?.formatting?.italic) {
                      const shouldBeItalic = values.includes('italic');
                      const isItalic = editor.isActive('italic');
                      if (shouldBeItalic !== isItalic) {
                        editor.chain().focus().toggleItalic().run();
                      }
                    }

                    // Handle underline
                    if (finalConfig.toolbar?.formatting?.underline) {
                      const shouldBeUnderline = values.includes('underline');
                      const isUnderline = editor.isActive('underline');
                      if (shouldBeUnderline !== isUnderline) {
                        editor.chain().focus().toggleUnderline().run();
                      }
                    }

                    // Handle strike
                    if (finalConfig.toolbar?.formatting?.strikethrough) {
                      const shouldBeStrike = values.includes('strike');
                      const isStrike = editor.isActive('strike');
                      if (shouldBeStrike !== isStrike) {
                        editor.chain().focus().toggleStrike().run();
                      }
                    }

                    // Handle superscript
                    if (finalConfig.toolbar?.formatting?.superscript) {
                      const shouldBeSuperscript = values.includes('superscript');
                      const isSuperscript = editor.isActive('superscript');
                      if (shouldBeSuperscript !== isSuperscript) {
                        editor.chain().focus().toggleSuperscript().run();
                      }
                    }
                  }}
                  size="sm"
                  className="border rounded-md"
                >
                  {finalConfig.toolbar?.formatting?.bold && (
                    <ToggleGroupItem value="bold" className="h-8 px-3" title="Gras">
                      <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.formatting?.italic && (
                    <ToggleGroupItem value="italic" className="h-8 px-3" title="Italique">
                      <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.formatting?.underline && (
                    <ToggleGroupItem value="underline" className="h-8 px-3" title="Souligné">
                      <UnderlineIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.formatting?.strikethrough && (
                    <ToggleGroupItem value="strike" className="h-8 px-3" title="Barré">
                      <Strikethrough className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.formatting?.superscript && (
                    <ToggleGroupItem value="superscript" className="h-8 px-3" title="Exposant">
                      <SuperscriptIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>
                {showHighlight && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Highlight */}
            {showHighlight && (
              <>
                <Button
                  type="button"
                  variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
                  className="h-8 px-3"
                  title="Surligner"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
                {showAlignment && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Text Alignment */}
            {showAlignment && (
              <>
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
                  onValueChange={value => {
                    if (value) {
                      editor.chain().focus().setTextAlign(value).run();
                    }
                  }}
                  size="sm"
                  className="border rounded-md"
                >
                  {finalConfig.toolbar?.alignment?.left && (
                    <ToggleGroupItem value="left" className="h-8 px-3" title="Aligner à gauche">
                      <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.alignment?.center && (
                    <ToggleGroupItem value="center" className="h-8 px-3" title="Centrer">
                      <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.alignment?.right && (
                    <ToggleGroupItem value="right" className="h-8 px-3" title="Aligner à droite">
                      <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.alignment?.justify && (
                    <ToggleGroupItem value="justify" className="h-8 px-3" title="Justifier">
                      <AlignJustify className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>
                {showBlocks && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Lists and Quote */}
            {showBlocks && (
              <>
                <ToggleGroup
                  type="multiple"
                  value={[
                    ...(editor.isActive('bulletList') ? ['bulletList'] : []),
                    ...(editor.isActive('orderedList') ? ['orderedList'] : []),
                    ...(editor.isActive('blockquote') ? ['blockquote'] : []),
                  ]}
                  onValueChange={values => {
                    // Handle bullet list
                    if (finalConfig.toolbar?.blocks?.bulletList) {
                      const shouldBeBulletList = values.includes('bulletList');
                      const isBulletList = editor.isActive('bulletList');
                      if (shouldBeBulletList !== isBulletList) {
                        editor.chain().focus().toggleBulletList().run();
                      }
                    }

                    // Handle ordered list
                    if (finalConfig.toolbar?.blocks?.orderedList) {
                      const shouldBeOrderedList = values.includes('orderedList');
                      const isOrderedList = editor.isActive('orderedList');
                      if (shouldBeOrderedList !== isOrderedList) {
                        editor.chain().focus().toggleOrderedList().run();
                      }
                    }

                    // Handle blockquote
                    if (finalConfig.toolbar?.blocks?.blockquote) {
                      const shouldBeBlockquote = values.includes('blockquote');
                      const isBlockquote = editor.isActive('blockquote');
                      if (shouldBeBlockquote !== isBlockquote) {
                        editor.chain().focus().toggleBlockquote().run();
                      }
                    }
                  }}
                  size="sm"
                  className="border rounded-md"
                >
                  {finalConfig.toolbar?.blocks?.bulletList && (
                    <ToggleGroupItem value="bulletList" className="h-8 px-3" title="Liste à puces">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.blocks?.orderedList && (
                    <ToggleGroupItem
                      value="orderedList"
                      className="h-8 px-3"
                      title="Liste numérotée"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                  {finalConfig.toolbar?.blocks?.blockquote && (
                    <ToggleGroupItem value="blockquote" className="h-8 px-3" title="Citation">
                      <Quote className="h-4 w-4" />
                    </ToggleGroupItem>
                  )}
                </ToggleGroup>
                {showLinks && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Link */}
            {showLinks && (
              <>
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLink}
                    className={cn(
                      'h-8 px-3 rounded-r-none border-r',
                      editor.isActive('link') && 'bg-accent text-accent-foreground',
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
                {showFootnotes && <Separator orientation="vertical" className="h-6" />}
              </>
            )}

            {/* Footnote */}
            {showFootnotes && (
              <Button
                type="button"
                variant={editor.isActive('footnote') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.commands.addFootnote()}
                className="h-8 px-3"
                title="Ajouter une note de bas de page"
              >
                <span className="text-sm font-medium">A</span>
                <sup className="text-xs font-bold ml-0.5">1</sup>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative p-4">
        <EditorContent
          editor={editor}
          className={cn(
            finalConfig.singleLine
              ? '[&_.ProseMirror]:min-h-[40px]'
              : '[&_.ProseMirror]:min-h-[150px]',
            headingsClass,
          )}
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
  config?: Partial<RichTextEditorConfig>;
}

export function RichTextViewer({ content, className, config }: RichTextViewerProps) {
  const finalConfig = config || defaultConfig;

  const editor = useEditor({
    extensions: getEditorExtensions(true, finalConfig),
    content: content || '',
    immediatelyRender: false,
    editable: false, // Make it read-only
    editorProps: getEditorProps(true, finalConfig),
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
      <EditorContent editor={editor} className={headingsClass} />
    </div>
  );
}
