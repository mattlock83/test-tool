import widgetSchema from "./widgetSchema.json";
// You can import additional schemas for other modules similarly

export const modules = [
  {
    id: "createWidget",
    label: "Create Widget",
    schema: widgetSchema,
    endpoint: "/create-widget"
  }
];
