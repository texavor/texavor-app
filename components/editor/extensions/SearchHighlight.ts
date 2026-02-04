import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface SearchHighlightOptions {
  highlightClass: string;
}

export const SearchHighlight = Extension.create<SearchHighlightOptions>({
  name: "searchHighlight",

  addOptions() {
    return {
      highlightClass: "search-result-highlight",
    };
  },

  addProseMirrorPlugins() {
    const { highlightClass } = this.options;

    return [
      new Plugin({
        key: new PluginKey("searchHighlight"),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, old) {
            const meta = tr.getMeta("searchHighlight");
            if (meta) {
              if (meta.clear) return DecorationSet.empty;
              if (meta.from !== undefined && meta.to !== undefined) {
                return DecorationSet.create(tr.doc, [
                  Decoration.inline(meta.from, meta.to, {
                    class: highlightClass,
                    style:
                      "background-color: #fef08a !important; color: black !important;", // Tailwind yellow-200, forced
                  }),
                ]);
              }
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
