import { useEffect, useState } from "react";

function App() {
  const [response, setResponse] = useState("Loading...");

  useEffect(() => {
    fetch("https://coal-research-project-management.onrender.com/")
      .then((res) => res.text())
      .then((data) => setResponse(data))
      .catch((err) => setResponse(err.message));
  }, []);

  return (
    <div>
      <h1>Backend Test</h1>
      <p>{response}</p>
    </div>
  );
}

export default App;
