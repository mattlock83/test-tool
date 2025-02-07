import React, { useState } from "react";
import ReactDOM from "react-dom";

// Auto‑load all modules (each module should export an object with id, label, and component)
const modulesContext = require.context("./modules", true, /index\.js$/);
const modules = modulesContext.keys().map(key => modulesContext(key).default);

function App() {
  // Default active module is the first one (if any)
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id || "");
  const activeModule = modules.find(mod => mod.id === activeModuleId);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <ul className="nav flex-column">
            {modules.map(mod => (
              <li key={mod.id} className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeModuleId === mod.id ? "active" : ""}`}
                  onClick={() => setActiveModuleId(mod.id)}
                >
                  {mod.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {activeModule ? (
            <activeModule.component />
          ) : (
            <div>
              <h2>Welcome</h2>
              <p>Select an option from the sidebar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
