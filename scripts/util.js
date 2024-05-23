module.exports = { printTable };

function printTable(data) {
  const breakIndexes = [];

  const colWidths = [];

  // Determine the maximum width of each column
  data.forEach((row, idx) => {
    if (row === null) breakIndexes.push(idx);
    else if (row !== undefined)
      row.forEach((cell, colIndex) => {
        const cellLength = String(cell).length;
        if (!colWidths[colIndex] || cellLength > colWidths[colIndex]) {
          colWidths[colIndex] = cellLength;
        }
      });
  });

  // Function to create a separator line
  function createSeparator() {
    return colWidths.map((width) => "-".repeat(width)).join(" ");
  }

  // Print the table
  data.forEach((row, rowIndex) => {
    // Check if this row index needs a separator
    if (breakIndexes.includes(rowIndex)) {
      console.log(createSeparator());
    }
    // Print the row
    const rowString = row
      .map((cell, colIndex) => {
        const cellString = String(cell);
        return cellString.padEnd(colWidths[colIndex], " ");
      })
      .join(" ");
    console.log(rowString);
  });
}
