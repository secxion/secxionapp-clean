import fs from 'fs';
import path from 'path';

const routeKeys = [
  'LOGIN',
  'SIGN_UP',
  'HOME',
  'SECTION',
  'USER_MARKET_UPLOAD',
  'RECORD',
  'PRODUCT_CATEGORY',
  'PRODUCT_DETAILS',
  'SEARCH',
  'MYPROFILE',
  'PROFILE',
  'SETTINGS',
  'REPORT',
  'REPORT_DETAILS',
  'DATAPAD',
  'ROOM',
  'WALLET_DASHBOARD',
  'NOTIFICATIONS',
  'CHAT',
  'BUZZ',
  'ETH',
  'ADMIN_PANEL',
  'ALL_USERS',
  'ALL_PRODUCTS',
  'USERS_MARKET',
  'USERS_DATAPAD',
  'BLOG_MANAGEMENT',
  'ADMIN_REPORT',
  'ADMIN_RPR',
  'ANONYMOUS_REPORT',
  'ADMIN_COMMUNITY',
  'ADMIN_ETH',
  'LANDING',
  'CONTACT_US',
  'ABOUT_US',
  'TERMS',
  'PRIVACY',
  'VERIFY_EMAIL',
  'RESET',
  'NOT_FOUND',
];

function randomSlug() {
  const rand = () => Math.random().toString(36).substring(2, 8);
  return `${rand()}-${rand()}`;
}

const outputPath = path.join('src', 'constants', 'routes.js');

let fileContent = `// AUTO-GENERATED ROUTES\nexport const Routes = {\n`;

routeKeys.forEach((key) => {
  if (key === 'LANDING') {
    fileContent += `  ${key}: "/",\n`;
  } else if (['PRODUCT_DETAILS', 'REPORT_DETAILS', 'CHAT'].includes(key)) {
    let dynamic =
      key === 'PRODUCT_DETAILS'
        ? 'product/:id'
        : key === 'REPORT_DETAILS'
          ? 'reports/:reportId'
          : 'chat/:reportId';
    fileContent += `  ${key}: "${dynamic}",\n`;
  } else if (key === 'NOT_FOUND') {
    fileContent += `  ${key}: "*",\n`;
  } else {
    fileContent += `  ${key}: "${randomSlug()}",\n`;
  }
});

fileContent += `};\n`;

fs.writeFileSync(outputPath, fileContent);
console.log('✅ Route aliases updated in routes.js');
