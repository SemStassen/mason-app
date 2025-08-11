import {
  BubbleMenu,
  EditorContent,
  type UseEditorOptions,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Icons } from './icons';
import { Toggle } from './toggle';

const extensions = [StarterKit];

type RichEditorProps = Omit<UseEditorOptions, 'extensions' | 'editorProps'>;

const RichEditor = ({ ...props }: RichEditorProps) => {
  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class:
          'w-full h-full outline-none focus:ring focus:ring-primary rounded-md p-2',
      },
    },
    ...props,
  });

  return (
    <div className="h-full w-full">
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="rounded-lg bg-popover p-1.5">
            <Toggle
              onClick={() => editor.chain().focus().toggleBold().run()}
              pressed={editor.isActive('bold')}
              size="sm"
              variant="outline"
            >
              <Icons.Bold />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleItalic().run()}
              pressed={editor.isActive('italic')}
              size="sm"
              variant="outline"
            >
              <Icons.Italic />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleStrike().run()}
              pressed={editor.isActive('strike')}
              size="sm"
              variant="outline"
            >
              <Icons.StrikeThrough />
            </Toggle>
          </div>
        </BubbleMenu>
      )}
      <EditorContent className="h-full w-full" editor={editor} />
    </div>
  );
};

export { RichEditor };
export { useEditor } from '@tiptap/react';
