import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ApiResponse {
  message: string;
}

function App() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {data && <p>Data: {data.message as string}</p>}
      </div>
    </>
  );
}

export default App;
