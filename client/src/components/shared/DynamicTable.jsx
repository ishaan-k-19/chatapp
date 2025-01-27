"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";

const DynamicTable = ({ columns, data }) => {
  const [sorting, setSorting] = useState([]);  // State to manage sorting
  const [globalFilter, setGlobalFilter] = useState("");  // State for global filtering (searching)

  // Setting up the table instance using TanStack React Table
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },  // Pass current sorting and filter state
    onSortingChange: setSorting,  // Updates sorting when changed
    onGlobalFilterChange: setGlobalFilter,  // Updates global filter when changed
    getCoreRowModel: getCoreRowModel(),  // Provides core row model for table data
    getPaginationRowModel: getPaginationRowModel(),  // Adds pagination capabilities
    getSortedRowModel: getSortedRowModel(),  // Adds sorting functionality
    getFilteredRowModel: getFilteredRowModel(),  // Adds filtering functionality
    initialState: { pagination: { pageSize: 5 } },  // Set initial page size to 5
  });

  return (
    <div className="w-full">
      {/* Global search input */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}  // Update global filter state on change
          className="max-w-sm"
        />
      </div>

      {/* Table container */}
      <div className="rounded-md border">
        <Table>
          {/* Table header with sorting functionality */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="cursor-pointer">
                    {header.column.getCanSort() ? (  // If column is sortable
                      <button
                        className="flex items-center space-x-2"
                        onClick={() => header.column.toggleSorting()}  // Toggle sorting order on click
                      >
                        {flexRender(  // Render the header content
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (  // Show sorting icon based on sorting state
                          header.column.getIsSorted() === "asc" ? (
                            <ArrowUpDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 rotate-180" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(  // If not sortable, just render the header content
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table body with rows and cells */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(  // Render the cell content
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Show message if no results
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* Display current page and total pages */}
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2">
          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}  // Navigate to the previous page
            disabled={!table.getCanPreviousPage()}  // Disable if no previous page
          >
            Previous
          </Button>
          {/* Next page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}  // Navigate to the next page
            disabled={!table.getCanNextPage()}  // Disable if no next page
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
