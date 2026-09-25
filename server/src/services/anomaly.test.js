import { detectAnomaly } from "./anomaly.service.js";

const result = detectAnomaly({
  currentValue: 65,
  baselineValue: 20,
  threshold: 50,
});

console.log("Anomaly Detection Result:");
console.log(result);