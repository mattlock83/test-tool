import React, { useState } from "react";
import { AutoForm, TextField, ErrorsField, SubmitField } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import Ajv from "ajv";
import schema from "./widgetSchema.json";

// Create a validator using AJV.
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
const validatorFn = makeValidator(schema);
const schemaBridge = new JSONSchemaBridge(schema, validatorFn);

function CreateWidgetModule() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (data) => {
    // Clear previous messages.
    setResponseMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/create-widget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // In this example, we send only the "name" field.
        body: JSON.stringify({ name: data.name })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Expect a JSON response with a "message" key.
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error("Error in CreateWidgetModule:", error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div>
      <h2>Create Widget</h2>
      <AutoForm schema={schemaBridge} onSubmit={handleSubmit}>
        <TextField name="name" />
        <ErrorsField />
        <SubmitField value="Submit" className="btn btn-primary" />
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

export default {
  id: "createWidget",
  label: "Create Widget",
  component: CreateWidgetModule
};
