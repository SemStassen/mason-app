import {
  BubbleMenu,
  EditorContent,
  type UseEditorOptions,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {} from "./dropdown";
import { Icons } from "./icons";
import { Toggle } from "./toggle";

const extensions = [StarterKit];

type RichEditorProps = Omit<UseEditorOptions, "extensions" | "editorProps">;

const RichEditor = ({ ...props }: RichEditorProps) => {
  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class:
          "w-full h-full outline-none focus:ring focus:ring-primary rounded-md p-2",
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
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              pressed={editor.isActive("bold")}
            >
              <Icons.Bold />
            </Toggle>
            <Toggle
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              pressed={editor.isActive("italic")}
            >
              <Icons.Italic />
            </Toggle>
            <Toggle
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              pressed={editor.isActive("strike")}
            >
              <Icons.StrikeThrough />
            </Toggle>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="h-full w-full" />
    </div>
  );
};

export { RichEditor, useEditor };
