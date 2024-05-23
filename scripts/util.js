module.exports = { evalYesNo, printTable, updateEnvFile };

const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

/**
 * Updates the .env file with the provided variables.
 * Adds variables that don't exist or are undefined.
 *
 * @param {Object} updates - An object where keys are the variable names and values are the default values.
 * @param {string} envFilePath - Path to the .env file (default is current directory's .env file).
 */
function updateEnvFile(
  updates,
  envFilePath = path.resolve(__dirname, "../", ".env")
) {
  // Load existing .env variables
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

  console.log("envConfig", envConfig);

  // Track changes
  let updated = false;

  // Update the envConfig with missing variables
  for (const [key, value] of Object.entries(updates)) {
    envConfig[key] = value;
    updated = true;
  }

  // If there were changes, write the updated config back to the .env file
  if (updated) {
    const updatedEnvContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    fs.writeFileSync(envFilePath, updatedEnvContent);
    console.log(".env file updated successfully.");
  } else {
    console.log("No changes needed in the .env file.");
  }
}

function evalYesNo(answer) {
  if (!answer) return;
  console.log("answer", answer);
  answer = answer.trim().toLowerCase();

  if (answer === "y" || answer === "yes") return true;
  if (answer === "n" || answer === "no") return false;

  throw Error("Invalid Reponse");
}

function printTable(data) {
  const colWidths = [];

  // Determine the maximum width of each column
  data.forEach((row) => {
    if (Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        const cellLength = String(cell).length;
        if (!colWidths[colIndex] || cellLength > colWidths[colIndex]) {
          colWidths[colIndex] = cellLength;
        }
      });
    }
  });

  // Function to create a separator line
  function createSeparator() {
    return colWidths.map((width) => "-".repeat(width)).join("-");
  }

  // Print the table
  data.forEach((row) => {
    if (row === "separator") {
      console.log(createSeparator());
    } else if (row === "blank") {
      console.log("");
    } else if (Array.isArray(row)) {
      const rowString = row
        .map((cell, colIndex) => {
          const cellString = cell === undefined ? " " : String(cell);
          return cellString.padEnd(colWidths[colIndex], " ");
        })
        .join(" ");
      console.log(rowString);
    } else if (row === undefined) {
    }
  });
}
