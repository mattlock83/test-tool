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
  const [errorMessage, setErrorMessage] = useState("");

  const validatorFn = makeValidator(config.schema);
  const schemaBridge = new JSONSchemaBridge(config.schema, validatorFn);

  // Remap the data if a requestMapping is provided
  const mapRequestData = (data) => {
    if (config.meta.requestMapping) {
      const mapped = {};
      for (const key in config.meta.requestMapping) {
        // Use the mapping: form key -> endpoint key
        mapped[config.meta.requestMapping[key]] = data[key];
      }
      return mapped;
    }
    return data;
  };

  const handleSubmit = async (data) => {
    setResponseMessage("");
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
      // Determine the key to display from response mapping (default: "message")
      const messageKey =
        (config.meta.responseMapping && config.meta.responseMapping.message) ||
        "message";
      setResponseMessage(result[messageKey]);
    } catch (error) {
      console.error(`Error in module ${config.id}:`, error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div>
      <h2>{config.label}</h2>
      {/* Do not provide children so that AutoForm auto-generates fields */}
      <AutoForm schema={schemaBridge} onSubmit={handleSubmit} />
      {responseMessage && (
        <div className="alert alert-success mt-3">{responseMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-danger mt-3">{errorMessage}</div>
      )}
    </div>
  );
}
