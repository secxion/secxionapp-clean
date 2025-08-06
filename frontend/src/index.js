import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./app.css";
import './styles/sidepanel-utils.css';
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SoundProvider } from './Context/SoundContext';
import { DarkModeProvider } from './Context/DarkModeContext';
import { EthProvider } from "./Context/EthContext";
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
        <EthProvider>
    <SoundProvider>
          <DarkModeProvider>
    <PersistGate loading={<div>Loading app...</div>} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
      </QueryClientProvider>
    </PersistGate>
    </DarkModeProvider>
    </SoundProvider>
    </EthProvider>
  </Provider>
);

reportWebVitals();