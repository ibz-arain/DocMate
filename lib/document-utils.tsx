import React from 'react';

export const generateMarkdown = (data: any): string => {
  if (!data) return '';

  const padValue = (str: string, length: number) => {
    return str.padEnd(length, ' ');
  };

  const formatTableValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value)
      .replace(/\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\|/g, '\\|')
      .trim();
  };

  const createTable = (data: Record<string, any>, headers: string[] = ['Property', 'Value']) => {
    const columnWidths = headers.map(header => header.length);
    const rows = Object.entries(data).map(([key, value]) => {
      const formattedValue = formatTableValue(value);
      columnWidths[0] = Math.max(columnWidths[0], key.length);
      columnWidths[1] = Math.max(columnWidths[1], formattedValue.length);
      return [key, formattedValue];
    });

    columnWidths[0] = Math.max(columnWidths[0], 8);
    columnWidths[1] = Math.max(columnWidths[1], 5);

    let table = `| ${padValue(headers[0], columnWidths[0])} | ${padValue(headers[1], columnWidths[1])} |\n`;
    table += `|${'-'.repeat(columnWidths[0] + 2)}|${'-'.repeat(columnWidths[1] + 2)}|\n`;

    rows.forEach(([key, value]) => {
      table += `| ${padValue(key, columnWidths[0])} | ${padValue(value, columnWidths[1])} |\n`;
    });

    return table;
  };

  const createArrayTable = (array: any[]) => {
    if (array.length === 0) return '';
    
    const headers = Object.keys(array[0]);
    const columnWidths = headers.map(header => header.length);

    array.forEach(item => {
      headers.forEach((header, index) => {
        const value = formatTableValue(item[header]);
        columnWidths[index] = Math.max(columnWidths[index], value.length);
      });
    });

    let table = '| ' + headers.map((header, i) => padValue(header, columnWidths[i])).join(' | ') + ' |\n';
    table += '|' + columnWidths.map(width => '-'.repeat(width + 2)).join('|') + '|\n';

    array.forEach(item => {
      table += '| ' + headers.map((header, i) => {
        const value = formatTableValue(item[header]);
        return padValue(value, columnWidths[i]);
      }).join(' | ') + ' |\n';
    });

    return table;
  };

  let markdown = `# ${data.documentType}\n\n`;

  if (data.metadata) {
    markdown += '## Metadata\n\n';
    Object.entries(data.metadata).forEach(([key, value]: [string, any]) => {
      markdown += `### ${key}\n\n`;
      if (typeof value === 'object' && !Array.isArray(value)) {
        markdown += createTable(value);
      } else {
        markdown += createTable({ [key]: value });
      }
      markdown += '\n';
    });
  }

  if (data.content) {
    Object.entries(data.content).forEach(([key, value]: [string, any]) => {
      markdown += `### ${key}\n\n`;
      if (Array.isArray(value) && value.length > 0) {
        markdown += createArrayTable(value);
      } else if (typeof value === 'object') {
        markdown += createTable(value);
      }
      markdown += '\n';
    });
  }

  return markdown;
};

export const generateFormattedView = (data: any): React.ReactNode => {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{data.documentType}</h2>
        
        {data.metadata && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Metadata</h3>
            {Object.entries(data.metadata).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted">
                  <h4 className="font-medium capitalize">{key}</h4>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <tr key={subKey} className="border-b last:border-0">
                          <td className="py-2 font-medium capitalize w-1/3">{subKey}</td>
                          <td className="py-2">
                            {typeof subValue === 'object' 
                              ? JSON.stringify(subValue, null, 2)
                              : String(subValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.content && (
          <div className="space-y-6">
            {Object.entries(data.content).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted">
                  <h4 className="font-medium capitalize">{key}</h4>
                </div>
                <div className="p-4">
                  {Array.isArray(value) ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {Object.keys(value[0] || {}).map((header) => (
                            <th key={header} className="py-2 text-left font-medium capitalize">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((item, index) => (
                          <tr key={index} className="border-b last:border-0">
                            {Object.values(item).map((cellValue, cellIndex) => (
                              <td key={cellIndex} className="py-2">
                                {String(cellValue)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full">
                      <tbody>
                        {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                          <tr key={subKey} className="border-b last:border-0">
                            <td className="py-2 font-medium capitalize w-1/3">{subKey}</td>
                            <td className="py-2">
                              {typeof subValue === 'object' 
                                ? JSON.stringify(subValue, null, 2)
                                : String(subValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 