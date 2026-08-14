/**
 * Export data to native Excel spreadsheet format (.xls) with formatted header row,
 * custom column styling, and auto-header recognition in MS Excel.
 */
export const exportToExcel = (filename, sheetName, headers, rows) => {
  const tableHeader = headers
    .map(h => `<th style="background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; padding: 10px 14px; border: 1px solid #1E40AF; text-align: left;">${h}</th>`)
    .join('');
  
  const tableBody = rows
    .map((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const cells = row
        .map(cell => {
          const val = cell !== undefined && cell !== null ? String(cell) : '';
          return `<td style="padding: 8px 12px; border: 1px solid #CBD5E1; background-color: ${bg}; mso-number-format:'\\@';">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${sheetName || 'Sheet1'}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        th { background-color: #1E3A8A !important; color: #FFFFFF !important; font-weight: bold; text-align: left; padding: 10px 14px; border: 1px solid #1E40AF; }
        td { padding: 8px 12px; border: 1px solid #CBD5E1; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${tableHeader}</tr>
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
