import { supabase } from './lib/supabase';

// Live video, browser to browser. The seller's camera goes straight to each
// buyer over WebRTC; Supabase Realtime only carries the handshake (offer,
// answer, network candidates) on a channel named after the live. Nothing is
// recorded or relayed through a server.
//
// One connection per viewer from the seller's device, so it suits a seller
// showing stock to a handful of buyers, not a broadcast to thousands. Public
// STUN finds a direct route; on the rare network that blocks every direct
// route (no TURN relay here), a viewer won't get video.

const ICE: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];

type Sdp = { type: RTCSdpType; sdp: string };
const plain = (d: RTCSessionDescription | null): Sdp | null => (d ? { type: d.type, sdp: d.sdp } : null);

/** Whether this device can do live video (a browser with a camera API). */
export const canStream = () =>
  typeof window !== 'undefined' &&
  typeof (globalThis as any).RTCPeerConnection === 'function' &&
  !!(globalThis as any).navigator?.mediaDevices?.getUserMedia;

/** The back camera where there is one, with sound. */
export const openCamera = () =>
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });

/** Seller: send the camera to every buyer who joins. */
export function broadcast(liveId: string, stream: MediaStream, onViewers: (n: number) => void) {
  const peers = new Map<string, RTCPeerConnection>();
  const channel = supabase.channel(`live-${liveId}`, { config: { broadcast: { self: false } } });
  const send = (event: string, payload: Record<string, unknown>) => channel.send({ type: 'broadcast', event, payload });

  const count = () => {
    onViewers(peers.size);
    send('count', { n: peers.size });
  };
  const drop = (viewer: string) => {
    const pc = peers.get(viewer);
    if (!pc) return;
    pc.close();
    peers.delete(viewer);
    count();
  };

  channel
    .on('broadcast', { event: 'join' }, async ({ payload }) => {
      const viewer = String(payload.viewer);
      drop(viewer); // a viewer joining again starts over
      const pc = new RTCPeerConnection({ iceServers: ICE });
      peers.set(viewer, pc);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate) send('ice', { viewer, from: 'seller', candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') drop(viewer);
      };
      await pc.setLocalDescription(await pc.createOffer());
      send('offer', { viewer, sdp: plain(pc.localDescription) });
      count();
    })
    .on('broadcast', { event: 'answer' }, async ({ payload }) => {
      const pc = peers.get(String(payload.viewer));
      if (pc && !pc.currentRemoteDescription) await pc.setRemoteDescription(payload.sdp as Sdp);
    })
    .on('broadcast', { event: 'ice' }, async ({ payload }) => {
      if (payload.from !== 'viewer') return;
      await peers.get(String(payload.viewer))?.addIceCandidate(payload.candidate).catch(() => {});
    })
    .on('broadcast', { event: 'leave' }, ({ payload }) => drop(String(payload.viewer)))
    .subscribe((status) => {
      // Anyone who opened the page before the seller connected joins now.
      if (status === 'SUBSCRIBED') send('hello', {});
    });

  return {
    stop: () => {
      send('end', {});
      peers.forEach((pc) => pc.close());
      peers.clear();
      supabase.removeChannel(channel);
    },
  };
}

/** Buyer: receive a seller's camera. */
export function watch(
  liveId: string,
  on: { stream: (s: MediaStream) => void; viewers: (n: number) => void; ended: () => void }
) {
  const viewer = Math.random().toString(36).slice(2);
  const channel = supabase.channel(`live-${liveId}`, { config: { broadcast: { self: false } } });
  const send = (event: string, payload: Record<string, unknown>) => channel.send({ type: 'broadcast', event, payload });
  let pc: RTCPeerConnection | null = null;
  let early: RTCIceCandidateInit[] = [];

  const join = () => send('join', { viewer });

  channel
    .on('broadcast', { event: 'offer' }, async ({ payload }) => {
      if (payload.viewer !== viewer) return;
      pc?.close();
      const conn = new RTCPeerConnection({ iceServers: ICE });
      pc = conn;
      conn.ontrack = (e) => on.stream(e.streams[0]);
      conn.onicecandidate = (e) => {
        if (e.candidate) send('ice', { viewer, from: 'viewer', candidate: e.candidate.toJSON() });
      };
      await conn.setRemoteDescription(payload.sdp as Sdp);
      for (const c of early) await conn.addIceCandidate(c).catch(() => {});
      early = [];
      await conn.setLocalDescription(await conn.createAnswer());
      send('answer', { viewer, sdp: plain(conn.localDescription) });
    })
    .on('broadcast', { event: 'ice' }, async ({ payload }) => {
      if (payload.viewer !== viewer || payload.from !== 'seller') return;
      const c = payload.candidate as RTCIceCandidateInit;
      if (pc?.remoteDescription) await pc.addIceCandidate(c).catch(() => {});
      else early.push(c);
    })
    .on('broadcast', { event: 'hello' }, join)
    .on('broadcast', { event: 'count' }, ({ payload }) => on.viewers(Number(payload.n) || 0))
    .on('broadcast', { event: 'end' }, () => on.ended())
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') join();
    });

  return {
    stop: () => {
      send('leave', { viewer });
      pc?.close();
      supabase.removeChannel(channel);
    },
  };
}
