import { PrismaClient, IssueType, TeamType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const templates = [
  { id: "FRONT_BRANDING_REPLACEMENT", name: "החלפת גרפיקת חזית", team: TeamType.BRANDING },
  { id: "SIDE_BRANDING_REPLACEMENT", name: "החלפת גרפיקת צד", team: TeamType.BRANDING },
  { id: "PRICE_LABEL_REPLACEMENT", name: "החלפת תוויות מחיר", team: TeamType.BRANDING },
  { id: "PRODUCT_LABEL_REPLACEMENT", name: "החלפת מדבקות מוצר", team: TeamType.BRANDING },
  { id: "RUST_TREATMENT", name: "טיפול בחלודה", team: TeamType.MAINTENANCE },
  { id: "PANEL_REPAIR", name: "תיקון פאנל בחירה", team: TeamType.TECHNICIAN },
  { id: "GLASS_REPLACEMENT", name: "החלפת זכוכית", team: TeamType.TECHNICIAN },
  { id: "CLEANING", name: "ניקוי מכונה", team: TeamType.CLEANING },
  { id: "GENERAL_CHECK", name: "בדיקה כללית", team: TeamType.GENERAL },
] as const;

const mappings: { issueType: IssueType; location: string | null; templateId: string }[] = [
  { issueType: IssueType.DAMAGED_BRANDING, location: "FRONT", templateId: "FRONT_BRANDING_REPLACEMENT" },
  { issueType: IssueType.VANDALISM, location: "FRONT", templateId: "FRONT_BRANDING_REPLACEMENT" },
  { issueType: IssueType.DAMAGED_BRANDING, location: "SIDE", templateId: "SIDE_BRANDING_REPLACEMENT" },
  { issueType: IssueType.VANDALISM, location: "SIDE", templateId: "SIDE_BRANDING_REPLACEMENT" },
  { issueType: IssueType.MISSING_PRICE_LABEL, location: null, templateId: "PRICE_LABEL_REPLACEMENT" },
  { issueType: IssueType.MISSING_PRODUCT_LABEL, location: null, templateId: "PRODUCT_LABEL_REPLACEMENT" },
  { issueType: IssueType.RUST, location: null, templateId: "RUST_TREATMENT" },
  { issueType: IssueType.DAMAGED_PANEL, location: "PANEL", templateId: "PANEL_REPAIR" },
  { issueType: IssueType.BROKEN_GLASS, location: null, templateId: "GLASS_REPLACEMENT" },
  { issueType: IssueType.DIRTY, location: null, templateId: "CLEANING" },
  { issueType: IssueType.SCREEN_OFF, location: null, templateId: "GENERAL_CHECK" },
  { issueType: IssueType.DOOR_OPEN, location: null, templateId: "GENERAL_CHECK" },
  { issueType: IssueType.GENERAL_ISSUE, location: null, templateId: "GENERAL_CHECK" },
];

const demoMachines = [
  { id: "VM-145", name: "תחנת פז — אלנבי", location: "תל אביב" },
  { id: "VM-146", name: "קניון איילון — כניסה צפון", location: "רמת גן" },
  { id: "VM-147", name: "תחנת רכבת — חיפה", location: "חיפה" },
  { id: "VM-148", name: "בית חולים — מרכז", location: "ירושלים" },
  { id: "VM-149", name: "אוניברסיטה — ספרייה", location: "באר שבע" },
];

async function upsertMapping(m: (typeof mappings)[0]) {
  const existing = await prisma.issueTemplateMapping.findFirst({
    where: { issueType: m.issueType, location: m.location },
  });
  if (existing) {
    await prisma.issueTemplateMapping.update({
      where: { id: existing.id },
      data: { templateId: m.templateId },
    });
  } else {
    await prisma.issueTemplateMapping.create({ data: m });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  for (const t of templates) {
    await prisma.resolutionTemplate.upsert({
      where: { id: t.id },
      update: { name: t.name, team: t.team, isActive: true },
      create: { ...t, isActive: true },
    });
  }

  for (const m of mappings) {
    await upsertMapping(m);
  }

  for (const machine of demoMachines) {
    await prisma.machine.upsert({
      where: { id: machine.id },
      update: machine,
      create: { ...machine, isActive: true },
    });
  }

  const users = [
    { email: "agent@maskar.local", name: "סוכן שטח", role: "AGENT" as const },
    { email: "office@maskar.local", name: "משרד", role: "OFFICE" as const },
    { email: "admin@maskar.local", name: "מנהל", role: "ADMIN" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { ...u, passwordHash },
    });
  }

  console.log("Seed complete: templates, mappings, machines, users (password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
