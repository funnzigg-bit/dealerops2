import { VehicleLocation } from "@prisma/client";
import { moveVehicle } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function LocationsPage() {
  const [vehicles, logs] = await Promise.all([
    prisma.vehicle.findMany({ where: { deletedAt: null }, orderBy: { registration: "asc" }, take: 250 }),
    prisma.vehicleLocationLog.findMany({ include: { vehicle: true, user: true }, orderBy: { movedAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Location Tracker" description="Operational movement logging for workshop, forecourt and external garages" />
      <Card>
        <CardHeader><CardTitle>Log movement</CardTitle></CardHeader>
        <CardContent>
          <form action={moveVehicle} className="grid gap-3 md:grid-cols-4">
            <Select name="vehicleId" required>
              <option value="">Vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration} · {v.location}</option>)}
            </Select>
            <Select name="toLocation" defaultValue={VehicleLocation.FORECOURT}>
              {Object.values(VehicleLocation).map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </Select>
            <Input name="reason" placeholder="Reason" required />
            <Input name="notes" placeholder="Notes" />
            <Button className="md:w-fit">Record movement</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent movement history</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-zinc-800 p-3">
              <p>{log.vehicle.registration} · {log.fromLocation} → {log.toLocation}</p>
              <p className="text-zinc-400">{log.reason} · {log.user.name} · {formatDate(log.movedAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
