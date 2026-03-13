import { VehicleLocation, VehicleStatus } from "@prisma/client";
import { createVehicle, updateVehicleStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/tables/data-table";
import { vehicleColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Inventory" description="Stock control, valuation and status tracking" />

      <Card>
        <CardHeader>
          <CardTitle>Add vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createVehicle} className="grid gap-3 md:grid-cols-4">
            <Input name="registration" placeholder="Registration" required />
            <Input name="vin" placeholder="VIN" required />
            <Input name="stockNumber" placeholder="Stock number" required />
            <Input name="make" placeholder="Make" required />
            <Input name="model" placeholder="Model" required />
            <Input name="derivative" placeholder="Derivative" />
            <Input name="year" placeholder="Year" type="number" required />
            <Input name="mileage" placeholder="Mileage" type="number" required />
            <Input name="fuelType" placeholder="Fuel type" required />
            <Input name="transmission" placeholder="Transmission" required />
            <Input name="engineSize" placeholder="Engine size" />
            <Input name="colour" placeholder="Colour" />
            <Input name="bodyStyle" placeholder="Body style" />
            <Input name="purchasePrice" placeholder="Purchase price" type="number" step="0.01" />
            <Input name="prepCost" placeholder="Prep cost" type="number" step="0.01" />
            <Input name="advertisedPrice" placeholder="Advertised price" type="number" step="0.01" required />
            <Input name="minimumPrice" placeholder="Minimum price" type="number" step="0.01" />
            <Select name="status" defaultValue={VehicleStatus.IN_STOCK}>
              {Object.values(VehicleStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Select name="location" defaultValue={VehicleLocation.FORECOURT}>
              {Object.values(VehicleLocation).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Input name="source" placeholder="Source" />
            <Input name="supplier" placeholder="Supplier" />
            <div className="md:col-span-4">
              <Textarea name="notes" placeholder="Notes" />
            </div>
            <Button type="submit" className="md:col-span-4 md:w-fit">
              Save vehicle
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update status/location</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateVehicleStatus} className="grid gap-3 md:grid-cols-4">
            <Select name="id" required>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration} - {v.make} {v.model}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={VehicleStatus.IN_STOCK}>
              {Object.values(VehicleStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Select name="location" defaultValue={VehicleLocation.FORECOURT}>
              {Object.values(VehicleLocation).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <DataTable columns={vehicleColumns} data={vehicles.map((v) => ({ ...v, advertisedPrice: Number(v.advertisedPrice ?? 0) }))} searchPlaceholder="Search registration, make, model..." />
    </div>
  );
}
