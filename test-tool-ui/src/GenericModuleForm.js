import React, { useState } from "react";
import { AutoForm } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, useDefaults: true });

function makeValidator(schema) {
  const validate = ajv.compile(schema);
  return (model) => {
    const valid = validate(model);
    if (!valid) {
      const errors = validate.errors.map(err => ({
        name: err.instancePath || err.dataPath || "field",
        message: err.message
      }));
      throw { details: errors };
    }
  };
}

export default function GenericModuleForm({ config }) {
  const [responseMessage, setResponseMessage] = useState("");
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const validatorFn = makeValidator(config.schema);
  const schemaBridge = new JSONSchemaBridge(config.schema, validatorFn);

  // Remap form data if a requestMapping is provided
  const mapRequestData = (data) => {
    if (config.meta.requestMapping) {
      const mapped = {};
      for (const key in config.meta.requestMapping) {
        mapped[config.meta.requestMapping[key]] = data[key];
      }
      return mapped;
    }
    return data;
  };

  const handleSubmit = async (data) => {
    // Clear previous messages.
    setResponseMessage("");
    setResults(null);
    setErrorMessage("");

    const requestData = mapRequestData(data);

    try {
      const response = await fetch(config.meta.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      // Check if we should render an array of results.
      if (config.meta.responseMapping && config.meta.responseMapping.results) {
        setResults(result[config.meta.responseMapping.results]);
      } else {
        const messageKey =
          (config.meta.responseMapping && config.meta.responseMapping.message) ||
          "message";
        setResponseMessage(result[messageKey]);
      }
    } catch (error) {
      console.error(`Error in module ${config.id}:`, error);
      setErrorMessage("Failed to create");
    }
  };

  // Function to render the results as an HTML table.
  const renderResultsTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) return null;

    // Determine if the first element is an object.
    const isObject = typeof data[0] === "object" && data[0] !== null;
    return (
      <div className="mt-3">
        <h3>Results</h3>
        <table className="table table-striped">
          <thead>
            <tr>
              {isObject ? (
                Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)
              ) : (
                <th>Result</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {isObject ? (
                  Object.keys(item).map((key) => (
                    <td key={key}>{item[key]}</td>
                  ))
                ) : (
                  <td>{item}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h2>{config.label}</h2>
      {/* Do not provide children so that AutoForm auto-generates fields */}
      <AutoForm schema={schemaBridge} onSubmit={handleSubmit} />
      {responseMessage && (
        <div className="alert alert-success mt-3">{responseMessage}</div>
      )}
      {results && Array.isArray(results) && renderResultsTable(results)}
      {errorMessage && (
        <div className="alert alert-danger mt-3">{errorMessage}</div>
      )}
    </div>
  );
}
