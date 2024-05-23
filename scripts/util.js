module.exports = { evalYesNo, printTable };

function evalYesNo(answer) {
  if (!answer) return;
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
