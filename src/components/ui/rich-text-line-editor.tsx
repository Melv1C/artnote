import { Input } from '@/components/ui/input';
import { richTextLinkClass, useEditorValue } from '@/components/ui/rich-text-editor';
import { linkHref } from '@/lib/rich-text-links';
import { cn } from '@/lib/utils';
import Document from '@tiptap/extension-document';
import { PluginKey } from '@tiptap/pm/state';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Check,
  ExternalLink,
  Italic,
  Link as LinkIcon,
  Pencil,
  Unlink,
  X,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface RichTextLineEditorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  /** The field's accessible name, such as "Légende de l’image 1" */
  label: string;
  placeholder?: string;
  className?: string;
}

/**
 * A one-line rich text field, such as an image legend: it looks like an input, and selecting
 * words offers italic, bold and a link in a bubble above them (also Ctrl+I, Ctrl+B, Ctrl+K).
 * The text stays one paragraph: Enter does nothing and pasted line breaks become spaces.
 */
export function RichTextLineEditor({
  value,
  onChange,
  label,
  placeholder,
  className,
}: RichTextLineEditorProps) {
  // The address being typed for a link, or null while the bubble shows the formatting buttons
  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  // The bubble decides to show from editor events, outside React: it reads this ref
  const editingLink = useRef(false);
  const openLinkRef = useRef<() => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        document: false,
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        underline: false,
        trailingNode: false,
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: 'https',
          HTMLAttributes: { class: richTextLinkClass },
        },
      }),
      Document.extend({ content: 'paragraph' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'false',
        class: 'outline-none [&_p]:m-0',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter') return true;
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          openLinkRef.current();
          return true;
        }
        return false;
      },
      transformPastedText: text => text.replace(/\s*[\r\n]+\s*/g, ' '),
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? null : editor.getHTML()),
  });

  useEditorValue(editor, value);

  // The bubble only checks whether to show when the selection or text changes: opening the
  // address for an empty selection, or dropping it, tells it directly
  const [bubbleKey] = useState(() => new PluginKey('richTextLineBubble'));
  const showLinkDraft = (draft: string | null) => {
    editingLink.current = draft !== null;
    setLinkDraft(draft);
    if (editor)
      editor.view.dispatch(editor.state.tr.setMeta(bubbleKey, draft === null ? 'hide' : 'show'));
  };

  useEffect(() => {
    openLinkRef.current = () => {
      if (editor) showLinkDraft(editor.getAttributes('link').href ?? '');
    };
  });

  // Stable references: the bubble registers its plugin again whenever these change
  const bubbleOptions = useMemo(() => ({ placement: 'top' as const, offset: 8 }), []);
  const shouldShow = useCallback(
    ({ editor, from, to }: { editor: Editor; from: number; to: number }) =>
      editingLink.current || (editor.isFocused && (from !== to || editor.isActive('link'))),
    [],
  );

  // A press anywhere but the address bubble or this field drops the draft: the bubble itself
  // only hides on its own editor's events, and would stay open over the form
  const linkDraftRef = useRef<HTMLDivElement>(null);
  const draftOpen = linkDraft !== null;
  useEffect(() => {
    if (!draftOpen || !editor) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (linkDraftRef.current?.contains(target) || editor.view.dom.contains(target)) return;
      editingLink.current = false;
      setLinkDraft(null);
      editor.view.dispatch(editor.state.tr.setMeta(bubbleKey, 'hide'));
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [draftOpen, editor, bubbleKey]);

  if (!editor) {
    return (
      <div className={cn('h-9 w-full animate-pulse rounded-lg border bg-muted/40', className)} />
    );
  }

  const href = editor.getAttributes('link').href as string | undefined;

  const applyLink = () => {
    const target = linkHref(linkDraft ?? '');
    const chain = editor.chain().focus();
    if (!target) {
      chain.extendMarkRange('link').unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: the address itself becomes the link's text
      chain
        .insertContent({
          type: 'text',
          text: (linkDraft ?? '').trim(),
          marks: [{ type: 'link', attrs: { href: target } }],
        })
        // What the writer types next is not part of the link
        .unsetMark('link')
        .run();
    } else {
      chain.extendMarkRange('link').setLink({ href: target }).run();
    }
    showLinkDraft(null);
  };

  const cancelLink = () => {
    showLinkDraft(null);
    editor.commands.focus();
  };

  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <div className="relative rounded-lg border border-input bg-card px-3 py-1.5 text-sm leading-6 shadow-xs transition-[color,box-shadow] dark:bg-input/30 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        <EditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <span className="pointer-events-none absolute top-1.5 left-3 select-none text-muted-foreground">
            {placeholder}
          </span>
        )}
      </div>

      <BubbleMenu
        editor={editor}
        pluginKey={bubbleKey}
        options={bubbleOptions}
        shouldShow={shouldShow}
        role="toolbar"
        aria-label="Mise en forme"
        className="z-50 flex items-center gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
      >
        {linkDraft !== null ? (
          // No <form>: it would submit the notice form around this field
          <div ref={linkDraftRef} className="flex items-center gap-1">
            <Input
              autoFocus
              aria-label="Adresse du lien"
              value={linkDraft}
              onChange={event => setLinkDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyLink();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelLink();
                }
              }}
              placeholder="Coller une adresse…"
              className="h-7 w-60 text-xs md:h-7 md:text-xs"
            />
            <BubbleButton label="Valider le lien" onClick={applyLink}>
              <Check />
            </BubbleButton>
            <BubbleButton label="Annuler" onClick={cancelLink}>
              <X />
            </BubbleButton>
          </div>
        ) : editor.state.selection.empty && href ? (
          <>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-56 items-center gap-1 px-2 text-xs text-primary underline underline-offset-2"
            >
              <span className="truncate">{href}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
            <BubbleButton label="Modifier le lien" onClick={() => showLinkDraft(href)}>
              <Pencil />
            </BubbleButton>
            <BubbleButton
              label="Retirer le lien"
              onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
            >
              <Unlink />
            </BubbleButton>
          </>
        ) : (
          <>
            <BubbleButton
              label="Italique"
              shortcut="Ctrl+I"
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic />
            </BubbleButton>
            <BubbleButton
              label="Gras"
              shortcut="Ctrl+B"
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold />
            </BubbleButton>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <BubbleButton
              label="Lien"
              shortcut="Ctrl+K"
              active={editor.isActive('link')}
              onClick={() => showLinkDraft(href ?? '')}
            >
              <LinkIcon />
            </BubbleButton>
          </>
        )}
      </BubbleMenu>
    </div>
  );
}

function BubbleButton({
  label,
  shortcut,
  active,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active}
      // Keep the editor's selection when the button is pressed
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:h-3.5 [&_svg]:w-3.5',
        active && 'bg-accent text-foreground',
      )}
    >
      {children}
    </button>
  );
}
