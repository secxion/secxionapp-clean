import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);
const resolve4 = promisify(dns.resolve4);

async function testDNS() {
  try {
    console.log('🔍 Testing DNS resolution...\n');
    
    // Test SRV record (what mongoose needs)
    console.log('1️⃣  Trying SRV lookup: _mongodb._tcp.bm12.qdh9mrh.mongodb.net');
    try {
      const srvRecords = await resolveSrv('_mongodb._tcp.bm12.qdh9mrh.mongodb.net');
      console.log('   ✅ SRV Records found:', srvRecords.length);
      srvRecords.forEach(r => console.log(`      - ${r.name}:${r.port}`));
    } catch(err) {
      console.log('   ❌ SRV lookup failed:', err.code);
    }
    
    // Test A record (direct hostname)
    console.log('\n2️⃣  Trying A record lookup: bm12.qdh9mrh.mongodb.net');
    try {
      const aRecords = await resolve4('bm12.qdh9mrh.mongodb.net');
      console.log('   ✅ A Records found:', aRecords);
    } catch(err) {
      console.log('   ❌ A lookup failed:', err.code);
    }
    
    // Try with Google DNS
    console.log('\n3️⃣  Trying with Google DNS (8.8.8.8)...');
    dns.setServers(['8.8.8.8']);
    try {
      const srvRecords = await resolveSrv('_mongodb._tcp.bm12.qdh9mrh.mongodb.net');
      console.log('   ✅ SRV Records with Google DNS:', srvRecords.length);
      srvRecords.forEach(r => console.log(`      - ${r.name}:${r.port}`));
    } catch(err) {
      console.log('   ❌ Google DNS lookup failed:', err.code);
    }
    
  } catch(err) {
    console.error('Error:', err);
  }
}

testDNS();
