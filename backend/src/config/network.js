import dns from 'node:dns';
import net from 'node:net';

// Must run before mongoose/mongodb open sockets. Node 18+ Happy Eyeballs
// prefers IPv6 and stalls SRV lookups to Atlas from Vercel, which surfaces
// as `MongooseError: Operation X buffering timed out after 10000ms`.
dns.setDefaultResultOrder('ipv4first');
if (typeof net.setDefaultAutoSelectFamily === 'function') {
  net.setDefaultAutoSelectFamily(false);
}
