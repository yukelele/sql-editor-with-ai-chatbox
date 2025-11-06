"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/src/app/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { InfoIcon } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SQLEditorPageProps {
    sql: string;
    setSql: (sql: string) => void
}

export default function SQLEditorPage({sql, setSql}: SQLEditorPageProps) {
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<ColumnDef<Record<string,any>>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);
    const providerRef = useRef<any>(null); // track provider to clean up

// ✅ Initialize autocomplete provider
useEffect(() => {
  if (!editorRef.current || !(window as any).monaco) return;
  const monaco = (window as any).monaco;

  // Prevent duplicate registrations
  if (providerRef.current) {
    providerRef.current.dispose();
    providerRef.current = null;
  }

  const provider = monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", ".", ";", "\n", "=", ",", "(", ")"],

    provideCompletionItems: async (model: any, position: any) => {
      try {
        const fullText = model.getValue();
        const cursorOffset = model.getOffsetAt(position);
        const word = model.getWordUntilPosition(position);

        // Call the API
        const res = await fetch("/api/sql-autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText, cursor: cursorOffset }),
        });

        const data = await res.json();

        console.log('DATA', data);

        // If API returned invalid or empty suggestions, return no suggestions
        if (!data || !Array.isArray(data.suggestions) || data.suggestions.length === 0) {
          return { suggestions: [] };
        }

        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn || position.column,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn || position.column
        };

        const suggestions = data.suggestions.map((s: {text: string, type: string}) => {
          const label = s.text;
          const kind = s.type;

          return {
            label: label, 
            kind: monaco.languages.CompletionItemKind[kind],
            insertText: label,
            documentation: { value: "```sql\n" + label + "\n```", isTrusted: true },
            range
          }
        });

        return { suggestions };
      } catch (err) {
        console.error("Autocomplete error:", err);
        return { suggestions: [] };
      }
    },
  });

  providerRef.current = provider;

  return () => {
    if (providerRef.current) {
      providerRef.current.dispose();
      providerRef.current = null;
    }
  };
}, [editorRef.current]);



  const runQuery = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/run-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql }),
      });
      const result = await res.json();

      if (result?.error) {
        throw Error;
      }

      if (result?.result?.length) {
        const colKeys = Object.keys(result.result[0]);
        setColumns(colKeys.map((key) => ({ accessorKey: key, header: key })));
        setData(result.result);
      } else {
        setColumns([]);
        setData([]);
      }
    } catch (err: any) {
      setError("Server Error or Invalid Query: Unable to provide data.\nAsk in the AI chatbox \"what is wrong with this query: **copy&paste sql**\"");
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-screen">
        <div style={{
            flex: "0 0 40vh", // fixed height for editor section
            width: "95%",
            border: "1px solid black",
            padding: "1%",
        }}>
            <MonacoEditor
                height="100%"
                width="100%"
                defaultLanguage="sql"
                value={sql}
                onChange={(value) => setSql(value || "")}
                onMount={(editor) => {
                    editorRef.current = editor;

                    // re-trigger autocomplete after mount
                    editor.onDidChangeModelContent(() => {
                        editor.trigger("keyboard", "editor.action.triggerSuggest", {});
                    });
                }}
                options={{
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: { other: true, comments: false, strings: false },
                }}
            />
        </div>
        <div className="flex flex-col items-center">
          <div>
            <Button onClick={runQuery} disabled={loading}>
              {loading ? 
              <div className="flex items-center gap-2"><Spinner />{"Running..."}</div> : 
              "Run"}
            </Button>
            <Tooltip>
              <TooltipTrigger>
                  <InfoIcon />
              </TooltipTrigger>
              <TooltipContent style={{background: 'gray', color: 'white', padding: '5px', borderRadius: '10px'}}>
                {"Only 1 SQL query can be run in the editor."}
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
        <div className="w-[95%] overflow-auto" style={{ width: "95%", flex: "1 1 auto", minHeight: 0 }}>
          {loading ? 
                    <div className="flex items-center gap-2"><Spinner />{"Running..."}</div> : 
                    <DataTable columns={columns} data={data} />}
        </div>
    </div>
    
  );
}
