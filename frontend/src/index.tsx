// react
import React from "react";
import ReactDOM from "react-dom";

// redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

// CSS and Application
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
