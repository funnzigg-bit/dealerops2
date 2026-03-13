"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

type Row = {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  townCity: string | null;
  postcode: string | null;
};

export const customerColumns: ColumnDef<Row>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/customers/${row.original.id}`} className="text-cyan-300 hover:underline">
        {row.original.fullName}
      </Link>
    ),
  },
  { accessorKey: "mobile", header: "Mobile" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "townCity", header: "Town/City" },
  { accessorKey: "postcode", header: "Postcode" },
];
