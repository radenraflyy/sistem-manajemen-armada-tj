import type { Key, ReactNode } from 'react';

import Table from '@/components/Table';

export type DataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  cell: (row: Row, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

type DataTableProps<Row> = {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowKey: (row: Row) => Key;
  minWidthClass?: string;
  className?: string;
  headerCellClassName?: string;
  cellClassName?: string;
  rowClassName?: string;
};

function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  minWidthClass,
  className,
  headerCellClassName = 'px-5 py-3.5 font-semibold',
  cellClassName = 'px-5 py-4',
  rowClassName = 'hover:bg-slate-50/80',
}: DataTableProps<Row>) {
  return (
    <Table minWidthClass={minWidthClass} className={className}>
      <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
        <tr>
          {columns.map((column) => (
            <th
              className={`${headerCellClassName} ${column.headerClassName ?? ''}`}
              key={column.key}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='divide-y divide-slate-100'>
        {rows.map((row, index) => (
          <tr className={rowClassName} key={getRowKey(row)}>
            {columns.map((column) => (
              <td className={`${cellClassName} ${column.cellClassName ?? ''}`} key={column.key}>
                {column.cell(row, index)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DataTable;
