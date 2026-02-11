import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PublicKey } from 'npm:@solana/web3.js@1.95.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return Response.json(
        { valid: false, error: 'Address required and must be a string' },
        { status: 400 }
      );
    }

    try {
      // Throws if invalid
      const pubkey = new PublicKey(address);
      
      // Verify it's a valid on-curve public key
      if (!PublicKey.isOnCurve(pubkey.toBytes())) {
        return Response.json({ valid: false, error: 'Invalid Solana public key' }, { status: 400 });
      }

      return Response.json({
        valid: true,
        address: pubkey.toString(),
        isSystemAccount: pubkey.equals(new PublicKey('11111111111111111111111111111111')),
        length: address.length
      });
    } catch (e) {
      return Response.json(
        { valid: false, error: 'Invalid Solana address format' },
        { status: 400 }
      );
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});