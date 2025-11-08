import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals } from "./lib/webVitals";

createRoot(document.getElementById("root")!).render(<App />);

// Monitoreo de performance (solo en desarrollo)
if (import.meta.env.DEV) {
  reportWebVitals(console.log);
}
