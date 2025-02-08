import React, { useState } from "react";
import { AutoForm, AutoFields, ErrorsField, SubmitField } from "uniforms-bootstrap5";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import Ajv from "ajv";
import config from "./module.json";

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
const validatorFn = makeValidator(config.schema);
const schemaBridge = new JSONSchemaBridge(config.schema, validatorFn);

function SignUpModule() {
  const [addressValid, setAddressValid] = useState(false);
  const [addressValidationMessage, setAddressValidationMessage] = useState("");
  const [signupResponse, setSignupResponse] = useState("");
  const [signupError, setSignupError] = useState("");
  
  // We'll capture the AutoForm ref to access the current model
  let formRef = null;

  // Validate the address using a GET request.
  const handleValidateAddress = async () => {
    // Get current form data.
    const data = formRef ? formRef.getModel() : {};
    // Build query parameters from the address fields.
    const queryParams = new URLSearchParams({
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || ""
    }).toString();

    try {
      const response = await fetch(`${config.meta.validateAddressEndpoint}?${queryParams}`, {
        method: "GET"
      });
      if (!response.ok) {
        throw new Error("Address validation failed");
      }
      const result = await response.json();
      // Assume the response returns { valid: true, message: "Address is valid" }
      setAddressValid(result.valid);
      setAddressValidationMessage(result.message);
    } catch (error) {
      console.error("Error validating address:", error);
      setAddressValidationMessage("Address validation error");
      setAddressValid(false);
    }
  };

  // Handle form submission for sign-up.
  const handleSubmit = async (data) => {
    setSignupResponse("");
    setSignupError("");
    // Do not proceed if the address has not been validated.
    if (!addressValid) {
      setSignupError("Please validate your address before signing up.");
      return;
    }
    // Remap data according to requestMapping.
    const requestData = {};
    for (const key in config.meta.requestMapping) {
      requestData[config.meta.requestMapping[key]] = data[key];
    }
    try {
      const response = await fetch(config.meta.signupEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        throw new Error("Sign up failed");
      }
      const result = await response.json();
      setSignupResponse(result[config.meta.responseMapping.message] || "Sign up successful");
    } catch (error) {
      console.error("Error during sign up:", error);
      setSignupError("Failed to sign up");
    }
  };

  return (
    <div>
      <h2>{config.label}</h2>
      <AutoForm
        schema={schemaBridge}
        onSubmit={handleSubmit}
        ref={(ref) => (formRef = ref)}
      >
        <AutoFields />
        <SubmitField value={config.meta.submitLabel || "Sign Up"} className="btn btn-primary" />
        <ErrorsField />
      </AutoForm>
      <div className="mt-3">
        <button
          className="btn btn-secondary"
          onClick={handleValidateAddress}
        >
          {config.meta.validateLabel || "Validate Address"}
        </button>
      </div>
      {addressValidationMessage && (
        <div className={`mt-2 alert ${addressValid ? "alert-success" : "alert-warning"}`}>
          {addressValidationMessage}
        </div>
      )}
      {signupResponse && (
        <div className="alert alert-success mt-3">{signupResponse}</div>
      )}
      {signupError && (
        <div className="alert alert-danger mt-3">{signupError}</div>
      )}
    </div>
  );
}

export default {
  ...config,
  component: () => <SignUpModule />
};
