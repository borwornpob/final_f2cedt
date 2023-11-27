export default function processCSV(csvData) {
  const rows = csvData.split("\n").filter((row) => row.trim().length > 0);
  const testCases = [];

  rows.forEach((row) => {
    const [input, expectedOutput] = row.split(",").map((value) => value.trim());
    testCases.push({ input: input, output: expectedOutput });
  });

  return testCases;
}
