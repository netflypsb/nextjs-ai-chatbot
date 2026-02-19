import { Sandbox } from "@e2b/code-interpreter";
import { tool } from "ai";
import { z } from "zod";

export const executeCode = tool({
  description: `Execute Python code in a secure sandboxed environment (E2B). Use this for:
- Running any Python code safely
- Data analysis and computation
- Creating files: PowerPoint (.pptx), Word (.docx), Excel (.xlsx), PDF documents
- Installing pip packages (use !pip install <package>)
- Processing data, generating charts, performing calculations
- Any code that needs real execution with output

For document generation, use these libraries:
- PowerPoint: python-pptx
- Word: python-docx  
- Excel: openpyxl
- PDF: fpdf2 or reportlab
- Charts: matplotlib, plotly

The sandbox has internet access and can install any pip package.
Returns stdout, stderr, and any generated files as downloadable URLs.`,
  inputSchema: z.object({
    code: z.string().describe("Python code to execute"),
    installPackages: z
      .array(z.string())
      .optional()
      .describe(
        "Pip packages to install before execution (e.g. ['python-pptx', 'openpyxl'])"
      ),
  }),
  execute: async ({ code, installPackages }) => {
    let sandbox: Sandbox | null = null;
    try {
      sandbox = await Sandbox.create({
        apiKey: process.env.E2B_API_KEY,
      });

      // Install requested packages
      if (installPackages && installPackages.length > 0) {
        const pipCmd = `!pip install ${installPackages.join(" ")} -q`;
        await sandbox.runCode(pipCmd);
      }

      // Execute the code
      const execution = await sandbox.runCode(code);

      // Collect results
      const stdout = execution.logs.stdout.join("\n");
      const stderr = execution.logs.stderr.join("\n");

      // Check for generated files by looking at results
      const files: { name: string; url: string; mimeType: string }[] = [];

      // Check if code wrote files - list them
      const fileCheck = await sandbox.runCode(`
import os
output_files = []
for f in os.listdir('/home/user'):
    if f.endswith(('.pptx', '.docx', '.xlsx', '.pdf', '.png', '.jpg', '.csv', '.json', '.html', '.txt', '.zip')):
        size = os.path.getsize(f'/home/user/{f}')
        output_files.append(f'{f}|{size}')
print('\\n'.join(output_files))
`);

      const fileList = fileCheck.logs.stdout.join("\n").trim();
      if (fileList) {
        for (const line of fileList.split("\n")) {
          const [name] = line.split("|");
          if (name) {
            try {
              const fileContent = await sandbox.files.read(
                `/home/user/${name}`
              );
              // Convert to base64 data URL
              const base64 =
                typeof fileContent === "string"
                  ? Buffer.from(fileContent).toString("base64")
                  : Buffer.from(fileContent).toString("base64");

              const mimeType = getMimeType(name);
              files.push({
                name,
                url: `data:${mimeType};base64,${base64}`,
                mimeType,
              });
            } catch (_readError) {
              files.push({
                name,
                url: "",
                mimeType: "application/octet-stream",
              });
            }
          }
        }
      }

      // Collect chart/image results from execution
      const charts: string[] = [];
      for (const result of execution.results) {
        if (result.png) {
          charts.push(`data:image/png;base64,${result.png}`);
        }
      }

      // Create download-friendly file info using API endpoint
      const fileDownloads = files.map((file) => {
        if (file.url.startsWith("data:")) {
          // Extract just the base64 part
          const base64Data = file.url.split(",")[1] || "";
          return {
            name: file.name,
            mimeType: file.mimeType,
            base64Data,
            downloadUrl: "/api/download", // Use our download API
          };
        }
        return file;
      });

      return {
        stdout: stdout.slice(0, 10_000),
        stderr: stderr.slice(0, 5000),
        error: execution.error ? execution.error.value : null,
        files: fileDownloads,
        charts,
        success: !execution.error,
      };
    } catch (error) {
      return {
        stdout: "",
        stderr: "",
        error: `Sandbox execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        files: [],
        charts: [],
        success: false,
      };
    } finally {
      if (sandbox) {
        await sandbox.kill().catch(() => {
          // ignore kill errors
        });
      }
    }
  },
});

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    csv: "text/csv",
    json: "application/json",
    html: "text/html",
    txt: "text/plain",
    zip: "application/zip",
  };
  return mimeMap[ext || ""] || "application/octet-stream";
}
