"use client";

import ChatBox from "./pages/chatbox";
import SQLEditorPage from "./pages/editor";

import {useState} from 'react';

export default function Home() {
    const [sql, setSql] = useState<string>("");
  
  function onInsertSQL (sqlStaement: string) {
    console.log(sqlStaement)
    setSql(sqlStaement);
  }

  return (
    <div className="flex h-screen">
      {/* LEFT COLUMN */}
      <div className="w-2/3 flex flex-col">
        {/* SQL Editor */}
        <SQLEditorPage sql={sql} setSql={setSql} />

      </div>

      {/* RIGHT COLUMN (CHAT) */}
      <div className="w-1/3 flex flex-col">
        <ChatBox onInsertSQL={onInsertSQL}/>

      </div>
    </div>
  );
}
