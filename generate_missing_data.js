import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current real_data.json
const dataPath = path.join(__dirname, 'data', 'real_data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const currentData = JSON.parse(rawData);

console.log('Current data keys:', Object.keys(currentData));

// Generate data from stickers
const stickers = currentData.stickers || [];

// Generate units from stickers
const units = stickers.map((sticker, index) => {
  const data = sticker.data || {};
  const unitNumber = data['الشقة'] || data['الوحدة'] || '';
  const buildingName = data['المبنى'] || '';
  const fullUnitNumber = unitNumber && buildingName ? `${buildingName}-${unitNumber}` : `Unit-${index + 1}`;
  
  return {
    id: `unit-${index + 1}`,
    unitNumber: fullUnitNumber,
    buildingName: buildingName,
    ownerName: data['اسم الساكن'] || '',
    phoneNumber: data['رقم الهوية'] || '',
    stickerId: sticker.id,
    isOccupied: true,
    numberOfResidents: 1,
    createdAt: data['تاريخ الإصدار'] || new Date().toISOString()
  };
});

// Generate residents from stickers
const residents = stickers.map((sticker, index) => {
  const data = sticker.data || {};
  const unitNumber = data['الشقة'] || data['الوحدة'] || '';
  const buildingName = data['المبنى'] || '';
  const fullUnitNumber = unitNumber && buildingName ? `${buildingName}-${unitNumber}` : `Unit-${index + 1}`;
  
  return {
    id: `resident-${index + 1}`,
    name: data['اسم الساكن'] || '',
    phoneNumber: data['رقم الهوية'] || '',
    unitId: `unit-${index + 1}`,
    unitNumber: fullUnitNumber,
    buildingName: buildingName,
    stickerId: sticker.id,
    createdAt: data['تاريخ الإصدار'] || new Date().toISOString()
  };
});

// Generate buildings from unique building names in stickers
const buildingNames = [...new Set(stickers.map(s => {
  const data = s.data || {};
  return data['المبنى'] || '';
}).filter(name => name !== ''))];

const buildings = buildingNames.map((name, index) => {
  const buildingStickers = stickers.filter(s => {
    const data = s.data || {};
    return data['المبنى'] === name;
  });
  return {
    id: `building-${index + 1}`,
    name: name,
    totalUnits: buildingStickers.length,
    occupiedUnits: buildingStickers.length,
    createdAt: new Date().toISOString()
  };
});

// Generate parking data from stickers
const parking = stickers.map((sticker, index) => {
  const data = sticker.data || {};
  const unitNumber = data['الشقة'] || data['الوحدة'] || '';
  const buildingName = data['المبنى'] || '';
  const fullUnitNumber = unitNumber && buildingName ? `${buildingName}-${unitNumber}` : `Unit-${index + 1}`;
  
  return {
    id: `parking-${index + 1}`,
    parkingNumber: data['رقم للوحة السيارة'] || `P-${index + 1}`,
    unitId: `unit-${index + 1}`,
    unitNumber: fullUnitNumber,
    buildingName: buildingName,
    ownerName: data['اسم الساكن'] || '',
    vehicleType: data['نوع المركبة'] || '',
    stickerId: sticker.id,
    createdAt: data['تاريخ الإصدار'] || new Date().toISOString()
  };
});

// Generate statistics
const statistics = {
  totalUnits: units.length,
  occupiedUnits: units.filter(u => u.isOccupied).length,
  vacantUnits: units.filter(u => !u.isOccupied).length,
  totalResidents: residents.length,
  totalBuildings: buildings.length,
  totalParking: parking.length,
  totalStickers: stickers.length,
  lastUpdated: new Date().toISOString()
};

// Combine all data
const completeData = {
  stickers: stickers,
  units: units,
  residents: residents,
  buildings: buildings,
  parking: parking,
  statistics: statistics
};

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(completeData, null, 2), 'utf8');

console.log('✅ Successfully generated missing data structures:');
console.log(`- Units: ${units.length}`);
console.log(`- Residents: ${residents.length}`);
console.log(`- Buildings: ${buildings.length}`);
console.log(`- Parking: ${parking.length}`);
console.log(`- Statistics: ${Object.keys(statistics).length} fields`);
console.log(`- Stickers: ${stickers.length} (preserved)`);
