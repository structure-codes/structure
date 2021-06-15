import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
type FoldingRangeProvider = monaco.languages.FoldingRangeProvider;

export const customTreeFolding = (model: any): FoldingRangeProvider => ({
  provideFoldingRanges: function (model, context, token) {
    const ranges: any = [];
    
    return ranges;
  }
});
