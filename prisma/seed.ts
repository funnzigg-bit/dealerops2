import { addMonths, subDays } from "date-fns";
import { hash } from "bcryptjs";
import {
  AftersalesPriority,
  AftersalesStatus,
  CommunicationDirection,
  CommunicationType,
  Customer,
  Deal,
  DealStage,
  FinanceStatus,
  Prisma,
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
  VehicleLocation,
  Vehicle,
  VehicleStatus,
  WarrantyStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const makesModels = [
  ["Ford", "Fiesta"],
  ["Ford", "Focus"],
  ["Vauxhall", "Corsa"],
  ["Vauxhall", "Astra"],
  ["Volkswagen", "Golf"],
  ["Volkswagen", "Polo"],
  ["BMW", "1 Series"],
  ["BMW", "3 Series"],
  ["Audi", "A3"],
  ["Audi", "A4"],
  ["Toyota", "Yaris"],
  ["Nissan", "Qashqai"],
  ["Peugeot", "208"],
  ["Kia", "Sportage"],
  ["Hyundai", "Tucson"],
  ["Skoda", "Octavia"],
  ["SEAT", "Leon"],
  ["Mercedes", "A-Class"],
  ["Mazda", "CX-5"],
  ["Honda", "Civic"],
];

const firstNames = [
  "Oliver",
  "George",
  "Harry",
  "Noah",
  "Jack",
  "Charlie",
  "Freddie",
  "Alfie",
  "Archie",
  "Oscar",
  "Amelia",
  "Isla",
  "Ava",
  "Mia",
  "Sophia",
  "Grace",
  "Lily",
  "Ella",
  "Poppy",
  "Evie",
];

const lastNames = [
  "Smith",
  "Jones",
  "Taylor",
  "Brown",
  "Williams",
  "Wilson",
  "Davies",
  "Evans",
  "Thomas",
  "Roberts",
  "Johnson",
  "Walker",
  "Wright",
  "Hall",
  "Green",
  "Baker",
  "Morris",
  "Cooper",
  "King",
  "Ward",
];

function reg(i: number) {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  return `${letters[i % letters.length]}${letters[(i + 7) % letters.length]}${20 + (i % 6)} ${letters[(i + 2) % letters.length]}${letters[(i + 9) % letters.length]}${letters[(i + 13) % letters.length]}`;
}

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.communicationLog.deleteMany(),
    prisma.task.deleteMany(),
    prisma.vehicleLocationLog.deleteMany(),
    prisma.aftersalesNote.deleteMany(),
    prisma.aftersalesCase.deleteMany(),
    prisma.garage.deleteMany(),
    prisma.warranty.deleteMany(),
    prisma.warrantyProvider.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.financeApplication.deleteMany(),
    prisma.financeProvider.deleteMany(),
    prisma.dealNote.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.vehicleDocument.deleteMany(),
    prisma.vehicleImage.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
    prisma.dealerSettings.deleteMany(),
    prisma.complianceEvidence.deleteMany(),
  ]);

  const passwordHash = await hash("Password123!", 10);

  const users = await prisma.$transaction([
    prisma.user.create({ data: { name: "Aisha Patel", email: "admin@dealerops.local", role: Role.ADMIN, passwordHash, mobile: "07700900111" } }),
    prisma.user.create({ data: { name: "Liam Turner", email: "manager@dealerops.local", role: Role.MANAGER, passwordHash, mobile: "07700900222" } }),
    prisma.user.create({ data: { name: "Sophie Miller", email: "sales@dealerops.local", role: Role.SALES, passwordHash, mobile: "07700900333" } }),
    prisma.user.create({ data: { name: "Ryan Hughes", email: "aftersales@dealerops.local", role: Role.AFTERSALES, passwordHash, mobile: "07700900444" } }),
  ]);

  const financeProviders = await prisma.$transaction([
    prisma.financeProvider.create({ data: { name: "MotoNovo Finance", contactEmail: "partner@motonovo.co.uk" } }),
    prisma.financeProvider.create({ data: { name: "Close Brothers Motor Finance", contactEmail: "dealer@closebrothers.com" } }),
    prisma.financeProvider.create({ data: { name: "Blue Motor Finance", contactEmail: "support@bluemotorfinance.co.uk" } }),
  ]);

  const warrantyProviders = await prisma.$transaction([
    prisma.warrantyProvider.create({ data: { name: "Autoguard Warranties" } }),
    prisma.warrantyProvider.create({ data: { name: "Warrantywise Dealer" } }),
  ]);

  const garages = await prisma.$transaction([
    prisma.garage.create({ data: { name: "Midlands Auto Repairs", townCity: "Birmingham", postcode: "B1 1AA", mobile: "01211234567" } }),
    prisma.garage.create({ data: { name: "Northside Vehicle Services", townCity: "Leeds", postcode: "LS1 4AB", mobile: "01132456789" } }),
  ]);

  await prisma.dealerSettings.create({
    data: {
      dealershipName: "DealerOps Motors",
      legalName: "DealerOps Motors Ltd",
      vatNumber: "GB123456789",
      addressLine1: "12 Tyre Street",
      townCity: "Manchester",
      postcode: "M1 3AA",
      phone: "01611234567",
      email: "accounts@dealerops.local",
      invoicePrefix: "INV",
      warrantyPrefix: "WAR",
      invoiceTerms: "Payment due within 7 days unless agreed otherwise.",
      warrantyFooter: "Warranty subject to provider terms and fair wear exclusions.",
    },
  });

  const customers: Prisma.PrismaPromise<Customer>[] = [];
  for (let i = 0; i < 45; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 3) % lastNames.length];
    customers.push(
      prisma.customer.create({
        data: {
          fullName: `${first} ${last}`,
          mobile: `07${(700000000 + i * 1337).toString().slice(0, 9)}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@mail.uk`,
          address: `${10 + i} High Road`,
          townCity: ["Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool"][i % 5],
          postcode: `M${(i % 9) + 1} ${(i % 9) + 1}AA`,
          marketingConsent: i % 2 === 0,
          preferredContact: i % 3 === 0 ? "Phone" : "Email",
          notes: i % 4 === 0 ? "Interested in finance options and service plan." : "Returning customer enquiry.",
        },
      }),
    );
  }
  const customerRecords = await prisma.$transaction(customers);

  const vehicles: Prisma.PrismaPromise<Vehicle>[] = [];
  for (let i = 0; i < 28; i++) {
    const [make, model] = makesModels[i % makesModels.length];
    const purchasePrice = 3500 + i * 460;
    const prep = 250 + (i % 7) * 110;
    const advertised = purchasePrice + prep + 1800 + (i % 6) * 300;
    const statusIndex = i % 6;
    const status = [
      VehicleStatus.IN_STOCK,
      VehicleStatus.RESERVED,
      VehicleStatus.SOLD,
      VehicleStatus.IN_PREP,
      VehicleStatus.AT_GARAGE,
      VehicleStatus.DELIVERED,
    ][statusIndex];
    const location = [
      VehicleLocation.FORECOURT,
      VehicleLocation.WORKSHOP,
      VehicleLocation.CUSTOMER,
      VehicleLocation.STORAGE,
      VehicleLocation.EXTERNAL_GARAGE,
      VehicleLocation.DELIVERED,
    ][statusIndex];

    vehicles.push(
      prisma.vehicle.create({
        data: {
          registration: reg(i),
          vin: `WVWZZZ${(100000 + i).toString()}XYZ`,
          stockNumber: `STK-${(1000 + i).toString()}`,
          make,
          model,
          derivative: i % 2 === 0 ? "1.6 TDI" : "1.2 Turbo",
          year: 2013 + (i % 12),
          mileage: 24000 + i * 4100,
          fuelType: i % 3 === 0 ? "Diesel" : i % 4 === 0 ? "Hybrid" : "Petrol",
          transmission: i % 5 === 0 ? "Automatic" : "Manual",
          engineSize: i % 2 === 0 ? "1.6L" : "1.2L",
          colour: ["Black", "Blue", "Silver", "White", "Grey"][i % 5],
          bodyStyle: ["Hatchback", "SUV", "Saloon", "Estate"][i % 4],
          doors: i % 3 === 0 ? 3 : 5,
          seats: 5,
          purchaseDate: subDays(new Date(), 20 + i * 5),
          purchasePrice,
          prepCost: prep,
          advertisedPrice: advertised,
          minimumPrice: advertised - 850,
          salePrice: status === VehicleStatus.SOLD || status === VehicleStatus.DELIVERED ? advertised - 250 : null,
          status,
          source: i % 2 === 0 ? "Auction" : "Part Exchange",
          supplier: i % 2 === 0 ? "BCA Walsall" : "Retail PX",
          location,
          motExpiry: addMonths(new Date(), 2 + (i % 14)),
          serviceHistory: i % 2 === 0 ? "Full" : "Partial",
          keyCount: i % 4 === 0 ? 1 : 2,
          notes: "Prepared to retail standard with multipoint check completed.",
          images: {
            create: [
              { url: `/uploads/demo/vehicle-${i + 1}.jpg`, alt: `${make} ${model}`, sortOrder: 1 },
            ],
          },
          documents: {
            create: [
              { fileName: "V5C.pdf", fileUrl: `/uploads/demo/v5c-${i + 1}.pdf`, category: "V5C" },
              { fileName: "Inspection.pdf", fileUrl: `/uploads/demo/inspection-${i + 1}.pdf`, category: "Inspection" },
            ],
          },
        },
      }),
    );
  }

  const vehicleRecords = await prisma.$transaction(vehicles);

  const deals: Prisma.PrismaPromise<Deal>[] = [];
  for (let i = 0; i < 18; i++) {
    const vehicle = vehicleRecords[i];
    const customer = customerRecords[i * 2];
    const stage = [
      DealStage.ENQUIRY,
      DealStage.TEST_DRIVE_BOOKED,
      DealStage.NEGOTIATION,
      DealStage.DEPOSIT_TAKEN,
      DealStage.FINANCE_PENDING,
      DealStage.READY_FOR_COLLECTION,
      DealStage.COMPLETED,
      DealStage.CANCELLED,
    ][i % 8];
    deals.push(
      prisma.deal.create({
        data: {
          reference: `DL-${2026}${(100 + i).toString()}`,
          customerId: customer.id,
          vehicleId: vehicle.id,
          salespersonId: users[2].id,
          stage,
          deposit: 300 + i * 20,
          agreedPrice: Number(vehicle.advertisedPrice) - 200,
          partExchangeValue: i % 3 === 0 ? 1200 : null,
          addOnsValue: i % 2 === 0 ? 299 : 149,
          warrantySold: i % 2 === 0,
          financePending: i % 3 === 1,
          deliveryMethod: i % 2 === 0 ? "Collection" : "Delivery",
          collectionDate: addMonths(new Date(), 0),
          notes: "Customer requested fresh MOT and service before handover.",
          completedAt: stage === DealStage.COMPLETED ? subDays(new Date(), i) : null,
          dealNotes: {
            create: [
              { userId: users[2].id, note: "Initial enquiry received via AutoTrader." },
              { userId: users[1].id, note: "Price approved by manager.", internal: true },
            ],
          },
        },
      }),
    );
  }

  const dealRecords = await prisma.$transaction(deals);

  for (let i = 0; i < 12; i++) {
    const deal = dealRecords[i];
    await prisma.financeApplication.create({
      data: {
        dealId: deal.id,
        customerId: deal.customerId,
        providerId: financeProviders[i % financeProviders.length].id,
        proposalReference: `PR-${2026}-${5000 + i}`,
        amountFinanced: 8500 + i * 520,
        deposit: 1000 + i * 100,
        apr: 8.9 + (i % 3),
        termMonths: 36 + (i % 3) * 12,
        commission: 320 + i * 14,
        payout: 7800 + i * 480,
        status: [FinanceStatus.SUBMITTED, FinanceStatus.ACCEPTED, FinanceStatus.PAID_OUT][i % 3],
        submittedAt: subDays(new Date(), i + 3),
        acceptedAt: i % 2 === 0 ? subDays(new Date(), i) : null,
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    const deal = dealRecords[i];
    const subtotal = Number(deal.agreedPrice ?? 0);
    const vat = subtotal * 0.2;
    const total = subtotal + vat;
    const deposit = Number(deal.deposit ?? 0);
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${1000 + i}`,
        dealId: deal.id,
        customerId: deal.customerId,
        subtotal,
        vatAmount: vat,
        total,
        depositPaid: deposit,
        balanceDue: total - deposit,
        status: i % 4 === 0 ? "PAID" : i % 3 === 0 ? "PARTIALLY_PAID" : "UNPAID",
        paymentMethod: i % 2 === 0 ? "Bank Transfer" : "Card",
        notes: "Used vehicle sale invoice with margin scheme notes where applicable.",
        items: {
          create: [
            { description: "Vehicle", quantity: 1, unitPrice: subtotal - 250, lineTotal: subtotal - 250 },
            { description: "Admin fee", quantity: 1, unitPrice: 150, lineTotal: 150 },
            { description: "Road fund licence support", quantity: 1, unitPrice: 100, lineTotal: 100 },
          ],
        },
      },
    });
  }

  for (let i = 0; i < 12; i++) {
    const deal = dealRecords[i];
    await prisma.warranty.create({
      data: {
        warrantyNumber: `WAR-2026-${2000 + i}`,
        providerId: warrantyProviders[i % warrantyProviders.length].id,
        dealId: deal.id,
        vehicleId: deal.vehicleId,
        customerId: deal.customerId,
        durationMonths: i % 2 === 0 ? 12 : 24,
        startDate: subDays(new Date(), i * 2),
        endDate: addMonths(new Date(), i % 2 === 0 ? 12 : 24),
        cost: 220 + i * 18,
        retailPrice: 399 + i * 30,
        status: i % 7 === 0 ? WarrantyStatus.CLAIMED : WarrantyStatus.ACTIVE,
        coverageNotes: "Engine, gearbox, turbo, cooling and electrical components covered.",
      },
    });
  }

  const warranties = await prisma.warranty.findMany();

  for (let i = 0; i < 10; i++) {
    const vehicle = vehicleRecords[i + 5];
    const customer = customerRecords[i + 4];
    await prisma.aftersalesCase.create({
      data: {
        reference: `ASC-${2026}-${300 + i}`,
        vehicleId: vehicle.id,
        customerId: customer.id,
        warrantyId: warranties[i]?.id,
        assignedToId: users[3].id,
        garageId: garages[i % garages.length].id,
        issueTitle: ["Engine management light", "Brake judder", "Air-con not cooling", "Battery drain", "Infotainment fault"][i % 5],
        description: "Customer reported intermittent issue requiring inspection and remediation.",
        reportedDate: subDays(new Date(), i + 1),
        priority: [AftersalesPriority.MEDIUM, AftersalesPriority.HIGH, AftersalesPriority.LOW][i % 3],
        status: [
          AftersalesStatus.NEW,
          AftersalesStatus.UNDER_REVIEW,
          AftersalesStatus.APPROVED,
          AftersalesStatus.IN_REPAIR,
          AftersalesStatus.AWAITING_PARTS,
          AftersalesStatus.RESOLVED,
        ][i % 6],
        estimatedCost: 120 + i * 30,
        actualCost: i % 3 === 0 ? 140 + i * 20 : null,
        notes: {
          create: [
            { userId: users[3].id, note: "Vehicle booked with partner garage." },
            { userId: users[1].id, note: "Authorised up to £350 diagnostic and repair." },
          ],
        },
      },
    });
  }

  for (let i = 0; i < 35; i++) {
    await prisma.task.create({
      data: {
        title: ["Call customer", "Book MOT", "Upload handover docs", "Check finance payout", "Arrange workshop slot"][i % 5],
        description: "Operational task linked to daily sales and aftersales workflow.",
        dueDate: addMonths(new Date(), 0),
        priority: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT][i % 4],
        status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE][i % 3],
        assignedToId: users[(i % 3) + 1].id,
        createdById: users[1].id,
        vehicleId: vehicleRecords[i % vehicleRecords.length].id,
        customerId: customerRecords[i % customerRecords.length].id,
        dealId: dealRecords[i % dealRecords.length].id,
        warrantyId: warranties[i % warranties.length]?.id,
      },
    });
  }

  for (let i = 0; i < 50; i++) {
    await prisma.communicationLog.create({
      data: {
        type: [CommunicationType.CALL, CommunicationType.EMAIL, CommunicationType.SMS, CommunicationType.WHATSAPP][i % 4],
        direction: [CommunicationDirection.INBOUND, CommunicationDirection.OUTBOUND][i % 2],
        subject: ["Test drive follow-up", "Finance docs", "Handover slot", "Warranty claim"][i % 4],
        notes: "Contact recorded with clear action and ownership for follow-up.",
        customerId: customerRecords[i % customerRecords.length].id,
        vehicleId: vehicleRecords[i % vehicleRecords.length].id,
        dealId: dealRecords[i % dealRecords.length].id,
        userId: users[(i % 3) + 1].id,
      },
    });
  }

  for (const vehicle of vehicleRecords.slice(0, 20)) {
    await prisma.vehicleLocationLog.create({
      data: {
        vehicleId: vehicle.id,
        fromLocation: VehicleLocation.WORKSHOP,
        toLocation: vehicle.location,
        reason: "Prep complete / movement update",
        notes: "Updated by operations team.",
        userId: users[3].id,
      },
    });
  }

  const auditableActions = [
    ["Vehicle", "UPDATE_PRICE"],
    ["Deal", "STATUS_CHANGE"],
    ["Invoice", "GENERATED"],
    ["Warranty", "CREATED"],
    ["AftersalesCase", "STATUS_CHANGE"],
    ["User", "LOGIN"],
  ] as const;

  for (let i = 0; i < 80; i++) {
    const action = auditableActions[i % auditableActions.length];
    await prisma.auditLog.create({
      data: {
        entityType: action[0],
        entityId: `${action[0]}-${i}`,
        action: action[1],
        userId: users[i % users.length].id,
        beforeData: { status: "before" },
        afterData: { status: "after" },
        meta: { source: "seed", ip: "127.0.0.1" },
        immutableHash: `${action[0].slice(0, 3)}-${i}-hash`,
      },
    });
  }

  console.log("Seeded DealerOps demo data.");
  console.log("Demo users:");
  console.log("admin@dealerops.local / Password123!");
  console.log("manager@dealerops.local / Password123!");
  console.log("sales@dealerops.local / Password123!");
  console.log("aftersales@dealerops.local / Password123!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
