require('dotenv').config();

const mongoose = require('mongoose');
const {
  User,
  Hospital,
  BloodStock
} = require('../models');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Realistic stock levels for Ranchi hospitals
const STOCK_TEMPLATE = {
  'A+':  20,
  'A-':  8,
  'B+':  18,
  'B-':  6,
  'AB+': 10,
  'AB-': 4,
  'O+':  24,
  'O-':  7
};

// 20 Ranchi-based hospitals (real locations, realistic data)
const RANCHI_HOSPITALS = [
  {
    name: 'Rajendra Institute of Medical Sciences (RIMS)',
    type: 'hospital',
    registrationNumber: 'RAN-RIMS-001',
    street: 'RIMS Road, Booty Road',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834009',
    phone: '+916512255500',
    emergencyPhone: '+916512255911',
    coordinates: [85.3296, 23.3573],
    bloodStorageCapacity: 500
  },
  {
    name: 'Sadar Hospital Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-SADAR-002',
    street: 'Upper Bazar Road, Near Jail',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512330202',
    emergencyPhone: '+916512330911',
    coordinates: [85.3279, 23.3602],
    bloodStorageCapacity: 350
  },
  {
    name: 'Medanta The Medicity Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-MEDANTA-003',
    street: 'Pundag, Naya More',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834002',
    phone: '+916511800600',
    emergencyPhone: '+916511800999',
    coordinates: [85.3412, 23.3441],
    bloodStorageCapacity: 420
  },
  {
    name: 'Manipal Hospitals Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-MANIPAL-004',
    street: '1 Seraikela Road, Irba',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '835217',
    phone: '+916512322222',
    emergencyPhone: '+916512322911',
    coordinates: [85.3792, 23.3145],
    bloodStorageCapacity: 400
  },
  {
    name: 'Tata Main Hospital (TTPS) Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-TATA-005',
    street: 'Circular Road, Bistupur',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512303030',
    emergencyPhone: '+916512303999',
    coordinates: [85.3311, 23.3514],
    bloodStorageCapacity: 380
  },
  {
    name: 'Paras HMRI Hospital Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-PARAS-006',
    street: 'Nagpur Road, Doranda',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834002',
    phone: '+916512600400',
    emergencyPhone: '+916512600911',
    coordinates: [85.3176, 23.3378],
    bloodStorageCapacity: 370
  },
  {
    name: 'Orchid Medical Centre',
    type: 'hospital',
    registrationNumber: 'RAN-ORCHID-007',
    street: 'Lalpur Chowk, Lalpur',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512245000',
    emergencyPhone: '+916512245111',
    coordinates: [85.3359, 23.3681],
    bloodStorageCapacity: 280
  },
  {
    name: 'Columbia Asia Hospital Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-COLUMBIA-008',
    street: 'Ratu Road, Ratu',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834005',
    phone: '+916512413000',
    emergencyPhone: '+916512413999',
    coordinates: [85.2891, 23.3887],
    bloodStorageCapacity: 310
  },
  {
    name: 'Dhanwantari Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-DHANWANTARI-009',
    street: 'Main Road, Morabadi',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834008',
    phone: '+916512204444',
    emergencyPhone: '+916512204555',
    coordinates: [85.3209, 23.3741],
    bloodStorageCapacity: 250
  },
  {
    name: 'Ruban Memorial Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-RUBAN-010',
    street: 'P.O. Pandra, Ranchi-Patna National Highway',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '835217',
    phone: '+916512280000',
    emergencyPhone: '+916512280111',
    coordinates: [85.3631, 23.4012],
    bloodStorageCapacity: 300
  },
  {
    name: 'Shreya Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-SHREYA-011',
    street: 'Kanke Road, Near Kanke Dam',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834006',
    phone: '+916512270100',
    emergencyPhone: '+916512270200',
    coordinates: [85.3056, 23.4111],
    bloodStorageCapacity: 220
  },
  {
    name: 'Life Line Hospital Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-LIFELINE-012',
    street: 'Harmu Road, Harmu Colony',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834002',
    phone: '+916512237000',
    emergencyPhone: '+916512237100',
    coordinates: [85.2986, 23.3502],
    bloodStorageCapacity: 200
  },
  {
    name: 'Bokaro General Hospital (BGH)',
    type: 'hospital',
    registrationNumber: 'RAN-BGH-013',
    street: 'Sector 1, Chas Road',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834004',
    phone: '+916512249000',
    emergencyPhone: '+916512249911',
    coordinates: [85.3478, 23.3322],
    bloodStorageCapacity: 260
  },
  {
    name: 'Capital Hospital Ranchi',
    type: 'hospital',
    registrationNumber: 'RAN-CAPITAL-014',
    street: 'Station Road, Ranchi HQ',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512260000',
    emergencyPhone: '+916512260111',
    coordinates: [85.3221, 23.3460],
    bloodStorageCapacity: 240
  },
  {
    name: 'Apollo Clinic Ranchi',
    type: 'clinic',
    registrationNumber: 'RAN-APOLLO-015',
    street: 'Circular Road, Upper Bazar',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512277777',
    emergencyPhone: '+916512277788',
    coordinates: [85.3290, 23.3600],
    bloodStorageCapacity: 180
  },
  {
    name: 'Birsa Munda Institute of Technology Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-BMIT-016',
    street: 'BITM Campus, Dhurwa',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834004',
    phone: '+916512252100',
    emergencyPhone: '+916512252200',
    coordinates: [85.3140, 23.3267],
    bloodStorageCapacity: 230
  },
  {
    name: 'Primus Super Speciality Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-PRIMUS-017',
    street: 'Lalpur Road, Near Firayalal Chowk',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512255100',
    emergencyPhone: '+916512255111',
    coordinates: [85.3384, 23.3648],
    bloodStorageCapacity: 200
  },
  {
    name: 'Jana Swasthya Sahyog (JSS) Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-JSS-018',
    street: 'Ganiyari Village, Bilaspur Road',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834007',
    phone: '+916512234000',
    emergencyPhone: '+916512234100',
    coordinates: [85.3551, 23.3899],
    bloodStorageCapacity: 170
  },
  {
    name: 'Alam Nursing Home & Hospital',
    type: 'hospital',
    registrationNumber: 'RAN-ALAM-019',
    street: 'Hindpiri Road, Chutia',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834001',
    phone: '+916512241200',
    emergencyPhone: '+916512241300',
    coordinates: [85.3407, 23.3527],
    bloodStorageCapacity: 160
  },
  {
    name: 'Sevabharati Blood Bank & Hospital',
    type: 'blood_bank',
    registrationNumber: 'RAN-SEVABHARATI-020',
    street: 'Main Road, Doranda',
    city: 'Ranchi',
    state: 'Jharkhand',
    zipCode: '834002',
    phone: '+916512221500',
    emergencyPhone: '+916512221600',
    coordinates: [85.3196, 23.3401],
    bloodStorageCapacity: 400
  }
];

function buildStockUnits(bloodGroup, count, hospitalName) {
  return Array.from({ length: count }, (_, index) => {
    const collectedAt = new Date();
    collectedAt.setDate(collectedAt.getDate() - ((index % 10) + 2));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 20 + (index % 15));

    return {
      unitId: `${bloodGroup.replace('+', 'P').replace('-', 'N')}-${hospitalName.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
      bagNumber: `BAG-${String(index + 1).padStart(4, '0')}`,
      collectedAt,
      collectionCenter: hospitalName,
      testResults: {
        hiv: 'negative',
        hepatitisB: 'negative',
        hepatitisC: 'negative',
        syphilis: 'negative',
        malaria: 'negative',
        overallStatus: 'safe'
      },
      testedAt: collectedAt,
      testedBy: 'BloodConnect Seed',
      expiryDate,
      status: 'available',
      quality: 'good',
      volume: 450
    };
  });
}

async function upsertHospitalUser(seed, index) {
  const email = `ranchihospital${index + 1}@bloodconnect.in`;
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({
      email,
      phone: seed.phone,
      password: 'Hospital@123',
      firstName: `Hospital${index + 1}`,
      lastName: 'Manager',
      role: 'hospital',
      isVerified: true,
      isActive: true,
      address: {
        street: seed.street,
        city: seed.city,
        state: seed.state,
        country: 'India',
        zipCode: seed.zipCode
      },
      location: {
        type: 'Point',
        coordinates: seed.coordinates
      }
    });
  } else {
    user.phone = seed.phone;
    user.password = 'Hospital@123';
    user.firstName = `Hospital${index + 1}`;
    user.lastName = 'Manager';
    user.role = 'hospital';
    user.isVerified = true;
    user.isActive = true;
    user.isBlocked = false;
    user.address = {
      street: seed.street,
      city: seed.city,
      state: seed.state,
      country: 'India',
      zipCode: seed.zipCode
    };
    user.location = {
      type: 'Point',
      coordinates: seed.coordinates
    };
  }

  await user.save();
  return user;
}

async function upsertHospital(seed, user) {
  let hospital = await Hospital.findOne({
    $or: [
      { user: user._id },
      { registrationNumber: seed.registrationNumber },
      { email: user.email }
    ]
  });

  if (!hospital) {
    hospital = new Hospital({
      user: user._id,
      name: seed.name,
      type: seed.type,
      registrationNumber: seed.registrationNumber,
      email: user.email,
      phone: seed.phone,
      emergencyPhone: seed.emergencyPhone,
      address: {
        street: seed.street,
        city: seed.city,
        state: seed.state,
        country: 'India',
        zipCode: seed.zipCode
      },
      location: {
        type: 'Point',
        coordinates: seed.coordinates
      },
      hasBloodBank: true,
      hasDonationCenter: true,
      isVerified: true,
      isActive: true,
      bloodStorageCapacity: seed.bloodStorageCapacity
    });
  } else {
    hospital.user = user._id;
    hospital.name = seed.name;
    hospital.type = seed.type;
    hospital.registrationNumber = seed.registrationNumber;
    hospital.email = user.email;
    hospital.phone = seed.phone;
    hospital.emergencyPhone = seed.emergencyPhone;
    hospital.address = {
      street: seed.street,
      city: seed.city,
      state: seed.state,
      country: 'India',
      zipCode: seed.zipCode
    };
    hospital.location = {
      type: 'Point',
      coordinates: seed.coordinates
    };
    hospital.hasBloodBank = true;
    hospital.hasDonationCenter = true;
    hospital.isVerified = true;
    hospital.isActive = true;
    hospital.bloodStorageCapacity = seed.bloodStorageCapacity;
  }

  await hospital.save();
  return hospital;
}

async function seedHospitalStocks(hospital, hospitalSeed) {
  for (const bloodGroup of BLOOD_GROUPS) {
    const unitCount = STOCK_TEMPLATE[bloodGroup] || 5;
    const stockPayload = {
      hospital: hospital._id,
      bloodGroup,
      component: 'whole_blood',
      minThreshold: 5,
      criticalThreshold: 2,
      maxCapacity: Math.max(50, hospitalSeed.bloodStorageCapacity || 100),
      units: buildStockUnits(bloodGroup, unitCount, hospitalSeed.name)
    };

    const existingStock = await BloodStock.findOne({
      hospital: hospital._id,
      bloodGroup,
      component: 'whole_blood'
    });

    if (!existingStock) {
      await BloodStock.create(stockPayload);
      continue;
    }

    existingStock.minThreshold = stockPayload.minThreshold;
    existingStock.criticalThreshold = stockPayload.criticalThreshold;
    existingStock.maxCapacity = stockPayload.maxCapacity;
    existingStock.units = stockPayload.units;
    await existingStock.save();
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from .env');
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  console.log(`\n🏥 Seeding ${RANCHI_HOSPITALS.length} Ranchi hospitals...\n`);

  for (let index = 0; index < RANCHI_HOSPITALS.length; index++) {
    const hospitalSeed = RANCHI_HOSPITALS[index];
    process.stdout.write(`  [${index + 1}/${RANCHI_HOSPITALS.length}] ${hospitalSeed.name}... `);

    const user = await upsertHospitalUser(hospitalSeed, index);
    const hospital = await upsertHospital(hospitalSeed, user);
    await seedHospitalStocks(hospital, hospitalSeed);

    console.log('✅');
  }

  console.log('\n🎉 Ranchi hospitals seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Emails : ranchihospital1@bloodconnect.in → ranchihospital20@bloodconnect.in');
  console.log('   Password: Hospital@123\n');

  RANCHI_HOSPITALS.forEach((h, i) => {
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${h.name} — ranchihospital${i + 1}@bloodconnect.in`);
  });

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB. Done!');
}

main().catch(async (error) => {
  console.error('\n❌ Ranchi hospital seed failed:', error?.message || error);
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
