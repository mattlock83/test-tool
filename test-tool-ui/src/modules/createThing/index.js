import React from "react";
import GenericModuleForm from "../../GenericModuleForm";
import config from "./module.json";

export default {
  ...config,
  component: () => <GenericModuleForm config={config} />
};
