import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AutoForm, SubmitField, ErrorsField } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import Ajv from "ajv";
import { modules } from "./modulesConfig";

// Create a generic validator function using AJV.
const ajv = new Ajv({ allErrors: true, useDefaults: true });
function makeValidator(schema) {
  const validate = ajv.compile(schema);
  return (model) => {
    const valid = validate(model);
    if (!valid) {
      const errors = validate.errors.map((err) => ({
        name: err.instancePath || err.dataPath || "field",
        message: err.message
      }));
      throw { details: errors };
    }
  };
}

// A generic form component for a given module.
function ModuleForm({ moduleConfig }) {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Create the JSONSchemaBridge for this module using the generic validator.
  const validatorFn = makeValidator(moduleConfig.schema);
  const schemaBridge = new JSONSchemaBridge(moduleConfig.schema, validatorFn);

  const handleSubmit = async (data) => {
    // Clear previous messages.
    setResponseMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(moduleConfig.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Send the data as JSON.
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Expect a JSON response with a "message" key.
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error(`Error in module ${moduleConfig.id}:`, error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div>
      <h2>{moduleConfig.label}</h2>
      <AutoForm schema={schemaBridge} onSubmit={handleSubmit}>
        {/* Let Uniforms generate the form fields automatically */}
        <SubmitField value="Submit" className="btn btn-primary" />
        <ErrorsField />
      </AutoForm>
      {responseMessage && (
        <div className="alert alert-success mt-3">{responseMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-danger mt-3">{errorMessage}</div>
      )}
    </div>
  );
}

function App() {
  const [activeModuleId, setActiveModuleId] = useState(modules[0].id);

  // Find the active module from the configuration.
  const activeModule = modules.find((mod) => mod.id === activeModuleId);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <ul className="nav flex-column">
            {modules.map((mod) => (
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
            <ModuleForm moduleConfig={activeModule} />
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
