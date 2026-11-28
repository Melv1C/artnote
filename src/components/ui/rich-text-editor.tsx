import './rich-text-editor.css';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { linkHref, shortenAddressLinks } from '@/lib/rich-text-links';
import { cn } from '@/lib/utils';
import Document from '@tiptap/extension-document';
import { Highlight } from '@tiptap/extension-highlight';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { type AnyExtension, type Editor, EditorContent, useEditor } from '@tiptap/react';
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
import { Fragment, type ReactNode, useEffect } from 'react';
import { Footnote, FootnoteReference, Footnotes } from 'tiptap-footnotes';

/**
 * The formatting a rich text field keeps. Every editor loads all of it, so saving never drops
 * formatting a stored text already has; `features` only chooses the toolbar's buttons. Undo and
 * redo are always there.
 */
const ALL_FEATURES = [
  'headings',
  'bold',
  'italic',
  'underline',
  'strike',
  'superscript',
  'highlight',
  'alignment',
  'lists',
  'blockquote',
  'link',
  'footnotes',
] as const;

type RichTextFeature = (typeof ALL_FEATURES)[number];

export const editorPresets = {
  /** References and links: no headings, footnotes or layout */
  bibliography: ['bold', 'italic', 'strike', 'lists', 'link'],
  /** An artist's life and work: emphasis, lists and links */
  biography: ['bold', 'italic', 'lists', 'link'],
} as const satisfies Record<string, readonly RichTextFeature[]>;

// Tiptap gives every heading level the same class, so the levels are styled from their container
const headingsClass =
  '[&_:is(h1,h2,h3)]:font-bold [&_:is(h1,h2,h3)]:leading-tight [&_h1]:text-2xl [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2';

export const richTextLinkClass =
  'text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50';

function editorExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      // tiptap-footnotes needs a document that ends with the footnotes, added below
      document: false,
      heading: { levels: [1, 2, 3] },
      underline: { HTMLAttributes: { class: 'underline decoration-2' } },
      bulletList: { HTMLAttributes: { class: 'list-disc pl-6 space-y-1' } },
      orderedList: { HTMLAttributes: { class: 'list-decimal pl-6 space-y-1' } },
      listItem: { HTMLAttributes: { class: 'leading-relaxed' } },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground my-4',
        },
      },
      paragraph: { HTMLAttributes: { class: 'leading-relaxed' } },
      link: { HTMLAttributes: { class: richTextLinkClass } },
    }),
    Superscript.configure({ HTMLAttributes: { class: 'text-xs align-super' } }),
    Highlight.configure({
      HTMLAttributes: { class: 'bg-yellow-200 text-inherit dark:bg-yellow-900/50 rounded px-1' },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Document.extend({ content: 'block+ footnotes?' }),
    Footnotes,
    Footnote,
    FootnoteReference,
  ];
}

/**
 * Shows a value set from outside the editor, such as a form being reset, without reporting it back
 * as an edit: the editor's HTML can differ from a stored value that means the same.
 */
export function useEditorValue(editor: Editor | null, value: string | null) {
  useEffect(() => {
    // An empty editor holds `<p></p>`, which an empty value already means
    if (!editor || (editor.isEmpty && !value) || value === editor.getHTML()) return;
    editor.commands.setContent(value ?? '', { emitUpdate: false });
  }, [editor, value]);
}

interface ToggleButton {
  feature: RichTextFeature;
  name: string;
  title: string;
  icon: ReactNode;
  toggle: (editor: Editor) => void;
}

const MARK_BUTTONS: ToggleButton[] = [
  {
    feature: 'bold',
    name: 'bold',
    title: 'Gras',
    icon: <Bold />,
    toggle: editor => editor.chain().focus().toggleBold().run(),
  },
  {
    feature: 'italic',
    name: 'italic',
    title: 'Italique',
    icon: <Italic />,
    toggle: editor => editor.chain().focus().toggleItalic().run(),
  },
  {
    feature: 'underline',
    name: 'underline',
    title: 'Souligné',
    icon: <UnderlineIcon />,
    toggle: editor => editor.chain().focus().toggleUnderline().run(),
  },
  {
    feature: 'strike',
    name: 'strike',
    title: 'Barré',
    icon: <Strikethrough />,
    toggle: editor => editor.chain().focus().toggleStrike().run(),
  },
  {
    feature: 'superscript',
    name: 'superscript',
    title: 'Exposant',
    icon: <SuperscriptIcon />,
    toggle: editor => editor.chain().focus().toggleSuperscript().run(),
  },
];

const BLOCK_BUTTONS: ToggleButton[] = [
  {
    feature: 'lists',
    name: 'bulletList',
    title: 'Liste à puces',
    icon: <List />,
    toggle: editor => editor.chain().focus().toggleBulletList().run(),
  },
  {
    feature: 'lists',
    name: 'orderedList',
    title: 'Liste numérotée',
    icon: <ListOrdered />,
    toggle: editor => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    feature: 'blockquote',
    name: 'blockquote',
    title: 'Citation',
    icon: <Quote />,
    toggle: editor => editor.chain().focus().toggleBlockquote().run(),
  },
];

const ALIGNMENTS = [
  { value: 'left', title: 'Aligner à gauche', icon: <AlignLeft /> },
  { value: 'center', title: 'Centrer', icon: <AlignCenter /> },
  { value: 'right', title: 'Aligner à droite', icon: <AlignRight /> },
  { value: 'justify', title: 'Justifier', icon: <AlignJustify /> },
];

function ToggleButtons({ editor, buttons }: { editor: Editor; buttons: ToggleButton[] }) {
  const active = buttons.filter(button => editor.isActive(button.name)).map(({ name }) => name);
  return (
    <ToggleGroup
      type="multiple"
      value={active}
      onValueChange={values => {
        const pressed = buttons.find(({ name }) => values.includes(name) !== active.includes(name));
        pressed?.toggle(editor);
      }}
      size="sm"
      className="border rounded-md"
    >
      {buttons.map(({ name, title, icon }) => (
        <ToggleGroupItem key={name} value={name} className="h-8 px-3" title={title}>
          {icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Toolbar({ editor, features }: { editor: Editor; features: readonly RichTextFeature[] }) {
  const has = (feature: RichTextFeature) => features.includes(feature);
  const marks = MARK_BUTTONS.filter(({ feature }) => has(feature));
  const blocks = BLOCK_BUTTONS.filter(({ feature }) => has(feature));

  const addLink = () => {
    const href = linkHref(window.prompt('URL du lien:') ?? '');
    if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const groups = [
    <div key="history" className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0"
        title="Annuler"
      >
        <Undo />
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
        <Redo />
      </Button>
    </div>,
    has('headings') && (
      <ToggleGroup
        key="headings"
        type="single"
        value={
          ([1, 2, 3] as const).find(level => editor.isActive('heading', { level }))?.toString() ??
          'p'
        }
        onValueChange={value => {
          if (value === 'p') editor.chain().focus().setParagraph().run();
          else if (value === '1' || value === '2' || value === '3')
            editor
              .chain()
              .focus()
              .setHeading({ level: Number(value) as 1 | 2 | 3 })
              .run();
        }}
        size="sm"
        className="border rounded-md"
      >
        <ToggleGroupItem value="p" className="h-8 px-3" title="Paragraphe">
          <Type />
        </ToggleGroupItem>
        <ToggleGroupItem value="1" className="h-8 px-3 font-bold text-base" title="Titre 1">
          <Heading1 className="size-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="2" className="h-8 px-3 font-bold" title="Titre 2">
          <Heading2 className="size-[18px]" />
        </ToggleGroupItem>
        <ToggleGroupItem value="3" className="h-8 px-3 font-semibold" title="Titre 3">
          <Heading3 />
        </ToggleGroupItem>
      </ToggleGroup>
    ),
    marks.length > 0 && <ToggleButtons key="marks" editor={editor} buttons={marks} />,
    has('highlight') && (
      <Button
        key="highlight"
        type="button"
        variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className="h-8 px-3"
        title="Surligner"
      >
        <Highlighter />
      </Button>
    ),
    has('alignment') && (
      <ToggleGroup
        key="alignment"
        type="single"
        value={
          ALIGNMENTS.find(({ value }) => editor.isActive({ textAlign: value }))?.value ?? 'left'
        }
        onValueChange={value => {
          if (value) editor.chain().focus().setTextAlign(value).run();
        }}
        size="sm"
        className="border rounded-md"
      >
        {ALIGNMENTS.map(({ value, title, icon }) => (
          <ToggleGroupItem key={value} value={value} className="h-8 px-3" title={title}>
            {icon}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ),
    blocks.length > 0 && <ToggleButtons key="blocks" editor={editor} buttons={blocks} />,
    has('link') && (
      <div key="link" className="flex items-center border rounded-md">
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
          <LinkIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          className="h-8 px-3 rounded-l-none"
          title="Supprimer le lien"
        >
          <Unlink />
        </Button>
      </div>
    ),
    has('footnotes') && (
      <Button
        key="footnotes"
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
    ),
  ].filter(Boolean);

  return (
    <div className="border-b p-2">
      <div className="flex items-center gap-2 flex-wrap">
        {groups.map((group, index) => (
          <Fragment key={index}>
            {index > 0 && <Separator orientation="vertical" className="h-6" />}
            {group}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

interface RichTextEditorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  /** The field's accessible name, such as its form label */
  label: string;
  className?: string;
  placeholder?: string;
  features?: readonly RichTextFeature[];
}

export function RichTextEditor({
  value,
  onChange,
  label,
  className,
  placeholder = 'Commencez à écrire…',
  features = ALL_FEATURES,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions(),
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? null : editor.getHTML()),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'true',
        class: 'min-h-[150px] focus:outline-none',
      },
    },
  });
  useEditorValue(editor, value);

  if (!editor) {
    return (
      <div className={cn('border rounded-lg animate-pulse min-h-[200px]', className)}>
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

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <Toolbar editor={editor} features={features} />
      <div className="relative p-4">
        <EditorContent editor={editor} className={headingsClass} />
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

export function RichTextViewer({
  content,
  className,
}: {
  content: string | null;
  className?: string;
}) {
  const html = content ? shortenAddressLinks(content) : '';
  const editor = useEditor({
    extensions: editorExtensions(),
    content: html,
    immediatelyRender: false,
    editable: false,
  });
  useEditorValue(editor, html);

  if (!html.trim() || html === '<p></p>') return null;

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

  return (
    <div className={cn('wrap-anywhere', className)}>
      <EditorContent editor={editor} className={headingsClass} />
    </div>
  );
}
