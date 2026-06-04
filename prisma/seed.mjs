import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const H = "High";
const M = "Medium";

// [student, city, name, address, phone, priority]
const sites = [
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Specialty MRI", "8026 Floyd Curl Dr, San Antonio 78229", "(210) 617-9000", H],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Medical Center Tower I", "7950 Floyd Curl Dr, Ste 200, San Antonio 78229", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Medical Drive Imaging", "4458 Medical Dr, 3rd Fl, San Antonio 78229", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Northwest Imaging", "4383 Medical Dr, Ste 150, San Antonio 78229", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Landmark Imaging", "5510-B Presidio Pkwy, Ste 2201, San Antonio 78249", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Hardy Oak Imaging", "18707 Hardy Oak Blvd, Ste 100, San Antonio 78258", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – North Central Imaging", "155 Sonterra Blvd, Ste 100, San Antonio 78258", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Mariposa (Westover Hills)", "5126 W Loop 1604 N, Ste 211, San Antonio 78251", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Westover Hills Imaging", "5715 Rogers Rd, San Antonio 78251", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Metropolitan Imaging", "1200 Brooklyn Ave, Ste 100, San Antonio 78212", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Orthopedic Imaging", "21 Spurs Lane, Ste 140, San Antonio 78240", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Southwest Imaging", "7910 Barlite Blvd, San Antonio 78224", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Kitty Hawk Imaging", "7898 Kitty Hawk Rd, Converse 78109", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "STRIC – Schertz Imaging", "5000 Schertz Pkwy, Ste 500, Schertz 78154", "(210) 617-9000", M],
  ["Margaret Ampomah", "San Antonio, TX", "Paesanos Parkway Imaging", "3603 Paesanos Pkwy #110, San Antonio 78231", "(210) 479-1966", H],
  ["Margaret Ampomah", "San Antonio, TX", "Baptist M&S Imaging – Medical Center", "8435 Wurzbach Rd, Ste 109, San Antonio 78229", "(210) 692-9824", M],
  ["Margaret Ampomah", "San Antonio, TX", "Gonzaba Medical Group – Main Medical Center", "720 Pleasanton Rd, San Antonio 78214", "(210) 921-3800", M],
  ["Margaret Ampomah", "San Antonio, TX", "University Health – Imaging (University Hospital)", "4502 Medical Dr, San Antonio 78229", "(210) 358-2725", M],
  ["Margaret Ampomah", "San Antonio, TX", "CHRISTUS Santa Rosa – Westover Hills", "11212 State Hwy 151, San Antonio 78251", "(210) 703-8100", M],
  ["Lidia Kelati", "Charlotte, NC", "Southern Imaging Services (SIS)", "7506 E Independence Blvd, Ste 123, Charlotte 28227", "(704) 321-4798", H],
  ["Lidia Kelati", "Charlotte, NC", "Carolina Neurosurgery & Spine (open MRI)", "225 Baldwin Ave, Charlotte 28204", "(704) 376-1605", H],
  ["Lidia Kelati", "Charlotte, NC", "CaroMont Regional Medical Center", "2525 Court Dr, Gastonia 28054", "(704) 671-5300", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging SouthPark", "6324 Fairview Rd, Charlotte 28210", "(704) 362-8444", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Steele Creek", "13557 Steelecroft Pkwy, Ste 1100, Charlotte 28278", "(704) 316-2880", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Museum/Eastover", "2900 Randolph Rd, Charlotte 28211", "(704) 384-7140", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Imaging – Charlotte Orthopedic Hosp.", "1901 Randolph Rd, Charlotte 28207", "(704) 316-1411", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Imaging – Mint Hill Medical Center", "8201 Healthcare Loop, Charlotte 28215", "(980) 302-3000", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging Ballantyne", "14215 Ballantyne Corporate Pl, Ste 140, Charlotte 28277", "(704) 384-1890", M],
  ["Lidia Kelati", "Charlotte, NC", "Novant Health Imaging University City", "8401 Medical Plaza Dr, Ste 110, Charlotte 28262", "(704) 384-1580", M],
  ["Lars Swanson", "Minneapolis, MN", "Hennepin Healthcare – HCMC Main", "715 South 8th St, Minneapolis 55404", "(612) 873-6963", H],
  ["Lars Swanson", "Minneapolis, MN", "Hennepin Healthcare – Whittier Imaging", "2810 Nicollet Ave, Minneapolis 55408", "(612) 873-6963", H],
  ["Lars Swanson", "Minneapolis, MN", "Noran Neurology – Bloomington Imaging", "3601 Minnesota Dr, Bloomington 55435", "(612) 879-1549", H],
  ["Lars Swanson", "Minneapolis, MN", "Summit Orthopedics – Eagan", "2620 Eagan Woods Dr, Eagan 55121", "(651) 968-5201", M],
  ["Lars Swanson", "Minneapolis, MN", "Summit Orthopedics – Plymouth", "6050 Sycamore Ln N, Plymouth 55442", "(651) 968-5201", M],
  ["Lars Swanson", "Minneapolis, MN", "Summit Orthopedics – Vadnais Heights", "3580 Arcade St S, Vadnais Heights 55127", "(651) 968-5201", M],
  ["Lars Swanson", "Minneapolis, MN", "Summit Orthopedics – Woodbury", "2090 Woodwinds Dr, Woodbury 55125", "(651) 968-5201", M],
  ["Lars Swanson", "Minneapolis, MN", "TRIA Orthopedics – Bloomington", "8100 Northland Dr, Bloomington 55431", "(952) 831-8742", M],
  ["Lars Swanson", "Minneapolis, MN", "TRIA Orthopedics – Woodbury", "155 Radio Dr, Woodbury 55125", "(952) 831-8742", M],
  ["Lars Swanson", "Minneapolis, MN", "Children's Minnesota – Minneapolis (pediatric)", "2525 Chicago Ave S, Minneapolis 55404", "(612) 874-5399", M],
];

async function main() {
  let i = 0;
  for (const [student, city, name, address, phone, priority] of sites) {
    const order = i++;
    await prisma.site.upsert({
      where: { order },
      create: { order, student, city, name, address, phone, priority },
      update: { student, city, name, address, phone, priority },
    });
  }
  console.log(`Seeded ${sites.length} sites.`);

  // Optionally create/refresh accounts from the INITIAL_USERS env var.
  // Format: "email|Password|Full Name" entries separated by ; or newline.
  // Example: sona@x.com|Temp123!|Sona Shastri;taylor@x.com|Temp123!|Taylor Lee
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
      const name = nameParts.join("|").trim() || email.split("@")[0];
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      await prisma.user.upsert({
        where: { email },
        create: { email, name, passwordHash },
        update: { name, passwordHash },
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
