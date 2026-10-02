import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";
import FeedbackProvider from "./components/FeedbackProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <FeedbackProvider>
            <AppRoutes />
          </FeedbackProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
