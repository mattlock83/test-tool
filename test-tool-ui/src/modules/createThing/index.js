import React, { useState } from "react";
import { AutoForm, TextField, ErrorsField, SubmitField } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import Ajv from "ajv";
import schema from "./thingSchema.json";

// Create a validator using AJV.
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
const validatorFn = makeValidator(schema);
const schemaBridge = new JSONSchemaBridge(schema, validatorFn);

function CreateThingModule() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (data) => {
    setResponseMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/create-thing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Send both fields as provided by the form.
        body: JSON.stringify({ firstname: data.firstname, phone: data.phone })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error("Error in CreateThingModule:", error);
      setErrorMessage("Failed to create");
    }
  };

  return (
    <div>
      <h2>Create Thing</h2>
      <AutoForm schema={schemaBridge} onSubmit={handleSubmit}>
        <TextField name="firstname" />
        <TextField name="phone" />
        <ErrorsField />
        <SubmitField value="Submit" className="btn btn-primary" />
      </AutoForm>
      {responseMessage && <div className="alert alert-success mt-3">{responseMessage}</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
    </div>
  );
}

export default {
  id: "createThing",
  label: "Create Thing",
  component: CreateThingModule
};
