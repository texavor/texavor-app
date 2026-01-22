import HardBreak from "@tiptap/extension-hard-break";

export const CustomHardBreak = HardBreak.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write("<br>");
        },
      },
    };
  },
});
