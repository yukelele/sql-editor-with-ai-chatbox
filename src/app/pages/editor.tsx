"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { DataTable } from "@/src/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";

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

    // Register the autocomplete provider
    const provider = monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", ".", ";", "\n"],
      provideCompletionItems: async (model: any, position: any) => {
        const textUntilCursor = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        try {
          const res = await fetch("/api/sql-autocomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textUntilCursor }),
          });

          const statementSuggestions = await res.json();
          console.log('suggestion ------ :', statementSuggestions);

          const suggestions = statementSuggestions.suggestions.map((stmt: string) => ({
                label: stmt.slice(0, 60) + (stmt.length > 60 ? "..." : ""), // short label for dropdown
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: stmt,
                documentation: {
                    value: "```sql\n" + stmt + "\n```",
                    isTrusted: true,
                },
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                },
                }));


          return { suggestions };
        } catch (err) {
          console.error("Autocomplete error:", err);
          return { suggestions: [] };
        }
      },
    });

    providerRef.current = provider;

    return () => {
      // cleanup when editor unmounts or reinitializes
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

      if (result?.result?.length) {
        const colKeys = Object.keys(result.result[0]);
        setColumns(colKeys.map((key) => ({ accessorKey: key, header: key })));
        setData(result.result);
      } else {
        setColumns([]);
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
        <div style={{ height: "60vh", width: "95%", border: "1px solid black", padding: '1%' }}>
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
                }}
            />
        </div>
        <div>
            <Button onClick={runQuery} disabled={loading}>
                {loading ? "Running..." : "Run"}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
        <div style={{ width: "95%" }}>
            <DataTable columns={columns} data={data} />
        </div>
    </div>
    
  );
}
