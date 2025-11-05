"use client";

import ChatBox from "./components/chatbox";
import SQLEditorPage from "./components/editor";
import {useState} from 'react';

export default function Home() {
  const [sql, setSql] = useState<string>("");
  
  function handleInsertSQL (sqlStaement: string) {
    setSql(sqlStaement);
  }

  return (
    <div className="flex h-screen">
      {/* LEFT COLUMN */}
      <div className="w-2/3 flex flex-col">
        <SQLEditorPage sql={sql} setSql={setSql} />
      </div>

      {/* RIGHT COLUMN (CHAT) */}
      <div className="w-1/3 flex flex-col">
        <ChatBox handleInsertSQL={handleInsertSQL}/>
      </div>
    </div>
  );
}
