import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  useEffect(() => {
    fetch("http://localhost:8000/count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: 1 }),
    });
  }, []);

  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen ">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <p className="text-gray-500">This is a test</p>
        <Button onClick={handleClick} className="cursor-pointer">
          Click me
        </Button>
        <p>Count: {count}</p>
      </div>
    </>
  );
}

export default App;
