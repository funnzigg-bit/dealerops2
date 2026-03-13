"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { gbp } from "@/lib/utils";

type VehicleRow = {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  advertisedPrice: number | null;
  status: string;
  location: string;
};

export const vehicleColumns: ColumnDef<VehicleRow>[] = [
  {
    accessorKey: "registration",
    header: "Registration",
    cell: ({ row }) => (
      <Link href={`/vehicles/${row.original.id}`} className="text-cyan-300 hover:underline">
        {row.original.registration}
      </Link>
    ),
  },
  { accessorKey: "make", header: "Make" },
  { accessorKey: "model", header: "Model" },
  { accessorKey: "year", header: "Year" },
  { accessorKey: "mileage", header: "Mileage" },
  { accessorKey: "advertisedPrice", header: "Advertised", cell: ({ row }) => gbp(row.original.advertisedPrice) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge value={row.original.status} /> },
  { accessorKey: "location", header: "Location", cell: ({ row }) => <Badge value={row.original.location} /> },
];
