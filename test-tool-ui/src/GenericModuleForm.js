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
      const errors = validate.errors.map((err) => ({
        name: err.instancePath || err.dataPath || "field",
        message: err.message
      }));
      throw { details: errors };
    }
  };
}

/**
 * GenericModuleForm renders an AutoForm that is entirely generated
 * from the module's JSON schema and meta data.
 * 
 * The configuration object (config) is expected to have:
 * - id: unique module id.
 * - label: module display label.
 * - schema: a JSON schema (for form generation).
 * - meta: an object with at least:
 *      - endpoint: the URL to POST the form data.
 *      - (optionally) any other meta data.
 */
export default function GenericModuleForm({ config }) {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validatorFn = makeValidator(config.schema);
  const schemaBridge = new JSONSchemaBridge(config.schema, validatorFn);

  const handleSubmit = async (data) => {
    // Clear previous messages.
    setResponseMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(config.meta.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error(`Error in module ${config.id}:`, error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div>
      <h2>{config.label}</h2>
      {/* 
          Do not supply children to AutoForm. This lets it auto‑generate 
          all input fields based on the JSON schema.
      */}
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
