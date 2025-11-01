"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "../../components/ui/button";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function SQLEditorPage() {
  const [sql, setSql] = useState("SELECT * FROM \"Food\";");
  const [data, setData] = useState([]);

  return (
    <div style={{justifyItems: "center"}}>
                {/* <Card className="flex-1 h-[60%] m-4">
                  <CardHeader>
                    <CardTitle>SQL Editor</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <div className="border rounded-md h-full">
                      <MonacoEditor
                        height="100%"
                        defaultLanguage="sql"
                        theme="vs-dark"
                        value={sql}
                        onChange={(val) => setSql(val || "")}
                      />
                    </div>
                  </CardContent>
                </Card> */}
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

                    if (data && data.result) {
                        setData(data.result);
                    }
                }}>
                Run
            </Button>
        </div>
        <div>
            {data && (
            <table>
                <thead>
                    <tr>
                        {Object.keys(data[0] || {}).map((col) => (
                        <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any, i: number) => (
                        <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                            <td key={j}>{val}</td>
                        ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
        </div>
    </div>
    
  );
}
