"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { DataTable } from "@/src/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SQLEditorPageProps {
    sql: string;
    setSql: (sql: string) => void
}

export default function SQLEditorPage({sql, setSql}: SQLEditorPageProps) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<ColumnDef<Record<string,any>>[]>([]);

  return (
    <div style={{justifyItems: "center"}}>
        <div style={{ height: "60vh", width: "95%", border: "1px solid black", padding: '1%' }}>
            <MonacoEditor
                height="100%"
                width="100%"
                defaultLanguage="sql"
                value={sql}
                onChange={(value) => setSql(value || "")}
                options={{
                automaticLayout: true,
                fontSize: 14,
                }}
            />

        </div>
        <div>
            <Button onClick={async () => {
                const res = await fetch("/api/run-query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: sql }),
                });
                    const data = await res.json();
                    
                    console.log('sql output: ', data);

                    if (data && data.result && data.result.length > 0) {
                        console.log(data);
                        


                        const colKeys = Object.keys(data.result[0]);
                        const generatedCols: ColumnDef<Record<string, any>>[] = colKeys.map((key) => ({
                            accessorKey: key,
                            header: key
                        }));
                        setColumns(generatedCols);


                        setData(data.result);

                        
                    }
                }}>
                Run
            </Button>
        </div>
        <div>
            <DataTable columns={columns} data={data} />
        </div>
    </div>
    
  );
}
