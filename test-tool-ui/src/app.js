import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AutoForm, TextField, ErrorsField, SubmitField } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import schema from "./widgetSchema.json";

// A simple validator function for the Uniforms form.
function validator(model) {
  const errors = [];
  if (!model.name || model.name.trim() === "") {
    errors.push({ name: "name", message: "Name is required" });
  }
  if (model.name && model.name.length > 100) {
    errors.push({ name: "name", message: "Name must be at most 100 characters" });
  }
  if (errors.length) {
    throw { details: errors };
  }
}

// Create the JSONSchemaBridge using the imported schema.
const schemaBridge = new JSONSchemaBridge(schema, validator);

function App() {
  const [activeView, setActiveView] = useState("home");
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateWidget = async (data) => {
    // Clear previous messages.
    setResponseMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/create-widget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send only the "name" field in the payload.
        body: JSON.stringify({ name: data.name }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Expect a JSON response with a "message" key.
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error("Error creating widget:", error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                className="nav-link btn btn-link"
                onClick={() => setActiveView("createWidget")}
              >
                Create Widget
              </button>
            </li>
          </ul>
        </nav>
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {activeView === "createWidget" ? (
            <div>
              <h2>Create Widget</h2>
              <AutoForm schema={schemaBridge} onSubmit={handleCreateWidget}>
                <TextField name="name" />
                <ErrorsField />
                <SubmitField value="Create" className="btn btn-primary" />
              </AutoForm>
              {/* Render the success message if available */}
              {responseMessage && (
                <div className="alert alert-success mt-3">
                  {responseMessage}
                </div>
              )}
              {/* Render an error message if available */}
              {errorMessage && (
                <div className="alert alert-danger mt-3">
                  {errorMessage}
                </div>
              )}
            </div>
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
