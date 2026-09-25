export const detectAnomaly = ({
  currentValue,
  baselineValue,
  threshold = 50,
}) => {
  if (
    typeof currentValue !== "number" ||
    typeof baselineValue !== "number"
  ) {
    throw new Error(
      "currentValue and baselineValue must be numbers"
    );
  }

  if (baselineValue <= 0) {
    throw new Error("baselineValue must be greater than 0");
  }

  const percentageChange =
    ((currentValue - baselineValue) / baselineValue) * 100;

  const isAnomaly = percentageChange >= threshold;

  let anomalyLevel = "normal";

  if (percentageChange >= 200) {
    anomalyLevel = "high";
  } else if (percentageChange >= 100) {
    anomalyLevel = "medium";
  } else if (percentageChange >= threshold) {
    anomalyLevel = "low";
  }

  return {
    currentValue,
    baselineValue,
    percentageChange: Number(percentageChange.toFixed(2)),
    threshold,
    isAnomaly,
    anomalyLevel,
  };
};