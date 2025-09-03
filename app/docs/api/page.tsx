"use client";

import Link from 'next/link';

// Reusable component for placeholders
const ApiDocPlaceholder = ({ placeholder, instruction, type = 'CODE' }: { placeholder: string; instruction: string; type?: 'IMAGE' | 'CODE' }) => (
  <div className="my-6 p-4 rounded-lg bg-muted border border-border overflow-hidden">
    {type === 'IMAGE' && (
      <pre className="text-sm text-muted-foreground bg-transparent p-0">
        <code>{`<!-- ${placeholder} -->`}</code>
      </pre>
    )}
    {type === 'CODE' && (
      <pre className="text-sm text-primary/90 bg-transparent p-0 overflow-x-auto whitespace-pre-wrap break-words">
        <code>{`// ${placeholder}`}</code>
      </pre>
    )}
    <p className="mt-3 text-xs text-accent-foreground/80"><em><strong>Instruction:</strong> {instruction}</em></p>
  </div>
);

export default function ApiReferencePage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">API Reference</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Integrate DocuMate's intelligent document processing directly into your applications and workflows using our straightforward REST API. Automate data extraction programmatically based on your pre-configured endpoints and templates.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Getting Started: API Endpoints & Keys</h2>
      <p className="text-muted-foreground mb-4">
        API access is managed through specific **Endpoints** that you create and configure. Each endpoint has its own unique URL, a linked Template, and an associated API Key for authentication.
      </p>
      <p className="text-muted-foreground mb-4">
        You can create, manage, and configure your API endpoints and keys entirely within the DocuMate application:
      </p>
      <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
        <li>Log in to your DocuMate account.</li>
        <li>Navigate to the <Link href="/playground/api" className="text-primary hover:underline">Playground</Link> and select the 'API' section.</li>
        <li>Click **"Add New API"**.</li>
        <li>Give your API endpoint a descriptive name (e.g., "Invoice Processing API").</li>
        <li>Select the <Link href="/docs/templates" className="text-primary hover:underline">Template</Link> that defines the data structure you want to extract for this endpoint.</li>
        <li>Click **"Create API"**. An endpoint URL (e.g., `/api/analyze/your_unique_endpoint_id`) and a unique API Key will be generated.</li>
        <li>Configure settings like Rate Limiting as needed for the endpoint.</li>
        <li><strong>Important:</strong> Copy the generated API key immediately and store it securely. It is required for authentication.</li>
      </ol>
      <ApiDocPlaceholder
        placeholder="IMAGE_PLACEHOLDER_API_ENDPOINT_CREATION"
        instruction="Replace this comment with an <img> tag showing the API creation/configuration section in the Playground/API page, highlighting name, template selection, generated URL, and key."
        type="IMAGE"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Authentication</h2>
      <p className="text-muted-foreground mb-4">
        Authenticate your API requests by including the unique API Key associated with your endpoint in the `Authorization` header using the Bearer token scheme.
      </p>
      <ApiDocPlaceholder
        placeholder={`Authorization: Bearer YOUR_ENDPOINT_API_KEY`}
        instruction="Show this header format clearly. Replace YOUR_ENDPOINT_API_KEY with a placeholder."
        type="CODE"
      />
      <p className="text-muted-foreground mb-6">
        Requests made without a valid API key for the specific endpoint ID, or with an incorrect key, will result in an authentication error (e.g., `401 Unauthorized`).
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Core Endpoint: Process Document</h2>
      <p className="text-muted-foreground mb-4">
        This endpoint allows you to submit a document (as base64 data) to a specific, pre-configured API endpoint for processing using its linked template.
      </p>
      <div className="p-3 rounded bg-muted border border-border mb-4">
        <code className="font-mono"><span className="font-bold text-green-500">POST</span> /api/analyze/{'{endpointId}'}</code>
      </div>
      <p className="text-muted-foreground mb-4">
        Replace endpointId with the actual ID of the endpoint you created in the Playground. The endpoint expects a **JSON request body**.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Request Body (`application/json`)</h3>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li>
          <strong>`fileData`</strong> (Required, String): The document content encoded as a base64 data URI string. The API uses the prefix (e.g., `data:application/pdf;base64,...`, `data:image/jpeg;base64,...`) to understand the file type.
        </li>
      </ul>
      <p className="text-muted-foreground mb-4">
        Note: The `templateId` is **not** sent in the request body. The template used is determined in the URL path, which is linked to a specific template during endpoint configuration in the Playground.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Example Request (cURL)</h3>
      <ApiDocPlaceholder
        placeholder={`# 1. Encode your file to base64 (example for Linux/macOS)
# FILE_PATH="/path/to/your/invoice.pdf"
# MIME_TYPE=$(file --mime-type -b "$FILE_PATH") # Or set manually, e.g., "application/pdf"
# BASE64_DATA=$(base64 "$FILE_PATH")
# JSON_PAYLOAD=$(printf '{"fileData": "data:%s;base64,%s"}' "$MIME_TYPE" "$BASE64_DATA")

# 2. Make the API call
curl -X POST https://documate-beta.vercel.app/api/analyze/YOUR_ENDPOINT_ID \\\
     -H "Authorization: Bearer YOUR_ENDPOINT_API_KEY" \\\
     -H "Content-Type: application/json" \\\
     -d '$JSON_PAYLOAD' # Use the JSON payload created above`}
        instruction="Replace YOUR_ENDPOINT_ID and YOUR_ENDPOINT_API_KEY. Explain the two steps: encoding the file and making the call with the JSON payload."
        type="CODE"
      />

      <h3 className="text-xl font-semibold mt-8 mb-3">Example Request (Python)</h3>
      <p className="text-muted-foreground mb-4">
        Using Python and the `requests` library (`pip install requests`).
      </p>
      <ApiDocPlaceholder
        placeholder={`import requests
import base64
import mimetypes # For guessing mime type
import os

api_key = "YOUR_ENDPOINT_API_KEY" # Replace with your API key for this endpoint
api_endpoint = "https://documate-beta.vercel.app/api/analyze/YOUR_ENDPOINT_ID" # Replace with your full endpoint URL
file_path = "/path/to/your/invoice.pdf" # Replace with the path to your document

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

try:
    # Read file and encode as base64
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    base64_encoded_data = base64.b64encode(file_bytes).decode('utf-8')

    # Guess mime type
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        mime_type = 'application/octet-stream' # Default if type unknown
        
    # Create data URI
    file_data_uri = f"data:{mime_type};base64,{base64_encoded_data}"

    # Prepare JSON payload
    payload = {
        "fileData": file_data_uri
    }

    response = requests.post(api_endpoint, headers=headers, json=payload)
    response.raise_for_status() # Raise exception for bad status codes

    result = response.json()
    print("Processing successful:")
    print(result)

    # Example Access (depends on your template structure)
    # vendor = result.get('content', {}).get('VendorInfo', {}).get('VendorName')
    # print(f"Vendor: {vendor}")

except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
    if e.response is not None:
        print(f"Status Code: {e.response.status_code}")
        try: print(f"Response Body: {e.response.json()}")
        except ValueError: print(f"Response Body: {e.response.text}")
except FileNotFoundError:
    print(f"Error: File not found at {file_path}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")`}
        instruction="Replace placeholders for API key, endpoint URL, and file path."
        type="CODE"
      />

      <h3 className="text-xl font-semibold mt-8 mb-3">Example Request (Node.js - Fetch)</h3>
      <p className="text-muted-foreground mb-4">
        Using the built-in `fetch` API and `fs` module.
      </p>
      <ApiDocPlaceholder
        placeholder="NODE_JS_FETCH_CODE_EXAMPLE"
        instruction="Replace the '// NODE_JS_FETCH_CODE_EXAMPLE' line above with the full Node.js code block provided in the documentation source or previous messages. Ensure all placeholders within that code (API key, endpoint, file path) are updated."
        type="CODE"
      />

      <h3 className="text-xl font-semibold mt-6 mb-3">Successful Response (200 OK)</h3>
      <p className="text-muted-foreground mb-4">
A successful request returns a JSON object directly representing the data structure defined in the template linked to your endpoint ID.
      </p>
      <ApiDocPlaceholder
        placeholder={`{
  "documentType": "Invoice", // Name of the linked template
  "content": {
    "HeaderInfo": { // Section name from template
      "InvoiceNumber": "INV-123", // Field name and extracted value
      "VendorName": "Example Corp",
      "DueDate": "2023-12-31"
      // ... other fields defined in this 'data' section
    },
    "LineItems": [ // Section name from template (type 'table')
      {
        "ItemName": "Widget A", // Field name and extracted value
        "Quantity": 2,
        "UnitPrice": 50.00
        // ... other fields defined in this 'table' section
      },
      {
        "ItemName": "Gadget B",
        "Quantity": 1,
        "UnitPrice": 150.00
      }
      // ... other rows
    ]
    // ... other sections defined in the template
  }
}`}
        instruction="Replace with an example JSON response structure matching a sample template. Highlight that the structure mirrors the linked template."
        type="CODE"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Error Handling</h2>
      <p className="text-muted-foreground mb-4">
The API uses standard HTTP status codes. Common errors include:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>`400 Bad Request`</strong>: Invalid JSON payload or missing `fileData`.</li>
        <li><strong>`401 Unauthorized`</strong>: Invalid, missing, or incorrect API key for the specified `endpointId`.</li>
        <li><strong>`404 Not Found`</strong>: The specified `endpointId` does not exist or is not active.</li>
        <li><strong>`429 Too Many Requests`</strong>: Rate limit for the endpoint exceeded. Check rate limit settings in the Playground.</li>
        <li><strong>`500 Internal Server Error`</strong>: An issue occurred during processing (e.g., AI model error, template configuration problem, database issue). The response body might contain details.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Rate Limits</h2>
      <p className="text-muted-foreground mb-6">
        Rate limits are configured per endpoint via the <Link href="/playground/api" className="text-primary hover:underline">Playground API section</Link>. You can enable/disable rate limiting and set the maximum number of requests per second, minute, hour, or day. Exceeding the limit results in a `429 Too Many Requests` error.
      </p>
      <ApiDocPlaceholder
        placeholder="IMAGE_PLACEHOLDER_RATE_LIMIT_CONFIG"
        instruction="Replace with an <img> tag showing the rate limit configuration options for an endpoint in the Playground."
        type="IMAGE"
      />

      <p className="text-lg text-muted-foreground mt-10">
        Manage your endpoints, keys, templates, and view usage statistics in the <Link href="/playground/api" className="text-primary hover:underline">API section in the Playground</Link>. Happy integrating!
      </p>
    </div>
  );
}
