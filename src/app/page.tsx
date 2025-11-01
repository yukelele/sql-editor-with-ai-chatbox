import ChatBox from "./pages/chatbox";
import SQLEditorPage from "./pages/editor";



export default function Home() {
  return (
    <div className="flex h-screen">
      {/* LEFT COLUMN */}
      <div className="w-2/3 flex flex-col">
        {/* SQL Editor */}
        <SQLEditorPage />


        {/* Data Table
        <Card className="flex-1 h-[40%] m-4 mt-0">
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">No data yet. Run a query!</div>
            {/* You’ll replace this later with a real data grid */}
          {/* </CardContent>
        </Card> */} 
      </div>

      {/* RIGHT COLUMN (CHAT) */}
      <div className="w-1/3 flex flex-col">
        <ChatBox />

      </div>
    </div>
  );
}
