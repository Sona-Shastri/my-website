import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const H = "High";
const M = "Medium";

// [student, city, name, address, phone, priority]
// Chains that share one scheduling line are a SINGLE entry. No phone number
// repeats anywhere. Each phone is the imaging/MRI scheduling line.
const sites = [
  // ---- Margaret Ampomah — San Antonio, TX ----
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – South Texas Radiology Imaging Centers", "One scheduling line for all ~14 San Antonio locations", "(210) 617-9000", H],
  ["Margaret Ampomah", "San Antonio, TX", "Paesanos Parkway Imaging", "3603 Paesanos Pkwy #110, San Antonio 78231", "(210) 479-1966", H],
  ["Margaret Ampomah", "San Antonio, TX", "Baptist M&S Imaging", "8435 Wurzbach Rd, Ste 109, San Antonio 78229", "(210) 692-9824", M],
  ["Margaret Ampomah", "San Antonio, TX", "Gonzaba Medical Group Imaging", "720 Pleasanton Rd, San Antonio 78214", "(210) 923-9729", M],
  ["Margaret Ampomah", "San Antonio, TX", "University Health Imaging", "4502 Medical Dr, San Antonio 78229", "(210) 358-2725", M],
  ["Margaret Ampomah", "San Antonio, TX", "CHRISTUS Santa Rosa – Westover Hills", "11212 State Hwy 151, San Antonio 78251", "(210) 703-8100", M],
  ["Margaret Ampomah", "San Antonio, TX", "UT Health San Antonio – MARC Imaging", "8300 Floyd Curl Dr, San Antonio 78229", "(210) 450-9000", M],

  // ---- Lidia Kelati — Charlotte, NC ----
  ["Lidia Kelati", "Charlotte, NC", "Southern Imaging Services (SIS)", "7506 E Independence Blvd, Ste 123, Charlotte 28227", "(704) 321-4798", H],
  ["Lidia Kelati", "Charlotte, NC", "Carolina Neurosurgery & Spine (open MRI)", "225 Baldwin Ave, Charlotte 28204", "(704) 376-1605", H],
  ["Lidia Kelati", "Charlotte, NC", "Apex Orthopaedics, Spine & Neurology", "10502 Park Rd, Ste 120, Charlotte 28210", "(704) 412-3045", H],
  ["Lidia Kelati", "Charlotte, NC", "CaroMont Regional Medical Center", "2525 Court Dr, Gastonia 28054", "(704) 671-5300", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging SouthPark", "6324 Fairview Rd, Charlotte 28210", "(704) 362-8444", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Steele Creek", "13557 Steelecroft Pkwy, Ste 1100, Charlotte 28278", "(704) 316-2880", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Museum/Eastover", "2900 Randolph Rd, Charlotte 28211", "(704) 384-7140", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Imaging – Charlotte Orthopedic Hosp.", "1901 Randolph Rd, Charlotte 28207", "(704) 316-1411", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Imaging – Mint Hill Medical Center", "8201 Healthcare Loop, Charlotte 28215", "(980) 302-3000", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Ballantyne", "14215 Ballantyne Corporate Pl, Ste 140, Charlotte 28277", "(704) 384-1890", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging University City", "8401 Medical Plaza Dr, Ste 110, Charlotte 28262", "(704) 384-1580", M],

  // ---- Lars Swanson — Minneapolis, MN ----
  ["Lars Swanson", "Minneapolis, MN", "Hennepin Healthcare – Radiology", "HCMC 715 S 8th St + Whittier 2810 Nicollet Ave, Minneapolis", "(612) 873-6963", H],
  ["Lars Swanson", "Minneapolis, MN", "Noran Neurology – Bloomington Imaging", "3601 Minnesota Dr, Bloomington 55435", "(612) 879-1549", H],
  ["Lars Swanson", "Minneapolis, MN", "Summit Orthopedics Imaging", "Eagan, Plymouth, Vadnais Heights & Woodbury (one scheduling line)", "(651) 968-5201", M],
  ["Lars Swanson", "Minneapolis, MN", "TRIA Orthopedics", "Bloomington & Woodbury (one scheduling line)", "(952) 831-8742", M],
  ["Lars Swanson", "Minneapolis, MN", "Children's Minnesota – Minneapolis (pediatric)", "2525 Chicago Ave S, Minneapolis 55404", "(612) 874-5399", M],
  ["Lars Swanson", "Minneapolis, MN", "Gillette Children's (pediatric)", "200 University Ave E, St Paul 55101", "(651) 290-8707", M],
];

async function main() {
  // Guard against accidental duplicate phone numbers in the data above.
  const phones = sites.map((s) => s[4]);
  const dupes = phones.filter((p, i) => phones.indexOf(p) !== i);
  if (dupes.length) throw new Error("Duplicate phone numbers in seed: " + [...new Set(dupes)].join(", "));

  const keepNames = sites.map((s) => s[2]);

  let i = 0;
  for (const [student, city, name, address, phone, priority] of sites) {
    const order = i++;
    await prisma.site.upsert({
      where: { name },
      create: { order, student, city, name, address, phone, priority },
      update: { order, student, city, address, phone, priority },
    });
  }

  // Remove any sites that are no longer in the list (e.g., condensed chains).
  const removed = await prisma.site.deleteMany({ where: { name: { notIn: keepNames } } });
  console.log(`Seeded ${sites.length} sites; removed ${removed.count} old ones.`);

  // Optionally create/refresh accounts from the INITIAL_USERS env var.
  // Format: "email|Password|Full Name" entries separated by ; or newline.
  const raw = process.env.INITIAL_USERS;
  if (raw) {
    const entries = raw.split(/[;\n]+/).map((e) => e.trim()).filter(Boolean);
    for (const entry of entries) {
      const [emailRaw, password, ...nameParts] = entry.split("|");
      const email = (emailRaw || "").trim().toLowerCase();
      if (!email || !password) {
        console.warn(`Skipping malformed INITIAL_USERS entry: "${entry}"`);
        continue;
      }
      const nm = nameParts.join("|").trim() || email.split("@")[0];
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      await prisma.user.upsert({
        where: { email },
        create: { email, name: nm, passwordHash },
        update: { name: nm, passwordHash },
      });
      console.log(`Account ready: ${email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
