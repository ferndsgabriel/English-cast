import RouterApp from "./router";
import "./styles/globals.css";
import AuthProvider from "./contexts/AuthContexts";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import AudioProvider from "./contexts/AudioContexts";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioProvider>
          <RouterApp/>
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
